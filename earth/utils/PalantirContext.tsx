import {
  PQLClientMessageTypes,
  PQLServerMessageTypes,
} from '@middle/orthanc/events/palantir-protocol'
import { UserData } from '@middle/orthanc/model/types'
import { nanoid } from 'nanoid/non-secure'
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { useImmerReducer } from 'use-immer'

const url = 'ws://localhost:3001'

interface WebSocketMessageEvent extends Event {
  data?: any
}

export type PalantirContextType = State & {
  dispatch: React.Dispatch<Action>
  palantirState: State
  onSignalReceived: React.MutableRefObject<
    (args: { recipientId: string; senderId: string; signal: string }) => void
  >
}

type State = {
  users: Record<string, UserData>
  currentUser: UserData | undefined
  socketRef: React.MutableRefObject<WebSocket | null | undefined>
  rtcSignals: {
    id: string
    signal: string
    recipientId: string
    senderId: string
  }[]
}

export type Action =
  | { type: 'set current user'; user: UserData }
  | { type: 'users updated'; users: Record<string, UserData> }
  | {
      type: 'signal received'
      signal: string
      recipientId: string
      senderId: string
    }
  | { type: 'signal removed'; id: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set current user':
      return { ...state, currentUser: action.user }

    case 'users updated':
      return {
        ...state,
        users: action.users,
      }

    case 'signal received':
      return {
        ...state,
        rtcSignals: [
          ...state.rtcSignals,
          {
            id: nanoid(),
            recipientId: action.recipientId,
            senderId: action.senderId,
            signal: action.signal,
          },
        ],
      }
      break

    case 'signal removed':
      let signals = state.rtcSignals.filter(signal => signal.id !== action.id)

      return {
        ...state,
        rtcSignals: signals,
      }

    // if unknown action, don't clear the state
    default:
      return state
  }
}

const initialState: State = {
  users: {},
  currentUser: undefined,
  socketRef: {
    current: null,
  },
  rtcSignals: [],
}

const initialContext: PalantirContextType = {
  ...initialState,
  palantirState: initialState,
  dispatch: () => {},
  onSignalReceived: {
    current: () => {},
  },
}

export const PalantirContext = createContext<PalantirContextType>(
  initialContext,
)

export const usePalantirContext = () =>
  useContext<PalantirContextType>(PalantirContext)

export const usePalantirManager = (): PalantirContextType => {
  const [palantirState, dispatch] = useImmerReducer<State, Action>(
    reducer,
    initialState,
  )

  let socketRef = useRef<null | WebSocket>()
  let onSignalReceived = useRef(
    (args: { recipientId: string; senderId: string; signal: string }) => {},
  )

  useEffect(() => {
    let socket = new WebSocket(`${url}/palantir`)
    socketRef.current = socket
    let initId = nanoid()
    let userId = nanoid()
    let time = new Date().toISOString()

    const onOpen = () => {
      console.info('[onOpen] socket connection initiated - message sent')
      let user = { id: userId, name: 'MoeinDana', time }
      dispatch({ type: 'set current user', user })
      socket.send(
        JSON.stringify({
          id: initId,
          type: PQLClientMessageTypes.ConnectionInit,
          data: JSON.stringify(user),
        }),
      )
    }

    const onClose = () => {
      console.info('[onClose] socket disconnected')
      socket.send(
        JSON.stringify({
          id: nanoid(),
          type: PQLClientMessageTypes.Disconnected,
          data: JSON.stringify({ userId }),
        }),
      )
    }

    const onMessage = (event: WebSocketMessageEvent) => {
      console.info('[onMessage] new message received')
      if (event.data && typeof event.data === 'string') {
        let rawData = JSON.parse(event.data)
        let type = rawData.type
        let data = JSON.parse(rawData.data)
        switch (type) {
          case PQLServerMessageTypes.Users:
            dispatch({ type: 'users updated', users: data.users })
            break
          case PQLServerMessageTypes.RtcSignal:
            onSignalReceived.current({
              recipientId: data.recipientId,
              senderId: data.senderId,
              signal: data.signal,
            })
          // dispatch({
          //   type: 'signal received',
          //   recipientId: data.recipientId,
          //   senderId: data.senderId,
          //   signal: data.signal,
          // })
        }
      }
    }

    socket.addEventListener('open', onOpen)
    socket.addEventListener('close', onClose)
    socket.addEventListener('message', onMessage)

    return () => {
      socket.removeEventListener('open', onOpen)
      socket.removeEventListener('close', onClose)
      socket.removeEventListener('message', onMessage)
    }
  }, [dispatch])

  let value: PalantirContextType = {
    ...palantirState,
    palantirState,
    dispatch,
    socketRef,
    onSignalReceived,
  }

  return value
}

export const PalantirContextProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  let value = usePalantirManager()
  return (
    <PalantirContext.Provider value={value}>
      {children}
    </PalantirContext.Provider>
  )
}
