import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { PalantirContextType } from '@middle/earth/utils/PalantirContext'
import {
  RtcState,
  RtcAction,
  initialRtcState,
  useRtcPeers,
} from './hooks/use-rtc-peers'
import { nanoid } from 'nanoid/non-secure'
import { PQLClientMessageTypes } from '@middle/orthanc/events/palantir-protocol'

type RtcContextType = {
  dispatch: React.Dispatch<RtcAction>
  rtcState: RtcState
}

const initialContext: RtcContextType = {
  ...initialRtcState,
  rtcState: initialRtcState,
  dispatch: () => {},
}

export const RtcContext = createContext<RtcContextType>(initialContext)

export const useRtcContext = () => useContext<RtcContextType>(RtcContext)

export const useRtcManager = ({
  palantirManager,
  send,
}: {
  palantirManager: PalantirContextType
  send: (data: string) => void
}): RtcContextType => {
  const inActiveCall = useMemo(() => {
    let participants = Object.keys(palantirManager.users).filter(
      userId => userId !== palantirManager.currentUser?.id,
    )
    return Boolean(participants.length > 0)
  }, [palantirManager.currentUser, palantirManager.users])

  const { rtcState, dispatch, onSignal } = useRtcPeers({
    callId: 'main',
    currentUser: palantirManager.currentUser,
    participants: palantirManager.users,
    broadcastSignal: useCallback(
      (recipientId, signal) => {
        console.log(
          `%c[broadcast]`,
          'color: black; font-style: italic; background-color: #ffffff;padding: 2px',
          {
            signal,
            time: Math.floor(Date.now() / 1000),
            senderId: palantirManager.currentUser?.id,
            recipientId,
          },
        )

        send(
          JSON.stringify({
            id: nanoid(),
            type: PQLClientMessageTypes.RtcSignal,
            data: JSON.stringify({
              signal,
              time: Math.floor(Date.now() / 1000),
              senderId: palantirManager.currentUser?.id,
              recipientId,
            }),
          }),
        )
      },
      [palantirManager.currentUser, send],
    ),
  })

  useEffect(() => {
    palantirManager.onSignalReceived.current = ({
      recipientId,
      senderId,
      signal,
    }) => {
      if (!palantirManager.currentUser) return
      if (senderId === palantirManager.currentUser.id) return
      onSignal(senderId, signal)
    }
  }, [onSignal, palantirManager.currentUser, palantirManager.onSignalReceived])

  // console.log({ rtcState })

  let currentUser = palantirManager.currentUser

  useEffect(() => {
    let rtcSignals = palantirManager.rtcSignals

    let rtcSignal = rtcSignals[0]
    if (!rtcSignal) return

    if (!currentUser) return
    if (currentUser.id !== rtcSignal.recipientId) {
      return
    }

    console.info('got new signal')
    onSignal(rtcSignal.senderId, rtcSignal.signal)
  }, [currentUser, onSignal, palantirManager.rtcSignals])

  let value: RtcContextType = {
    rtcState,
    dispatch,
  }

  return value
}
