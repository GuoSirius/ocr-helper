import merge from 'lodash/merge'
import kebabCase from 'lodash/kebabCase'
import isPlainObject from 'lodash/isPlainObject'

import { connect, Document } from 'camo'

import { DATABASE_PATH } from './database'

export default class CamoModel extends Document {
  constructor(isDate = true) {
    super()

    const type = isDate ? Date : Number

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

  static getPaginationCondition(pageNumber = 1, pageSize = 20) {
    pageNumber = Number(pageNumber) || 1
    pageSize = Number(pageSize) || 20

    const skip = Math.max(0, pageSize * (pageNumber - 1))
    const limit = pageSize

    return { skip, limit }
  }

  static generatePagination(lists, totalRecords = 0, pageNumber = 1, pageSize = 20) {
    totalRecords = Number(totalRecords) || 0
    pageNumber = Number(pageNumber) || 1
    pageSize = Number(pageSize) || 20

    const totalPages = Math.ceil(totalRecords / pageSize)

    return { lists, totalRecords, totalPages, pageNumber, pageSize }
  }

  static toJSON(primaryKey = 'id') {
    return function toJSON(model) {
      const modelJSON = model.toJSON()
      const jsonResult = { [primaryKey]: modelJSON._id, ...modelJSON }

      return jsonResult
    }
  }

  static toJSONList(primaryKey = 'id') {
    const toJSON = CamoModel.toJSON(primaryKey)

    return function toJSONList(model) {
      const modelJSON = model.map(toJSON)

      return modelJSON
    }
  }

  scheme(extension, isDate = true) {
    const type = isDate ? Date : Number

    extension = isPlainObject(extension) ? extension : {}

    const scheme = merge(
      {
        order: { type: Number, required: 0 },
        isSystem: { type: Boolean, default: false },
        isDisabled: { type: Boolean, default: false },
        createTime: { type, default: Date.now },
        updateTime: { type, default: Date.now },
        deleteTime: { type, default: null }
      },
      extension
    )

    super.scheme(scheme)
  }
}
