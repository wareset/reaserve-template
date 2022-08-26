console.clear()

import {
  // join as path_join,
  resolve as path_resolve
} from 'path'

import { createServer as http_createServer } from 'http'
import reaserveServer from 'reaserve/server'
import compression from 'compression'
import helmet from 'helmet'
import sirv from 'sirv'

const isDEV = !!process.env.DEV

const server = http_createServer()
const reaserve = reaserveServer(server, {
  use: [
    (_req, res, next) => {
      // res.locals.nonce = Buffer.from(random_string()).toString('base64'), next()
      res.locals.nonce = (Number.EPSILON * 1e16 + Math.random()).toString(36).slice(2), next()
    },
    (req, _res, next) => {
      // req.setEncoding('utf8')
      const buffers: any[] = []
      req.on('data', (chunk) => { buffers.push(chunk) })
      req.on('end', () => {
        const raw = Buffer.concat(buffers).toString()
        if (raw.length) {
          // @ts-ignore
          req.body = { raw }
          if (/^\s*[-"\d[{]|^\s*(?:null|true|false)\s*$/.test(raw)) {
            try {
              // @ts-ignore
              req.body = JSON.parse(raw)
              next()
            } catch (e) {
              console.log([raw])
              console.error(e)
              next()
            }
          }
        } else {
          next()
        }
      })
    },
    !isDEV && helmet({
      contentSecurityPolicy: {
        directives: {
          scriptSrc: [
            "'self'", (_req, res) => `'nonce-${(res as any).locals.nonce}'`
          ]
        }
      }
    }),
    // @ts-ignore
    compression({ threshold: 0 }),
    sirv(path_resolve(__dirname, 'assets', 'static'), { dev: isDEV }),
  ]
})

import { socketServer, SOCKET_PREFIX } from '#common/sockjs'
// Если поставить его над роутером то все сломается. Как так???
socketServer.installHandlers(server, { prefix: SOCKET_PREFIX })

server.listen(+process.env.PORT! || 3000)

export default reaserve
