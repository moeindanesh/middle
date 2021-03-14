import { UserData } from '../model/types'
import {
  PalantirWebSocket,
  PQLClientMessage,
  PQLClientMessageTypes,
  PQLServerMessage,
  PQLServerMessageTypes,
} from './palantir-protocol'

export const onMessage = (
  palantirWebSocket: PalantirWebSocket,
  rawMessage: ArrayBuffer,
  isBinary: boolean,
) => {
  if (isBinary) {
    throw new Error('[onMessage] Binary messages not supported.')
  }

  let message = parseMessage(rawMessage)

  // console.warn({ message })

  palantirWebSocket.socket.send(deliveryMessage(message.id))

  switch (message.type) {
    case PQLClientMessageTypes.ConnectionInit:
      console.warn('[ConnectionInit] new user joined')
      let user: UserData = JSON.parse(message.data)
      palantirWebSocket.users.addUser(user)
      palantirWebSocket.socketToUserIdMap.set(palantirWebSocket.socket, user.id)
      palantirWebSocket.socket.subscribe('space/main')

      // publish to subscribed users
      let newUserMessage: PQLServerMessage = {
        data: JSON.stringify({ ...palantirWebSocket.users }),
        type: PQLServerMessageTypes.Users,
      }
      palantirWebSocket.socket.publish(
        'space/main',
        JSON.stringify(newUserMessage),
      )
      break
    case PQLClientMessageTypes.RtcSignal:
      let date = new Date()
      let time = `${date.getMinutes()}:${date.getSeconds()}${date.getMilliseconds()}`
      console.warn('[RtcSignal] signal exchange', time)
      let signal: PQLServerMessage = {
        data: message.data,
        type: PQLServerMessageTypes.RtcSignal,
      }
      palantirWebSocket.socket.publish('space/main', JSON.stringify(signal))
      break
    // case PQLClientMessageTypes.Disconnected:
    //   console.log('[Disconnected] should remove user')
    //   let { userId }: { userId: string } = JSON.parse(message.data)
    //   if (!userId) return
    //   palantirWebSocket.users.removeUser(userId)
  }
}

function deliveryMessage(messageId: string): string {
  let message: PQLServerMessage = {
    type: PQLServerMessageTypes.Delivery,
    data: JSON.stringify({ messageId }),
  }

  return JSON.stringify(message)
}

function parseMessage(message: ArrayBuffer): PQLClientMessage {
  try {
    let buffer = Buffer.from(message)
    let messageString = buffer.toString('utf-8')
    let messageObject: PQLClientMessage = JSON.parse(messageString)
    if (!messageValidation(messageObject)) {
      throw new Error('Message received but is not validated')
    }
    return messageObject
  } catch (error) {
    throw new Error('Faild to parse message')
  }
}

function messageValidation(message: Record<string, any>) {
  if (typeof message !== 'object') {
    return false
  }

  if ('id' in message && 'type' in message && 'data' in message) {
    return true
  }

  return false
}
