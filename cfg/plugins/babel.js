import rollupBabel from '@rollup/plugin-babel'

export const babelClient = () => rollupBabel({
  babelHelpers: 'bundled',
  // babelrc: false,
  presets     : [
    [
      '@babel/preset-env',
      {
        corejs     : 3,
        loose      : true,
        bugfixes   : true,
        modules    : false,
        useBuiltIns: 'entry', // 'entry', 'usage'
        targets    : '> 1%, not dead'
      }
    ]
  ],
  plugins: [
    [
      '@babel/plugin-transform-template-literals',
      { loose: true }
    ],
    [
      '@babel/plugin-proposal-class-properties',
      { loose: true }
    ],
    [
      '@babel/plugin-transform-block-scoping',
      { loose: true }
    ]
  ]
})

export const babelServer = () => rollupBabel({
  babelHelpers: 'bundled',
  presets     : [
    [
      '@babel/preset-env',
      { targets: { node: '12' }, modules: false }
    ]
  ]
})
