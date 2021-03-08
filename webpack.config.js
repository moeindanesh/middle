const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const DIR = process.env.DIR
const IS_PROD = process.env.NODE_ENV === 'production'

const package = require(`./${DIR}/package.json`)

/**
 * Note: Webpack is used for building node apps.
 * Not Front-end, that's bundled by Next.
 */

const baseDirectory = IS_PROD
  ? path.resolve(__dirname, DIR, 'build')
  : path.resolve(__dirname, DIR)

module.exports = {
  context: baseDirectory,
  entry: path.resolve(__dirname, DIR, `./index.ts`),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, DIR, 'build'),
  },

  mode: IS_PROD ? 'production' : 'development',
  devtool: false,

  // Node
  target: 'node',
  node: {
    __filename: false,
    __dirname: false,
  },

  stats: 'minimal',

  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [
    // in order to ignore all modules in node_modules folder
    nodeExternals({
      allowlist: [/^@there/],
    }),
  ],

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': IS_PROD ? '"production"' : '"development"',
      'process.env.packageName': `"${package.name}"`,
      'process.env.version': `"${package.version}"`,
      'process.env.builtAt': `"${new Date().toISOString()}"`,
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: baseDirectory,
      },
    }),
  ].filter(Boolean),

  resolve: {
    symlinks: false,
    extensions: ['.tsx', '.ts', '.js', '.json', '.native.tsx', '.web.tsx'],
    modules: [path.resolve(__dirname, '.'), 'node_modules'],
    alias: {
      '@middle/earth': path.resolve(__dirname, './earth'),
      '@middle/orthanc': path.resolve(__dirname, './orthanc'),
    },
  },

  module: {
    rules: [
      {
        test: /\.(mjs|js|ts|tsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cwd: baseDirectory,
            babelrcRoots: ['.', './*'],
            rootMode: 'upward',
          },
        },
      },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        use: [],
      },
    ],
  },
}
