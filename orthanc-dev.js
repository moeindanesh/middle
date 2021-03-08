const webpack = require('webpack')
const nodemon = require('nodemon')
const once = require('ramda.once')
const webpackConfig = require('./webpack.config.js')
const path = require('path')

const serverConfig = webpackConfig
process.on('SIGINT', process.exit)

const serverCompiler = webpack(serverConfig)

const startServer = () => {
  const serverPath = path.join(
    serverCompiler.options.output.path,
    serverCompiler.options.output.filename,
  )

  nodemon({
    script: serverPath,
    watch: serverPath,
    // eslint-disable-next-line unicorn/prevent-abbreviations
    nodeArgs: process.argv.slice(2),
  }).on('quit', () => process.exit(1)) // eslint-disable-line unicorn/no-process-exit
}

console.info('[starting]')

const startServerOnce = once(error => {
  if (error) return
  startServer()
})
serverCompiler.watch(serverConfig.watchOptions || {}, startServerOnce)
