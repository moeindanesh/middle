import {
  RtcConnectionStateType,
  RtcPeer,
  RtcSignalData,
  RtcTracksConfig,
} from '@middle/earth/utils/rtc-peer'
import { UserData } from '@middle/orthanc/model/types'
import { Draft } from 'immer'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useImmerReducer } from 'use-immer'
import { useLatest } from './use-latest'

export type RtcPeersManager = {
  rtcState: RtcState
  dispatch: React.Dispatch<RtcAction>
  onSignal: (userId: string, signal: string) => void
}

export const useRtcPeers = ({
  callId,
  currentUser,
  broadcastSignal,
  participants,
}: Props) => {
  let [state, dispatch] = useImmerReducer<RtcState, RtcAction>(
    rtcReducer,
    initialRtcState,
  )

  const rtcStateRef: { current: RtcState | undefined } = useLatest(state)

  let [screenStream, setScreenStream] = useState<MediaStream | undefined>(
    undefined,
  )

  // get screen stream
  const getScreenStream = () => {
    navigator.mediaDevices
      //@ts-ignore
      .getDisplayMedia({
        video: true,
        audio: false,
      })
      .then((stream: MediaStream) => {
        setScreenStream(stream)
      })
      .catch(error => {
        console.error(error)
      })
  }
  useEffect(() => {
    if (!state.weSharingScreen) return
    getScreenStream()
  }, [state.weSharingScreen])

  // stop screen stream
  useEffect(() => {
    if (state.weSharingScreen) return
    if (!screenStream) return

    screenStream.getTracks().forEach(track => track.stop())
    setScreenStream(undefined)
  }, [screenStream, state.weSharingScreen])

  const getStreamForUser = useCallback(() => {
    let tracksMap: RtcTracksConfig<TrackName> = new Map([
      ['screen', { kind: 'video', track: null, streamKey: 'screen' }],
    ])

    let screenTracks
    let _ScreenStream

    if (screenStream) {
      screenTracks = screenStream.getVideoTracks()[0]
      _ScreenStream = new MediaStream([screenTracks])
      tracksMap.set('screen', {
        kind: 'video',
        track: screenTracks,
        streamKey: 'screen',
      })
    }

    return { tracksMap, screenStream: _ScreenStream, screenTracks }
  }, [screenStream])

  const createPeer = useCallback(
    ({
      userId,
      participant,
      receivedOffer,
    }: {
      userId: string | undefined
      participant: UserData
      receivedOffer?: boolean
    }): { peer: RtcPeerType | undefined } => {
      if (!currentUser) {
        console.warn(
          '[use-rtc-peers] [createPeer] currentUser is not available',
        )
        return { peer: undefined }
      }

      if (!userId) {
        console.warn('[use-rtc-peers] [createPeer] userId not available')
        return { peer: undefined }
      }

      let _participant = participant || participants[userId]
      if (!_participant) {
        return { peer: undefined }
      }

      let isPolitePeer = !getIsFirstJoined(currentUser.time, _participant.time)
      let isOfferer = getIsFirstJoined(currentUser.time, _participant.time)

      let { tracksMap } = getStreamForUser()

      let peer = new RtcPeer({
        tracks: tracksMap,
        polite: isPolitePeer,
        initialOfferer: isOfferer,
      })

      if (!peer) {
        return { peer: undefined }
      }

      console.warn('[createPeer] new peer created')
      dispatch({
        type: 'new peer created',
        userId,
        receivedOffer,
        peer,
        isPolitePeer,
      })

      return { peer }
    },
    [currentUser, dispatch, getStreamForUser, participants],
  )

  /**
   * Start a call
   */

  useEffect(() => {
    if (!callId) {
      return
    }

    dispatch({ type: 'started', callId })

    return () => {
      dispatch({
        type: 'ended',
        callId,
      })
    }
  }, [callId, dispatch])

  /**
   * Add participants to call
   */
  useEffect(() => {
    if (!callId) {
      console.warn('[Add participants to call] callId is not available', {
        callId,
      })
      return
    }

    if (!currentUser) {
      console.warn('[Add participants to call] currentUser is not available', {
        currentUser,
      })
      return
    }

    // add check connectivity

    for (let userId of Object.keys(participants)) {
      if (userId === currentUser.id) {
        continue
      }
      console.log('Add participants to call')

      let participant = participants[userId]

      let participantState =
        rtcStateRef.current?.participants &&
        rtcStateRef.current.participants[userId]
      if (participantState?.peer && participantState.peerState !== 'closed') {
        continue
      }

      createPeer({ userId, participant })
    }
  }, [callId, createPeer, currentUser, participants, rtcStateRef])

  /**
   * Data channel
   */

  const sendToParticipant = (
    participant: Participant,
    data: DataChannelPortocol,
  ) => {
    if (
      !participant ||
      !participant.peer ||
      participant.peer.state !== 'connected'
    ) {
      console.warn('[sendToParticipant] participant is not ready')
      return false
    }

    try {
      participant.peer.sendJson(data)
      return true
    } catch (error) {
      console.error('[sendToParticipant]', { error })
      return false
    }
  }

  const sendToAll = useCallback(
    (data: DataChannelPortocol) => {
      let participants = state.participants
      for (let userId of Object.keys(participants)) {
        let participant = participants[userId]
        if (!participant) continue
        sendToParticipant(participant, data)
      }
    },
    [state.participants],
  )

  /**
   * participants deck
   */

  // sharing screen state changed
  useEffect(() => {
    if (typeof state.weSharingScreen === 'undefined') return
    if (!currentUser) return

    let data: DataChannelPortocol = {
      type: 'sharing screen changed',
      state: state.weSharingScreen,
      userId: currentUser.id,
    }
    sendToAll(data)
  }, [currentUser, sendToAll, state.weSharingScreen])

  /**
   * Attach event handlers to peer
   */

  const attachPeerEventHandlers = useCallback(
    (eventContext: PeerEventContext) => {
      console.log('[attachPeerEventHandlers]')
      const userId = eventContext.userId
      const peer = eventContext.peer

      const handleData = (rawData: string) => {
        let data: DataChannelPortocol = JSON.parse(rawData)
        switch (data.type) {
          case 'sharing screen changed':
            dispatch({
              type: 'participant sharing screen changed',
              state: data.state,
              userId: data.userId,
            })
        }
      }

      const handleDataOpen = () => {
        console.info('[handleDataOpen]')
      }

      const handleTrack = (event: RTCTrackEvent) => {
        let track = event.track
        let stream = new MediaStream([track])
        if (track.kind === 'video') {
          dispatch({ type: 'got track', userId, kind: 'screen', stream })
        }
      }

      const handleError = () => {
        console.log('[handleError]')
      }

      const handleConnectionStateChange = (state: RtcConnectionStateType) => {
        console.log('[handleConnectionStateChange]', state)
        dispatch({ type: 'peer state changed', userId, state })
      }

      const handleSignal = (signalData: RtcSignalData) => {
        broadcastSignal(userId, JSON.stringify(signalData.signal))
      }

      peer.addListener('track', handleTrack)
      peer.addListener('signal', handleSignal)
      peer.addListener('data', handleData)
      peer.addListener('dataOpen', handleDataOpen)
      peer.addListener('error', handleError)
      peer.addListener('connectionStateChange', handleConnectionStateChange)

      return () => {
        peer.removeListener('track', handleTrack)
        peer.removeListener('signal', handleSignal)
        peer.removeListener('data', handleData)
        peer.removeListener('dataOpen', handleDataOpen)
        peer.removeListener('error', handleError)
        peer.removeListener(
          'connectionStateChange',
          handleConnectionStateChange,
        )
      }
    },
    [broadcastSignal, dispatch],
  )

  const currentParticipants = useMemo(() => Object.values(state.participants), [
    state.participants,
  ])

  const currentParticipantsRef = useLatest(currentParticipants)

  let peerNumbers = useMemo(() => {
    let count = 0

    for (let participant of currentParticipants) {
      if (participant.peer) count++
    }

    return {
      count,
    }
  }, [currentParticipants])

  let peersCount = peerNumbers.count

  useEffect(() => {
    if (!rtcStateRef.current) return

    const removeListenersFunctions = new Set<() => void>()

    for (let participant of Object.values(rtcStateRef.current.participants)) {
      if (!participant?.peer) return
      if (!participant.userId) return

      console.log('attached', participant)

      let removeListener = attachPeerEventHandlers({
        peer: participant.peer,
        userId: participant.userId,
      })

      removeListenersFunctions.add(removeListener)
    }

    return () => {
      for (let removeListeners of removeListenersFunctions) {
        removeListeners()
      }
    }
  }, [attachPeerEventHandlers, rtcStateRef, peersCount])

  const addStreams = useCallback(
    ({
      participant,
      stream,
    }: {
      participant: Participant
      stream: MediaStream
    }) => {
      if (!participant || !participant.peer) return
      if (!stream) return

      let { peer, userId } = participant
      let weSharingScreen = state.weSharingScreen

      if (weSharingScreen) {
        let videoTracks = stream.getVideoTracks()[0]
        peer.setTrack('screen', videoTracks)
      } else {
        peer.replaceTrack('screen', null)
      }
    },
    [state.weSharingScreen],
  )

  // add screen stream
  useEffect(() => {
    if (!screenStream) return

    for (let participant of currentParticipantsRef.current || []) {
      addStreams({ participant, stream: screenStream })
    }
  }, [addStreams, currentParticipantsRef, screenStream, state.weSharingScreen])

  return {
    onSignal: useCallback(
      (userId, signal) => {
        let state = rtcStateRef.current
        if (!state) {
          return
        }

        console.log('%csetting remoteSignal', 'color:red')
        state.participants[userId]?.peer?.setRemoteSignal({
          signal: JSON.parse(signal),
        })
      },
      [rtcStateRef],
    ),
    rtcState: state,
    dispatch,
  }
}

