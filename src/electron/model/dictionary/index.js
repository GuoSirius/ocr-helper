import castArray from 'lodash/castArray'
import isNil from 'lodash/isNil'
import isInteger from 'lodash/isInteger'
import isBoolean from 'lodash/isBoolean'

import {
  // IS_DEVELOPMENT,
  FAILURE_CODE,
  DELETED_IDS_FIELD,
  DELETED_COUNT_FIELD,
  RESTORED_IDS_FIELD,
  RESTORED_COUNT_FIELD
} from '../CamoModel'
import dealPath from '../deal-path'
import { filterNil } from '../utils'

import Model from './Model'

export * from './constant'

// 新增 字典
export async function addDictionary({
  name,
  code,
  parentId = '',
  order = 0,
  isSystem = false,
  isDisabled = false
} = {}) {
  let data = {}

  try {
    await Model.connect()

    const dictionary = Model.create({ name, code, parentId, order, isSystem, isDisabled })

    return dictionary
      .save()
      .then(async doc => {
        await dealPath(doc, Model)

        data = Model.toJSON(doc)

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, error.message)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, error.message)
  }
}

// 更新 字典
export async function updateDictionary({ id, name, code, parentId, order, isDisabled } = {}) {
  let data = {}

  const updateDate = filterNil({ name, code, parentId, order, isDisabled, updateTime: new Date() })

  try {
    await Model.connect()

    return Model.findOneAndUpdate({ _id: id }, updateDate)
      .then(async doc => {
        if (doc === null) return Model.jsonResult(data, FAILURE_CODE, '更新字典失败')

        await dealPath(doc, Model)

        data = Model.toJSON(doc)

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, error.message)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, error.message)
  }
}

// 删除 字典
export async function deleteDictionary(
  ids,
  isHardDelete = false,
  needPromoteChildren = false,
  needDeleteChildren = true
) {
  let data = { lists: [], [DELETED_IDS_FIELD]: [], [DELETED_COUNT_FIELD]: 0 }

  let lists = []
  let deletedIds = []
  let actionPromise = null
  // 为了触发 preDelete 和 postDelete 钩子，同时也为了处理 path，暂时不使用静态删除方法
  const _isHardDelete = isHardDelete && actionPromise

  const isBatch = Array.isArray(ids)
  const fakeBatch = !isHardDelete || !needPromoteChildren
  const needBatch = isBatch || fakeBatch
  ids = isBatch ? ids : [ids]
  const idsLength = ids.length
  const query = { _id: { $in: ids } }

  if (fakeBatch) {
    query.$or = query.$or || []

    query.$or.push({ _id: { $in: ids } }, { path: { $regex: new RegExp(`-(${ids.join('|')})-`) } })

    delete query._id
  }

  try {
    await Model.connect()

    actionPromise = needBatch ? Model.find(query) : Model.findOne(query)

    if (_isHardDelete) {
      actionPromise = actionPromise.then(async doc => {
        const docs = castArray(doc || [])
        lists = Model.toJSONList(docs)
        deletedIds = lists.map(item => item._id)

        if (needPromoteChildren) await dealPath(docs, Model, true, true)

        return needBatch ? Model.deleteMany(query) : Model.deleteOne(query)
      })
    }

    return actionPromise
      .then(async doc => {
        if (doc === 0 || doc === null || (needBatch && !doc?.length)) {
          return Model.jsonResult(data, FAILURE_CODE, '删除字典失败')
        }

        if (isInteger(doc)) {
          data = { lists, [DELETED_IDS_FIELD]: deletedIds, [DELETED_COUNT_FIELD]: doc }
        } else {
          const docs = castArray(doc)
          lists = Model.toJSONList(docs)

          const promiseLists = docs.map(async model => {
            let promise = null

            if (isHardDelete) {
              promise = model.delete()
            } else {
              model.updateTime = new Date()
              model.deleteTime = new Date()

              promise = model.save()
            }

            return promise.then(result => {
              if (result === 0 || result === null) {
                return Promise.reject(new Error(`删除字典 ${model._id} 失败`))
              }

              return isInteger(result) ? model : result
            })
          })

          const settledLists = await Promise.allSettled(promiseLists)

          const deletedIds = settledLists
            .map(({ status, value }) => {
              if (status !== 'fulfilled') return null

              return value._id
            })
            .filter(item => item !== null)
          const deletedCount = deletedIds.length

          data = { lists, [DELETED_IDS_FIELD]: deletedIds, [DELETED_COUNT_FIELD]: deletedCount }

          if (deletedCount === 0 || deletedCount < idsLength) {
            return Model.jsonResult(data, FAILURE_CODE, '删除字典失败')
          } else if (!fakeBatch) {
            await dealPath(docs, Model, true, true)
          }
        }

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, error.message)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, error.message)
  }
}

