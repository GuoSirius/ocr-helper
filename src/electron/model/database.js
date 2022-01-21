import path from 'path'
import { ensureFileSync } from 'fs-extra'

import electron from 'electron'

import NeDB from 'nedb'
import { connect } from 'camo'

let remote = null
let app = electron.app

try {
  remote = require('@electron/remote')
  app = remote.app || app
} catch {
  // TODO 正运行在主进程
  remote = null
}
export const NEDB_OPTIONS = {
  autoload: true,
  inMemoryOnly: false,
  timestampData: true,
  corruptAlertThreshold: 0.8
}

export const APP_DATA_PATH = app.getPath('appData')
export const USER_DATA_PATH = app.getPath('userData')

export const DATABASE_PATH = path.resolve(USER_DATA_PATH, 'database')

export function createTable(filename, useODM = true) {
  let table = null

  filename = path.join(DATABASE_PATH, `${filename}.json`)

  ensureFileSync(filename)

  if (useODM) table = connect(`nedb://${filename}`)
  else table = new NeDB({ ...NEDB_OPTIONS, filename })

  return Promise.resolve(table)
}
