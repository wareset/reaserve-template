// import * as fs from 'fs'
import * as path from 'path'

import pkg from './package.json'
import tsconfig from './tsconfig.json'

import reaserveRollup from 'reaserve/rollup'

import rollupJson from '@rollup/plugin-json'
// import rollupImage from '@rollup/plugin-image'
import rollupInject from '@rollup/plugin-inject'
import rollupSucrase from '@rollup/plugin-sucrase'
import rollupCommonjs from '@rollup/plugin-commonjs'
import rollupResolve from '@rollup/plugin-node-resolve'

import { replaceEnv } from './cfg/plugins/replace-env'
import { livereload } from './cfg/plugins/livereload'
import { tsconfigAliases } from './cfg/plugins/tsconfig-aliases'
import { babelClient, babelServer } from './cfg/plugins/babel'
import { terser } from './cfg/plugins/terser'

const production = !process.env.ROLLUP_WATCH
const externals = Object.keys(pkg.dependencies).concat(require('module').builtinModules)

/*
 * BEGIN FILE_READ
 */
import sqlminify from 'pg-minify'
import { optimize as svgo } from 'svgo'
const _rollupFileRead = (extensions = ['.sql', '.svg']) => {
  const temp = {}
  return {
    name: 'file-read',
    transform(code, id) {
      // if (id in temp) return temp[id]
      let ext = ''
      if (extensions.some((_ext) => id.endsWith(ext = _ext))) {
        if (ext === '.sql') code = sqlminify(code, { compress: true })
        else if (ext === '.svg') code = svgo(code.trim()).data
        return temp[id] = `export default ${JSON.stringify(code)}`
      }
      return null
    }
  }
}
const rollupFileRead = _rollupFileRead()
/*
 * END FILE_READ
 */

/*
 * BEGIN BOOTSTRAP CLASSES
 */
import { bootstrapClassnames } from './cfg/plugins/bootstrap-classnames'
const rollupBoots = bootstrapClassnames(
  path.join(__dirname, 'src'),
  path.join(path.dirname(require.resolve('rease-bootstrap/package.json')), 'classnames')
  // path.join(__dirname, 'src/others/global/bootstrap/classes')
)
/*
 * END BOOTSTRAP CLASSES
 */

export default reaserveRollup({
  debug  : false,
  devmode: !production,

  // rollupClientPluginsBefore: [rollupBoots],
  // rollupServerPluginsBefore: [rollupBoots],

  rollupClientOptions: {
    plugins: [
      rollupJson(),
      // rollupImage(),
      rollupFileRead,
      replaceEnv(production, true),
      rollupSucrase({ transforms: ['typescript'] }),
      rollupBoots,
      tsconfigAliases(tsconfig),
      rollupResolve({
        browser   : true,
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
      }),
      rollupCommonjs(),

      !production && livereload(),
      production && babelClient(),
      production && terser()
    ],
    preserveEntrySignatures: false,
    watch                  : { clearScreen: false }
  },

  rollupServerOptions: {
    plugins: [
      rollupJson(),
      // rollupImage(),
      rollupFileRead,
      replaceEnv(production, false),
      rollupSucrase({ transforms: ['typescript'] }),
      tsconfigAliases(tsconfig),
      // rollupInject({ fetch: 'node-fetch' }),
      rollupInject({ fetch: ['undici', 'fetch'] }),
      rollupResolve({
        browser   : false,
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
      }),
      rollupCommonjs({ dynamicRequireTargets: ['node_modules/better-sqlite3/**/*'] }),

      production && babelServer(),
      production && terser()
    ],
    preserveEntrySignatures: false,
    watch                  : { clearScreen: true },

    external: (source) => {
      if (/node:/.test(source)) return true
      if (source[0] !== '.' && source[0] !== '/' &&
        externals.some((v) => source === v || source.startsWith(v + '/'))) {
        return true
      }
      return false
    }
  },
})