/**
 * Helpers
 */

function getIsFirstJoined(weTime: string, pTime: string) {
  let participantJoinedTime = new Date(pTime).getTime()
  let ourJoinedTime = new Date(weTime).getTime()

  return ourJoinedTime < participantJoinedTime
}

/**
 * Declaration
 */

interface Props {
  callId: string
  currentUser: UserData | undefined
  broadcastSignal: (recipientId: string, signal: string) => void
  participants: Record<string, UserData>
}

export interface RtcCallManager {
  rtcState: RtcState
  dispatch: React.Dispatch<RtcAction>
}

export type PeerEventContext = {
  peer: RtcPeerType
  userId: string
  // streamsRef: { current: StreamsObject | undefined }
  // sendToAll: (data: DataType) => number
  // sendToUser: (userId: string, data: DataType) => boolean
}

type TrackName = 'screen'

type RtcPeerType = RtcPeer<TrackName>

export interface RtcState {
  callId: string | undefined
  participants: {
    [userId: string]: Participant
  }

  weSharingScreen?: boolean
}

export const initialRtcState: RtcState = {
  callId: undefined,
  participants: {},
}

export type RtcAction =
  | {
      type: 'started'
      callId: string
    }
  | {
      type: 'ended'
      callId: string
    }
  | {
      type: 'new peer created'
      userId: string
      peer?: RtcPeerType
      isPolitePeer?: boolean
      receivedOffer?: boolean
    }
  | {
      type: 'someone joined'
      userId: string
    }
  | {
      type: 'peer state changed'
      userId: string
      state: RtcConnectionStateType
    }
  | {
      type: 'sharing screen started'
    }
  | {
      type: 'sharing screen stopped'
    }
  | {
      type: 'participant sharing screen changed'
      userId: string
      state: boolean
    }
  | {
      type: 'got track'
      userId: string
      kind: 'screen'
      stream: MediaStream
    }

