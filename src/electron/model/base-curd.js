import castArray from 'lodash/castArray'
import isInteger from 'lodash/isInteger'

import { filterNil } from './utils'
import { fixPath, batchOperate, fixRestoreStatus } from './process-redundant'

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const FAILURE_CODE = 1
export const DELETED_IDS_FIELD = 'deletedIds'
export const DELETED_COUNT_FIELD = 'deletedCount'
export const RESTORED_IDS_FIELD = 'restoredIds'
export const RESTORED_COUNT_FIELD = 'restoredCount'

// 创建
export async function create(params, Model, message = '', useMessage = false) {
  if (!useMessage) {
    message = `创建${message}失败`
  }

  let data = {}

  try {
    await Model.connect()

    const dictionary = Model.create(params)

    return dictionary
      .save()
      .then(async doc => {
        await fixPath(doc, Model)

        data = Model.toJSON(doc)

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
  }
}

// 更新
export async function update(id, params, Model, message = '', useMessage = false) {
  if (!useMessage) {
    message = `更新${message}失败`
  }

  let data = {}

  const updateData = filterNil(params)

  try {
    await Model.connect()

    return Model.findOneAndUpdate({ _id: id }, updateData)
      .then(async doc => {
        if (doc === null) return Model.jsonResult(data, FAILURE_CODE, message)

        await fixPath(doc, Model)

        data = Model.toJSON(doc)

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
  }
}

// 删除
export async function softDelete(
  ids,
  isHardDelete = false,
  needPromoteChildren = false,
  Model,
  message = '',
  useMessage = false
) {
  if (!useMessage) {
    message = `删除${message}失败`
  }

  let data = { lists: [], [DELETED_IDS_FIELD]: [], [DELETED_COUNT_FIELD]: 0 }

  let lists = []
  let deletedIds = []
  let actionPromise = null
  // 为了触发 preDelete 和 postDelete 钩子，同时也为了处理 path，暂时不使用静态删除方法
  const _isHardDelete = isHardDelete && actionPromise

  const isBatch = Array.isArray(ids)
  const needBatch = isBatch || !needPromoteChildren
  ids = isBatch ? ids : [ids]
  const query = { _id: { $in: ids } }

  if (!needPromoteChildren) {
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

        if (needPromoteChildren) await fixPath(docs, Model, true, true)

        return needBatch ? Model.deleteMany(query) : Model.deleteOne(query)
      })
    }

    return actionPromise
      .then(async doc => {
        if (doc === 0 || doc === null || (needBatch && !doc?.length)) {
          return Model.jsonResult(data, FAILURE_CODE, message)
        }

        if (isInteger(doc)) {
          data = { lists, [DELETED_IDS_FIELD]: deletedIds, [DELETED_COUNT_FIELD]: doc }

          return Model.jsonResult(data)
        }

        const result = await batchOperate(
          doc,
          Model,
          message,
          model => {
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
                return Promise.reject(new Error(`${message}：${model._id}`))
              }

              return isInteger(result) ? model : result
            })
          },
          true,
          DELETED_IDS_FIELD,
          DELETED_COUNT_FIELD
        )

        if (!result.code && isHardDelete && needPromoteChildren) {
          await fixPath(doc, Model, true, true)
        }

        return result
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
  }
}

// 还原
export async function restore(
  ids,
  needRestoreChildren = false,
  needRestoreParent = true,
  Model,
  message = '',
  useMessage = false
) {
  if (!useMessage) {
    message = `还原${message}失败`
  }

  let data = { lists: [], [RESTORED_IDS_FIELD]: [], [RESTORED_COUNT_FIELD]: 0 }

  let actionPromise = null

  const isBatch = Array.isArray(ids)
  const needBatch = isBatch || needRestoreChildren
  ids = isBatch ? ids : [ids]
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
          return Model.jsonResult(data, FAILURE_CODE, message)
        }

        const result = await batchOperate(
          doc,
          Model,
          message,
          model => {
            model.updateTime = new Date()
            model.deleteTime = null

            return model.save().then(result => {
              if (result === null) {
                return Promise.reject(new Error(`${message}：${model._id}`))
              }

              return result
            })
          },
          true,
          RESTORED_IDS_FIELD,
          RESTORED_COUNT_FIELD
        )

        if (!result.code && needRestoreParent) {
          await fixRestoreStatus(doc, Model)
        }

        return result
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
  }
}

// 获取 详情
export async function getDetail(id, Model, message = '', useMessage = false) {
  if (!useMessage) {
    message = `获取${message}详情失败`
  }

  let data = {}

  try {
    await Model.connect()

    return Model.findOne({ _id: id })
      .then(doc => {
        if (doc === null) return Model.jsonResult(data, FAILURE_CODE, message)

        data = Model.toJSON(doc)

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
  }
}

// 获取 列表
export function getLists(query, options, Model, message = '', useMessage = false) {
  return getPaginationLists(query, options, false, false, Model, message, useMessage)
}

// 获取 分页列表
export async function getPaginationLists(
  query,
  options,
  currentPage,
  pageSize,
  Model,
  message = '',
  useMessage = false
) {
  const needPagination = currentPage !== false && pageSize !== false
  const paginationMessage = needPagination ? '分页' : ''

  if (!useMessage) {
    message = `获取${message}${paginationMessage}列表失败`
  }

  let data = { lists: [], total: 0 }

  if (needPagination) data = Model.generatePagination([], 0, currentPage, pageSize)

  try {
    await Model.connect()

    const total = await Model.count(query)

    return Model.find(query, options)
      .then(docs => {
        const lists = Model.toJSONList(docs)

        if (needPagination) data = Model.generatePagination(lists, total, currentPage, pageSize)
        else data = { lists, total }

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
  }
}
