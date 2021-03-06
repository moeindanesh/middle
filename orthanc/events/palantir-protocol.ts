import { WebSocket } from 'uWebSockets.js'
import { Users } from '../model/Users'

export enum PQLClientMessageTypes {
  ConnectionInit,
  Disconnected,
  RtcSignal,
}

export enum PQLServerMessageTypes {
  Delivery,
  Users,
  RtcSignal,
}

export interface PQLServerMessage {
  type: PQLServerMessageTypes
  data: string
}

export interface PQLClientMessage {
  id: string
  type: PQLClientMessageTypes
  data: string
}

export interface PalantirWebSocket {
  socket: WebSocket
  users: Users
  socketToUserIdMap: Map<WebSocket, string>
}
