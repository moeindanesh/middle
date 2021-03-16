import { useEffect, useMemo, useRef } from 'react'
import { useRtcContext } from '../utils/RtcContext'

export const VideoPlayer = () => {
  let { rtcState } = useRtcContext()
  let video = useRef<HTMLVideoElement | undefined>(undefined)

  let participant = useMemo(() => {
    let _participant = undefined
    for (let key of Object.keys(rtcState.participants)) {
      if (rtcState.participants[key]) {
        _participant = rtcState.participants[key]
      }
    }
    return _participant
  }, [rtcState.participants])

  let isParticipantSharingScreen = participant?.isSharingScreen
  let stream = participant?.screenStream

  useEffect(() => {
    if (!video.current || !stream) return
    video.current.srcObject = stream
  }, [stream])

  useEffect(() => {
    if (!video.current || !stream) {
      return
    }
    const videoElement = video.current

    videoElement.srcObject = stream
  }, [video, stream])

  useEffect(() => {
    if (!video.current) {
      return
    }
    const videoElement = video.current

    function loaded() {
      console.log('loaded')
      videoElement.play()
    }

    videoElement.addEventListener('loadedmetadata', loaded)

    return () => {
      videoElement.removeEventListener('loadedmetadata', loaded)
    }
  }, [video])

  return (
    <video
      ref={video as React.RefObject<HTMLVideoElement>}
      width={300}
      muted
      style={{
        filter: isParticipantSharingScreen ? undefined : 'blur(2px)',
      }}
    />
  )
}
