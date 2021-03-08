const path = require('path')
const withTranspileModules = require('next-transpile-modules')([
  '@middle/orthanc',
  '../orthanc',
])

const config = {
  reactStrictMode: true,

  webpack(config, { isServer, webpack }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      orthanc: path.resolve(__dirname, '../orthanc'),
    }

    config.resolve.extensions = [
      '.web.js',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ]

    return config
  },
}

let withPlugins = withTranspileModules(config)

module.exports = withPlugins