interface Participant {
  peerState?: RtcConnectionStateType
  peer?: RtcPeerType | undefined
  userId: string | undefined
  joinTime: string
  isSharingScreen?: boolean

  screenStream?: MediaStream | undefined
}

function rtcReducer(
  draft: Draft<RtcState>,
  action: RtcAction,
): void | RtcState {
  switch (action.type) {
    case 'started':
      let callId = action.callId
      return {
        ...initialRtcState,
        callId,
      }
      break
    case 'ended':
      return {
        ...initialRtcState,
      }
      break
    case 'new peer created':
      let oldParticipantIds = Object.keys(draft.participants)
      for (let participantId of oldParticipantIds) {
        delete draft.participants[participantId]
      }

      // create new participant
      draft.participants[action.userId] = {
        userId: action.userId,
        peer: action.peer,
        joinTime: new Date().toISOString(),
        peerState: 'connecting',
      }
      break
    case 'someone joined':
      draft.participants[action.userId] = {
        userId: action.userId,
        joinTime: new Date().toISOString(),
      }
      break

    case 'peer state changed':
      if (!draft.participants[action.userId]) break
      draft.participants[action.userId].peerState = action.state
      break

    case 'sharing screen started':
      draft.weSharingScreen = true
      break

    case 'sharing screen stopped':
      draft.weSharingScreen = false
      break

    case 'participant sharing screen changed':
      if (!draft.participants[action.userId]) return
      draft.participants[action.userId].isSharingScreen = action.state
      break

    case 'got track':
      let participant = draft.participants[action.userId]
      if (!participant) return

      if (action.kind === 'screen') {
        participant.screenStream = action.stream
      }

    default:
      break
  }
}

type DataChannelPortocol = {
  type: 'sharing screen changed'
  userId: string
  state: boolean
}
