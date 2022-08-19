import rollupReplace from '@rollup/plugin-replace'

const stringify = JSON.stringify
/*
 * BEGIN REPLACES
 */
export const replaceEnv = (production, browser) => rollupReplace({
  preventAssignment: true,
  values           : {
    'process.browser'     : stringify(browser),
    'process.env.browser' : stringify(browser),
    'process.env.DEV'     : stringify(!production),
    'process.env.NODE_ENV': stringify(process.env.NODE_ENV),

    'typeof window': browser ? '"object"' : '"undefined"'
  }
})
/*
 * END REPLACES
 */
