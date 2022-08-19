import SockJS from 'sockjs-client'

import { SOCKET_PREFIX } from './utils'

export const socket = new SockJS(location.origin + SOCKET_PREFIX)
export type TypeSocketClient = typeof socket

socket.onopen = () => {
  console.log('open')
  socket.send('test')
}
socket.onmessage = (e) => {
  console.log(e)
}
socket.onclose = () => {
  console.log('close')
}
