import * as fs from 'fs'
import * as path from 'path'
import { rollup } from 'rollup'
import rollupSucrase from '@rollup/plugin-sucrase'
import rollupCommonjs from '@rollup/plugin-commonjs'
import rollupResolve from '@rollup/plugin-node-resolve'

import {
  jsx2tokens, stringifyTokens,
  prevRealTokenIndex, nextRealTokenIndex,
  TOKEN_TYPES as TYPES
} from 'rastree/jsx2tokens'

const getClasses = async (homeBootstrapClasses) => {
  const classes = []
  // const bootstrapFiles = fs.readdirSync(homeBootstrapClasses)
  //   .filter((v) => {
  //     if (v.endsWith('.ts') && v !== 'index.ts') {
  //       return true
  //     }
  //     return false
  //   })
  // console.log(bootstrapFiles)

  for await (const v of fs.readdirSync(homeBootstrapClasses)) {
    if (v.endsWith('.ts') && v !== 'index.ts') {
      const id = path.join(homeBootstrapClasses, v)
      const outputs = await rollup({
        plugins: [
          rollupSucrase({ transforms: ['typescript'] }),
          rollupResolve({
            browser   : true,
            extensions: ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.json']
          }),
          rollupCommonjs()
        ],
        input: id
      })
        .then((bundle) => bundle.generate({
          format : 'es', // cjs
          name   : v,
          exports: 'named',
        }))
      // console.log(6666, outputs.output[0].exports)
      const exports = outputs.output[0].exports
      for (let i = exports.length; i-- > 0;) {
        classes.push({
          id,
          exports: exports[i],
          name   : exports[i].toLowerCase().replace(/_/g, '-'),
        })
      }
    }
  }

  classes.sort((a, b) => Math.sign(a.name.length - b.name.length))
  // console.log(classes)
  return classes
}

export const bootstrapClassnames = (homeSrc, homeBootstrapClasses) => {
  let promise
  return {
    name: 'cfg-rollup-bootstrap',
    // eslint-disable-next-line consistent-return
    transform(code, id) {
      // id = path.relative(process.cwd(), id)
      if (id.startsWith(homeSrc) && !id.startsWith(homeBootstrapClasses) &&
      /\.[tj]sx?$/.test(id)) {
        if (!promise) promise = getClasses(homeBootstrapClasses)
        // eslint-disable-next-line consistent-return
        return promise.then((classes) => {
          const tokens = jsx2tokens(code, { useJSX: /x$/.test(id) })
          let isNeedReplace = false
          const replacers = {}
          for (let token, type, i = tokens.length; i-- > 0;) {
            token = tokens[i], type = token.type
            switch (type) {
              case TYPES.STRING:
              case TYPES.TEMPLATE:
              case TYPES.TEMPLATE_HEAD:
              case TYPES.TEMPLATE_MIDDLE:
              case TYPES.TEMPLATE_TAIL: {
                if (
                  (tokens[nextRealTokenIndex(tokens, i)] || {}).value !== ':' ||
                  (tokens[prevRealTokenIndex(tokens, i)] || {}).value === '?'
                ) {
                  const q = type === TYPES.STRING ? token.value[0] : '`'
                  for (let idx, j = classes.length; j-- > 0;) {
                    if (classes[j].name.length < 2) break
                    if ((idx = token.value.indexOf(classes[j].name)) > -1) {
                      isNeedReplace = true
                      replacers[classes[j].exports] = classes[j]
                      // console.log(141414, [classes[j].exports, token.value])

                      let head = token.value.slice(0, idx)
                      head = head === q ? '' : `${head}${q} + `
                      let tail = token.value.slice(idx + classes[j].name.length)
                      tail = tail === q ? '' : ` + ${q}${tail}`

                      token.value = `${head}_$${classes[j].exports}$_${tail}`
                    // console.log(343434, [classes[j].exports, token.value])
                    }
                  }
                }
                break
              }
              default:
            }
          }

          if (isNeedReplace) {
            let res = ''
            for (const exports in replacers) {
              // console.log(1212, id)
              // console.log(2323, replacers[exports].id)
              // console.log(3434, path.posix.relative(id, replacers[exports].id))

              res += `import { ${exports} as _$${exports}$_ } from ${
                JSON.stringify(path.posix.relative(id, replacers[exports].id).slice(1, -3))}\n`
            }

            // console.log('BOOTSTRAP REPLACERS:\n' + res)
            res += stringifyTokens(tokens)
            return res
          }
        })
      }
    }
  }
}
