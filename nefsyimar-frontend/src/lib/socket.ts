import { io, Socket } from 'socket.io-client'
import { API_BASE_URL } from './api'

let socket: Socket | null = null

export const getSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null

  if (socket) {
    return socket
  }

  const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
  const token =
    (typeof window !== 'undefined' &&
      (localStorage.getItem('nefsyimar_impersonation_token') || localStorage.getItem('nefsyimar_token'))) ||
    undefined

  socket = io(API_ORIGIN, {
    transports: ['websocket'],
    auth: {
      token,
    },
  })

  return socket
}
