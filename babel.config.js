module.exports = function (api) {
  const isTest = api.env('test')

  const presets = [
    '@babel/typescript',
    // Replaced with @babel/plugin-transform-modules-commonjs
    // (isTest || process.env.ENV === '1') && [
    //   '@babel/preset-env',
    //   { targets: { node: 'current' } },
    // ],
  ].filter(Boolean)

  const plugins = [
    // 'babel-plugin-graphql-tag',
    // 'styled-components',
    'macros',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-class-properties',
    (isTest || process.env.ENV === '1') &&
      '@babel/plugin-transform-modules-commonjs',
    (isTest || process.env.ENV === '1') && [
      'babel-plugin-module-resolver',
      {
        root: ['./'],
      },
    ],
  ].filter(Boolean)

  return {
    presets,
    plugins,
    babelrcRoots: ['.', './*'],
  }
}
