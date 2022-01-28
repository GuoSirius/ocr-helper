// import merge from 'lodash/merge'
import kebabCase from 'lodash/kebabCase'
import isString from 'lodash/isString'
import isInteger from 'lodash/isInteger'

import { connect, Document } from 'camo'

import { DATABASE_PATH } from './database'

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const FAILURE_CODE = 1
export const DELETED_IDS_FIELD = 'deletedIds'
export const DELETED_COUNT_FIELD = 'deletedCount'

export default class CamoModel extends Document {
  constructor(isDate = true) {
    super()

    const type = isDate ? Date : Number

    this.path = { type: String, default: '' }

    this.order = {
      type: Number,
      default: 0,
      validate(val) {
        return isInteger(val)
      }
    }

    this.isSystem = {
      type: Boolean,
      default: false,
      choices: [true, false]
    }

    this.isDisabled = {
      type: Boolean,
      default: false,
      choices: [true, false]
    }

    this.createTime = { type, default: Date.now }
    this.updateTime = { type, default: Date.now }
    this.deleteTime = { type, default: null }
  }

  static connect(dataPath = DATABASE_PATH) {
    return connect(`nedb://${dataPath}`)
  }

  static collectionName() {
    const collectionName = this.name?.replace(/model$/i, '')

    return kebabCase(collectionName)
  }

  static getPaginationCondition(currentPage = 1, pageSize = 20) {
    currentPage = Number(currentPage) || 1
    pageSize = Number(pageSize) || 20

    const skip = Math.max(0, pageSize * (currentPage - 1))
    const limit = pageSize

    return { skip, limit }
  }

  getPaginationCondition(currentPage = 1, pageSize = 20) {
    return CamoModel.getPaginationCondition(currentPage, pageSize)
  }

  static generatePagination(lists, totalRecords = 0, currentPage = 1, pageSize = 20) {
    totalRecords = Number(totalRecords) || 0
    currentPage = Number(currentPage) || 1
    pageSize = Number(pageSize) || 20

    const total = totalRecords
    const totalPages = Math.ceil(totalRecords / pageSize)

    return { lists, total, totalRecords, totalPages, currentPage, pageSize }
  }

  generatePagination(lists, totalRecords = 0, currentPage = 1, pageSize = 20) {
    return CamoModel.generatePagination(lists, totalRecords, currentPage, pageSize)
  }

  static toJSON(model, primaryKey = 'id') {
    const modelJSON = model.toJSON()
    const jsonResult = { [primaryKey]: modelJSON._id, ...modelJSON }

    return jsonResult
  }

  static toJSONList(modelLists, primaryKey = 'id') {
    const modelJSONLists = modelLists.map(model => CamoModel.toJSON(model, primaryKey))

    return modelJSONLists
  }

  toJSONList(modelLists, primaryKey = 'id') {
    return CamoModel.toJSONList(modelLists, primaryKey)
  }

  static jsonResult(data, code = 0, message = '成功') {
    if (isString(code)) {
      message = code
      code = 0
    }

    return { code, message, data }
  }

  jsonResult(data, code = 0, message = '成功') {
    return CamoModel.jsonResult(data, code, message)
  }
}
