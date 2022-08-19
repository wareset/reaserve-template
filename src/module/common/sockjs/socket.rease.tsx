import ENV from 'rease/env'

import type { TypeSocketClient } from './client'
import type { TypeSocketServer } from './server'
export type { TypeSocketClient, TypeSocketServer }

export const socketClient: TypeSocketClient = ENV.IMPORT_FOR_CLIENT(import('./client')).socket
export const socketServer: TypeSocketServer = ENV.IMPORT_FOR_SERVER(import('./server')).socket
