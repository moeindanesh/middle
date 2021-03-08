/* Minimal SSL/non-SSL example */

import uWS, { WebSocket } from 'uWebSockets.js'
import { onMessage } from './events/message'
import { PalantirWebSocket } from './events/palantir-protocol'
import { Users } from './model/Users'
const port = 3001

const app = uWS.App()

const users = new Users()
const socketToUserIdMap = new Map<WebSocket, string>()

app.ws('/*', {
  open: ws => {
    console.log('open called')
    console.log('users', users.getUsers())
  },
  message: (ws, message, isBinary) => {
    let palantirWebSocket: PalantirWebSocket = {
      socket: ws,
      users,
      socketToUserIdMap,
    }
    onMessage(palantirWebSocket, message, isBinary)
  },
  drain: ws => {
    console.log('WebSocket backpressure: ' + ws.getBufferedAmount())
  },
  close: (ws, code, message) => {
    let palantirWebSocket: PalantirWebSocket = {
      socket: ws,
      users,
      socketToUserIdMap,
    }
    console.log({ ws, userId: socketToUserIdMap.get(ws) })
    console.log('WebSocket closed')
  },
})

app.any('/palantir', res => {
  res.end('Time? What time do you think we have?')
})

app.listen(port, token => {
  if (token) {
    console.log(`Isengard is listening on ${port}`)
  } else {
    console.log('So you have chosen… death.')
  }
})
