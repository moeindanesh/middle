import { PQLClientMessageTypes } from '@middle/orthanc/events/palantir-protocol'
import { useEffect } from 'react'
import { usePalantirContext } from '../utils/PalantirContext'
import { RtcContext, useRtcManager } from '../utils/RtcContext'

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
      window.getRtcState = () => {
        console.log(rtcManager.rtcState)
      }
      window.getParticipants = () => {
        console.log(rtcManager.rtcState.participants)
      }
    }
  })

  return (
    <div>
      <RtcContext.Provider value={rtcManager}>
        <span>MainView</span>
      </RtcContext.Provider>
    </div>
  )
}