// 还原 字典
export async function restoreDictionary(ids, needRestoreChildren = false, needRestoreParent = true) {
  let data = { lists: [], [RESTORED_IDS_FIELD]: [], [RESTORED_COUNT_FIELD]: 0 }

  let lists = []
  let actionPromise = null

  const isBatch = Array.isArray(ids)
  const needBatch = isBatch || needRestoreChildren
  ids = isBatch ? ids : [ids]
  const idsLength = ids.length
  const query = { _id: { $in: ids } }

  if (needRestoreChildren) {
    query.$or = query.$or || []

    query.$or.push({ _id: { $in: ids } }, { path: { $regex: new RegExp(`-(${ids.join('|')})-`) } })

    delete query._id
  }

  try {
    await Model.connect()

    actionPromise = needBatch ? Model.find(query) : Model.findOne(query)

    return actionPromise
      .then(async doc => {
        if (doc === null || (needBatch && !doc?.length)) {
          return Model.jsonResult(data, FAILURE_CODE, '还原字典失败')
        }

        const docs = castArray(doc)
        lists = Model.toJSONList(docs)

        const promiseLists = docs.map(model => {
          model.updateTime = new Date()
          model.deleteTime = null

          return model.save().then(result => {
            if (result === null) {
              return Promise.reject(new Error(`还原字典 ${model._id} 失败`))
            }

            return result
          })
        })

        const settledLists = await Promise.allSettled(promiseLists)

        const restoredIds = settledLists
          .map(({ status, value }) => {
            if (status !== 'fulfilled') return null

            return value._id
          })
          .filter(item => item !== null)
        const restoredCount = restoredIds.length

        data = { lists, [RESTORED_IDS_FIELD]: restoredIds, [RESTORED_COUNT_FIELD]: restoredCount }

        if (restoredCount === 0 || restoredCount < idsLength) {
          return Model.jsonResult(data, FAILURE_CODE, '还原字典失败')
        }

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, error.message)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, error.message)
  }
}

// 获取 字典
export async function getDictionary(id) {
  let data = {}

  try {
    await Model.connect()

    return Model.findOne({ _id: id })
      .then(doc => {
        if (doc === null) return Model.jsonResult(data, FAILURE_CODE, '获取字典失败')

        data = Model.toJSON(doc)

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, error.message)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, error.message)
  }
}

// 获取 字典分页列表
export async function getDictionaryPaginationLists({
  name,
  code,
  parnetId,
  isDeleted,
  isDisabled,
  currentPage,
  pageSize
} = {}) {
  let data = {}

  const { skip, limit } = Model.getPaginationCondition(currentPage, pageSize)

  const query = {
    $where() {
      const isNameOK = !name || this.name.includes(name)
      const isCodeOK = !code || this.code.includes(code)

      return isNameOK && isCodeOK
    }
  }
  const options = { skip, limit, sort: ['-createTime', '-order'] }

  if (!isNil(parnetId)) query.parnetId = parnetId
  if (isBoolean(isDisabled)) query.isDisabled = isDisabled

  if (isDeleted === true) {
    query.deleteTime = { $exists: true, $nin: [null, void 0] }
  } else if (isDeleted === false) {
    query.$or = query.$or || []
    query.$or.push({ deleteTime: { $in: [null, void 0] } }, { deleteTime: { $exists: false } })
  }

  try {
    await Model.connect()

    const total = await Model.count(query)

    return Model.find(query, options)
      .then(docs => {
        const lists = Model.toJSONList(docs)

        data = Model.generatePagination(lists, total, currentPage, pageSize)

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, error.message)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, error.message)
  }
}

// 获取 字典分页树
export async function getDictionaryPaginationTree() {
  await Model.connect()

  return Model.find({ $or: [{ deleteTime: null }, { deleteTime: { $exists: false } }] }, { sort: ['-createTime'] })
}

// 获取 字典树
export async function getDictionaryTree() {
  await Model.connect()

  return Model.find({ $or: [{ deleteTime: null }, { deleteTime: { $exists: false } }] }, { sort: ['-createTime'] })
}
