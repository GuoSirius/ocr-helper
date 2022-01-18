const WorkerPlugin = require('worker-plugin')

const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  chainWebpack: config => {
    // TODO
  },
  configureWebpack: {
    plugins: [
      new WorkerPlugin(),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ]
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      removeElectronJunk: false,
      // List native deps here if they don't work
      externals: [],
      // If you are using Yarn Workspaces, you may have multiple node_modules folders
      // List them all here so that VCP Electron Builder can find them
      nodeModulesPath: ['./node_modules'],
      // disableMainProcessTypescript: false, // Manually disable typescript plugin for main process. Enable if you want to use regular js for the main process (src/background.js by default).
      // mainProcessTypeChecking: false // Manually enable type checking during webpack bundling for background file.
      chainWebpackMainProcess: config => {
        // Chain webpack config for electron main process only
      },
      chainWebpackRendererProcess: config => {
        // Chain webpack config for electron renderer process only (won't be applied to web builds)
      },
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        publish: ['github']
      }
    }
  }
}
