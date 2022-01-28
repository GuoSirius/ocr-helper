import castArray from 'lodash/castArray'
import isEmpty from 'lodash/isEmpty'
import isInteger from 'lodash/isInteger'

import { IS_DEVELOPMENT, FAILURE_CODE, DELETED_IDS_FIELD, DELETED_COUNT_FIELD } from '../CamoModel'

import Model from './Model'

export * from './constant'

// 新增 字典
export async function addDictionary({ name, code, parentId = '' } = {}) {
  let data = {}

  try {
    await Model.connect()

    const dictionary = Model.create({ name, code, parentId })

    return dictionary
      .save()
      .then(doc => {
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
export async function updateDictionary({ id, name, code, parentId = '' } = {}) {
  let data = {}

  try {
    await Model.connect()

    return Model.findOneAndUpdate({ _id: id }, { name, code, parentId, updateTime: new Date() })
      .then(doc => {
        if (doc === null) return Model.jsonResult(data, FAILURE_CODE, '更新字典失败')

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
export async function deleteDictionary(ids, isHardDelete = IS_DEVELOPMENT) {
  let data = { lists: [], [DELETED_IDS_FIELD]: [], [DELETED_COUNT_FIELD]: 0 }

  let actionPromise = null
  // 为了触发 preDelete 和 postDelete 钩子，暂时不使用静态删除方法
  const _isHardDelete = isHardDelete && actionPromise

  const isBatch = Array.isArray(ids)
  ids = isBatch ? ids : [ids]
  const query = { _id: { $in: ids } }

  if (isHardDelete) delete data.lists

  try {
    await Model.connect()

    if (_isHardDelete) {
      actionPromise = isBatch ? Model.deleteMany(query) : Model.deleteOne(query)
    } else {
      actionPromise = isBatch ? Model.find(query) : Model.findOne(query)
    }

    return actionPromise
      .then(async doc => {
        if (doc === 0 || isEmpty(doc)) {
          return Model.jsonResult(data, FAILURE_CODE, '删除字典失败')
        }

        if (isInteger(doc)) data = { [DELETED_IDS_FIELD]: ids, [DELETED_COUNT_FIELD]: doc }
        else {
          const docs = castArray(doc)
          const promiseLists = docs.map(model => {
            let promise = null

            if (isHardDelete) promise = model.delete()
            else {
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

          data = { [DELETED_IDS_FIELD]: deletedIds, [DELETED_COUNT_FIELD]: deletedCount }

          if (!isHardDelete) data.lists = Model.toJSONList(docs)

          if (deletedCount === 0) {
            return Model.jsonResult(data, FAILURE_CODE, '删除字典失败')
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
export async function getDictionaryPaginationLists({ name, code, currentPage, pageSize } = {}) {
  let data = {}

  const { skip, limit } = Model.getPaginationCondition(currentPage, pageSize)

  const query = {
    $or: [{ deleteTime: null }, { deleteTime: { $exists: false } }],
    $where() {
      const isNameOK = !name || this.name.includes(name)
      const isCodeOK = !code || this.code.includes(code)

      return isNameOK && isCodeOK
    }
  }
  const options = { skip, limit, sort: ['-createTime', '-order'] }

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

// 获取 字典树
export async function getDictionaryTree() {
  await Model.connect()

  return Model.find({ $or: [{ deleteTime: null }, { deleteTime: { $exists: false } }] }, { sort: ['-createTime'] })
}
