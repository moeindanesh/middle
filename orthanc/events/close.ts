import {
  PalantirWebSocket,
  PQLServerMessage,
  PQLServerMessageTypes,
} from './palantir-protocol'

export const onClose = (
  palantirWebSocket: PalantirWebSocket,
  rawMessage: ArrayBuffer,
  code: number,
) => {
  let userId = palantirWebSocket.socketToUserIdMap.get(palantirWebSocket.socket)
  if (!userId) {
    throw new Error('[onClose] user not found in context')
  }

  let users = palantirWebSocket.users
  users.removeUser(userId)
}
