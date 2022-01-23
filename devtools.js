const path = require('path')
const { spawn } = require('child_process')

const portFinder = require('portfinder')

const COMMAND_SUFFIX = process.platform === 'win32' ? '.cmd' : ''
const CROSS_ENV_COMMAND = path.resolve(__dirname, `./node_modules/.bin/cross-env${COMMAND_SUFFIX}`)
const VUE_DEVTOOLS_COMMAND = path.resolve(__dirname, `./node_modules/.bin/vue-devtools${COMMAND_SUFFIX}`)

let devtoolsProcess = null

console.log(VUE_DEVTOOLS_COMMAND)

portFinder.getPort({ port: 8098 }, (error, port) => {
  if (error) return // void reject(error)

  // publish the new Port
  process.env.PORT = port

  devtoolsProcess = spawn(CROSS_ENV_COMMAND, [`PORT=${port}`, VUE_DEVTOOLS_COMMAND], {
    stdio: 'ignore',
    detached: true
  })

  console.log(devtoolsProcess.pid)

  process.exit(0)
})
