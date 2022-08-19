import sockjs, { Connection } from 'sockjs'

export const socket = sockjs.createServer()
export type TypeSocketServer = typeof socket

const CONNECTIONS: Set<Connection> = new Set()

socket.on('connection', (ws) => {
  CONNECTIONS.add(ws)
  ws.write('"qwe"')

  ws.on('data', (message) => {
    console.log('SOCK_JS SERVER', message)
    ws.write(message)
  })
  ws.on('close', () => {
    CONNECTIONS.delete(ws)
    console.log('close')
  })
})
