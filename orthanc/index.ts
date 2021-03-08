/* Minimal SSL/non-SSL example */

import uWS, { WebSocket } from 'uWebSockets.js'
import { onClose } from './events/close'
import { onMessage } from './events/message'
import { PalantirWebSocket } from './events/palantir-protocol'
import { Users } from './model/Users'
const port = 3001

const app = uWS.App()

const users = new Users()
const socketToUserIdMap = new Map<WebSocket, string>()

app.ws('/*', {
  open: ws => {},
  message: (ws, message, isBinary) => {
    let palantirWebSocket: PalantirWebSocket = {
      socket: ws,
      users,
      socketToUserIdMap,
    }
    onMessage(palantirWebSocket, message, isBinary)
  },
  drain: ws => {
    // console.log('WebSocket backpressure: ' + ws.getBufferedAmount())
  },
  close: (ws, code, message) => {
    let palantirWebSocket: PalantirWebSocket = {
      socket: ws,
      users,
      socketToUserIdMap,
    }
    onClose(palantirWebSocket, message, code)
  },
})

app.any('/palantir', res => {
  res.end('Time? What time do you think we have?')
})

app.listen(port, token => {
  if (token) {
    console.info(`Isengard is listening on ${port}`)
  } else {
    console.info('So you have chosen… death.')
  }
})
