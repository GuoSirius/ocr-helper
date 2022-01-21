'use strict'

import path from 'path'

import { enable, initialize } from '@electron/remote/main'
import { app, protocol, BrowserWindow } from 'electron'
import ElectronStore from 'electron-store'
import { is } from 'electron-util'
import { autoUpdater } from 'electron-updater'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

initialize()
registerProtocol()
ElectronStore.initRenderer()

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true, stream: true } }])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    title: 'OCR Helper',
    width: 800,
    height: 600,
    show: false,
    // frame: false,
    paintWhenInitiallyHidden: true,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      // Required for Spectron testing
      enableRemoteModule: true, // !!process.env.IS_TEST,

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true, // process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      plugins: true,
      webviewTag: true,
      scrollBounce: true,
      autoplayPolicy: 'no-user-gesture-required',
      defaultEncoding: 'utf-8',
      experimentalFeatures: true,
      contextIsolation: false // !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  enable(win.webContents)

  win.once('ready-to-show', () => {
    win.show()
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    autoUpdater.checkForUpdatesAndNotify()
  }

  return win
}

function makeSingleInstance(mainWindow: BrowserWindow) {
  if (is.development || process.mas || !(mainWindow instanceof BrowserWindow)) return

  const gotLock = app.requestSingleInstanceLock()

  if (gotLock) {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()

        mainWindow.focus()
      }
    })
  } else {
    app.quit()
  }
}

function registerProtocol() {
  if (is.development || process.mas) return

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('ocr-helper', process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('ocr-helper')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      // await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  const mainWindow = await createWindow()
  makeSingleInstance(mainWindow)
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
