import { PQLClientMessageTypes } from '@middle/orthanc/events/palantir-protocol'
import { useCallback, useEffect, useMemo } from 'react'
import { usePalantirContext } from '../utils/PalantirContext'
import { RtcContext, useRtcManager } from '../utils/RtcContext'
import { VideoPlayer } from './VideoPlayer'

export default () => {
  let palantirManager = usePalantirContext()

  let { socketRef } = palantirManager

  const send = (data: string) => {
    if (!socketRef || !socketRef.current) {
      console.warn('We do not have socketRef')
      return
    }
    socketRef.current.send(data)
  }

  const rtcManager = useRtcManager({ palantirManager, send })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      //@ts-ignore
      window.getRtcState = () => {
        console.log(rtcManager.rtcState)
      }
      //@ts-ignore
      window.getParticipants = () => {
        console.log(rtcManager.rtcState.participants)
      }
    }
  })

  let participants = rtcManager.rtcState.participants

  let [isParticipantConnected, isParticipantSharingScreen] = useMemo(() => {
    let participantsKeys = Object.keys(participants)
    for (let key of participantsKeys) {
      let participant = participants[key]
      let isConnected = false
      let isSharingScreen = false
      if (!participant) continue
      if (participant.peerState === 'connected') {
        isConnected = true
      }
      if (participant.isSharingScreen) {
        isSharingScreen = true
      }
      return [isConnected, isSharingScreen]
    }
    return [false, false]
  }, [participants])

  let rtcDispatch = rtcManager.dispatch

  let weSharingScreen = rtcManager.rtcState.weSharingScreen
  let toggleSharingScreen = useCallback(() => {
    if (weSharingScreen) {
      rtcDispatch({ type: 'sharing screen stopped' })
    } else {
      rtcDispatch({ type: 'sharing screen started' })
    }
  }, [rtcDispatch, weSharingScreen])

  return (
    <div>
      <RtcContext.Provider value={rtcManager}>
        <span>socket:</span>
        <span
          style={{
            color:
              palantirManager.socketRef.current?.readyState === 1
                ? 'green'
                : 'red',
          }}
        >
          {' '}
          {palantirManager.socketRef.current?.readyState === 1
            ? 'connected'
            : 'disconnected'}
        </span>
        <br />
        <span>peer:</span>
        <span style={{ color: isParticipantConnected ? 'green' : 'red' }}>
          {' '}
          {isParticipantConnected ? 'connected' : 'disconnected'}
        </span>
        <br />
        <div
          style={{
            height: 30,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {isParticipantConnected &&
            (!isParticipantSharingScreen ? (
              <button
                onClick={() => toggleSharingScreen()}
                style={{ marginTop: 10 }}
              >
                {weSharingScreen ? 'Stop sharing' : 'Share screen'}
              </button>
            ) : (
              <span> Our Participant is Sharing his/her Screen</span>
            ))}
        </div>
        <br />
        <VideoPlayer />
      </RtcContext.Provider>
    </div>
  )
}
