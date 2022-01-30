import noop from 'lodash/noop'
import castArray from 'lodash/castArray'
import isNil from 'lodash/isNil'
import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'

import { FAILURE_CODE } from './base-curd'

export const FIXED_IDS_FIELD = 'fixedIds'
export const FIXED_COUNT_FIELD = 'fixedCount'

export async function batchOperate(
  modelLists,
  Model,
  message,
  handler = noop,
  needValidateZero = false,
  idsField = FIXED_IDS_FIELD,
  countField = FIXED_COUNT_FIELD
) {
  if (!isString(message) || !message) {
    if (isFunction(message)) handler = message

    message = '批量操作'
  }

  if (!isFunction(handler)) handler = noop

  let data = { lists: [], [idsField]: [], [countField]: 0 }

  modelLists = castArray(modelLists)

  try {
    await Model.connect()

    const lists = Model.toJSONList(modelLists)

    const promiseLists = modelLists.map(async model => {
      const result = (await handler(model, Model)) ?? model

      return result
    })

    const settledLists = await Promise.allSettled(promiseLists)

    const successIds = settledLists
      .map(({ status, value }) => {
        if (status !== 'fulfilled') return null

        return value?._id
      })
      .filter(item => !isNil(item))
    const successCount = successIds.length

    data = { lists, [idsField]: successIds, [countField]: successCount }

    if ((needValidateZero && successCount === 0) || successCount !== lists.length) {
      return Model.jsonResult(data, FAILURE_CODE, message)
    }

    return Model.jsonResult(data)
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `${message}：${error.message}`)
  }
}

export async function fixParentId(modelLists, Model, pidField = 'parentId') {
  let data = { lists: [], [FIXED_IDS_FIELD]: [], [FIXED_COUNT_FIELD]: 0 }

  modelLists = castArray(modelLists)
  const excludeIds = modelLists.map(item => item._id)

  const query = { _id: { $nin: excludeIds }, [pidField]: { $in: excludeIds } }

  try {
    await Model.connect()

    await Model.find(query)
      .then(docs => {
        return batchOperate(docs, Model, `修复 ${pidField} 失败`, doc => {
          const { [pidField]: parentId } = modelLists.find(({ _id }) => _id === doc[pidField])

          doc[pidField] = parentId ?? ''

          return doc.save().then(result => {
            if (result === null) {
              return Promise.reject(new Error(`修复 ${pidField} ${doc._id} 失败`))
            }

            return result
          })
        })
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, `修复 ${pidField} 失败：${error.message}`)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `修复 ${pidField} 失败：${error.message}`)
  }
}

export async function fixPath(
  modelLists,
  Model,
  isHardDelete = false,
  needPromoteChildren = false,
  pidField = 'parentId'
) {
  if (isString(isHardDelete)) {
    pidField = isHardDelete
    isHardDelete = false
  }

  if (isString(needPromoteChildren)) {
    pidField = needPromoteChildren
    needPromoteChildren = false
  }

  let data = { lists: [], [FIXED_IDS_FIELD]: [], [FIXED_COUNT_FIELD]: 0 }

  modelLists = castArray(modelLists)
  const excludeIds = modelLists.map(item => item._id)

  const query = {}

  try {
    await Model.connect()

    if (isHardDelete) {
      query._id = { $nin: excludeIds }
      query.path = { $regex: new RegExp(`-(${excludeIds.join('|')})-`) }

      if (needPromoteChildren) {
        await fixParentId(modelLists, Model, pidField)

        return Model.find(query)
          .then(async docs => {
            const result = await batchOperate(docs, Model, '修复路径失败', doc => {
              excludeIds.forEach(id => {
                const regexp = new RegExp(`-${id}-`)

                if (!regexp.test(doc.path)) return

                doc.path = doc.path.replace(regexp, '-')
              })

              return doc.save().then(result => {
                if (result === null) {
                  return Promise.reject(new Error(`修复路径 ${doc._id} 失败`))
                }

                return result
              })
            })

            await fixLevel(docs, Model)

            return result
          })
          .catch(error => {
            return Model.jsonResult(data, FAILURE_CODE, `修复路径失败：${error.message}`)
          })
      }

      return Model.deleteMany(query)
        .then(doc => {
          data[FIXED_COUNT_FIELD] = doc

          return Model.jsonResult(data)
        })
        .catch(error => {
          return Model.jsonResult(data, FAILURE_CODE, `修复路径失败：${error.message}`)
        })
    }

    // 过滤掉 软删除 或者 未更新层级关系 的记录
    modelLists = modelLists.filter(({ [pidField]: parentId, path }) => {
      const [pid] = String(path).split('-').slice(-2)

      const needUpdate = !path || (!isNil(parentId) && pid !== parentId)

      return needUpdate
    })

    const promiseLists = modelLists.map(model => {
      const { _id, parentId, path } = model

      console.log(_id, parentId, path)

      let _path = ''

      if (path) {
        // TODO
        return Promise.reject(new Error(123))
      } else {
        _path = `0-${_id}`

        Model.findOneAndUpdate({ _id }, { path: _path, updateTime: new Date() })
      }
    })

    const resultLists = await Promise.allSettled(promiseLists)

    await fixLevel(modelLists, Model)

    return resultLists
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `修复路径失败：${error.message}`)
  }
}

export async function fixLevel(modelLists, Model) {
  modelLists = castArray(modelLists)

  console.log(modelLists, Model)
}

export async function fixRestoreStatus(modelLists, Model, isParent = true) {
  let data = { lists: [], [FIXED_IDS_FIELD]: [], [FIXED_COUNT_FIELD]: 0 }

  modelLists = castArray(modelLists)
  const excludeIds = modelLists.map(item => item._id)

  const query = { _id: { $nin: excludeIds }, deleteTime: Model.getDeletedCondition() }

  if (isParent) {
    const includeIds = modelLists
      .map(item => item.path)
      .filter(item => !!item)
      .map(item => String(item).split('-'))
      .flat()
      .reduce((accumulator, item) => {
        if (accumulator.includes(item)) return accumulator

        accumulator.push(item)

        return accumulator
      }, [])

    query._id.$in = includeIds
  } else {
    query.path = { $regex: new RegExp(`-(${excludeIds.join('|')})-`) }
  }

  try {
    await Model.connect()

    Model.find(query)
      .then(docs => {
        return batchOperate(docs, Model, '修复还原状态失败', doc => {
          doc.updateTime = new Date()
          doc.deleteTime = null

          return doc.save().then(result => {
            if (result === null) {
              return Promise.reject(new Error(`修复还原状态 ${doc._id} 失败`))
            }

            return result
          })
        })
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, `修复还原状态失败：${error.message}`)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `修复还原状态失败：${error.message}`)
  }
}
