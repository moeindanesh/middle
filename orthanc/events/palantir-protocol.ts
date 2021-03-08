import { WebSocket } from 'uWebSockets.js'
import { Users } from '../model/Users'

export enum PQLClientMessageTypes {
  ConnectionInit,
  Disconnected,
}

export enum PQLServerMessageTypes {
  Delivery,
}

export interface PQLServerDeliveryMessage {
  id: string
  type: PQLServerMessageTypes.Delivery
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