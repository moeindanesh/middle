import { PQLClientMessageTypes } from '@middle/orthanc/events/palantir-protocol'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'
const url = 'ws://localhost:3001'

interface WebSocketMessageEvent extends Event {
  data?: any
}

export const usePalantir = () => {
  useEffect(() => {
    let socket = new WebSocket(`${url}/palantir`)
    let initId = nanoid()
    let userId = nanoid()

    const onOpen = () => {
      console.log('onOpen')
      socket.send(
        JSON.stringify({
          id: initId,
          type: PQLClientMessageTypes.ConnectionInit,
          data: JSON.stringify({ id: userId, name: 'MoeinDana' }),
        }),
      )
    }

    const onClose = () => {
      console.log('onClose')
      socket.send(
        JSON.stringify({
          id: nanoid(),
          type: PQLClientMessageTypes.Disconnected,
          data: JSON.stringify({ userId }),
        }),
      )
    }

    const onMessage = (event: WebSocketMessageEvent) => {
      console.log('onMessage')
      console.log(event)
    }

    socket.addEventListener('open', onOpen)
    socket.addEventListener('close', onClose)
    socket.addEventListener('message', onMessage)

    return () => {
      socket.removeEventListener('open', onOpen)
      socket.removeEventListener('close', onClose)
      socket.removeEventListener('message', onMessage)
    }
  }, [])
}
