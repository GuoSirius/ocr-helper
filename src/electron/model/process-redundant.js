import noop from 'lodash/noop'
import castArray from 'lodash/castArray'
import isNil from 'lodash/isNil'
import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'

import { FAILURE_CODE } from './base-curd'

export const FIXED_IDS_FIELD = 'fixedIds'
export const FIXED_COUNT_FIELD = 'fixedCount'
export const PATH_PARENT_ID_FIELD = '__path-parent-id-field__'

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

export async function fixParentId(modelLists, Model, pidField = 'parentId', pathPidField = PATH_PARENT_ID_FIELD) {
  let data = { lists: [], [FIXED_IDS_FIELD]: [], [FIXED_COUNT_FIELD]: 0 }

  modelLists = castArray(modelLists)
  const excludeIds = modelLists.map(item => item._id)

  const query = { _id: { $nin: excludeIds }, [pidField]: { $in: excludeIds } }

  try {
    await Model.connect()

    await Model.find(query)
      .then(docs => {
        return batchOperate(docs, Model, `修复 ${pidField} 失败`, doc => {
          const { [pidField]: parentId, [pathPidField]: pathParentId } = modelLists.find(
            ({ _id }) => _id === doc[pidField]
          )

          doc[pidField] = pathParentId ?? parentId ?? ''
          doc.updateTime = new Date()

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

  const query = { _id: { $nin: excludeIds } }

  try {
    await Model.connect()

    if (isHardDelete) {
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

              doc.updateTime = new Date()

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

    const result = await batchOperate(modelLists, Model, '修复路径失败', model => {
      const { _id, [pidField]: parentId, path } = model

      // 查找 最新父级
      return Model.findOne({ _id: parentId }).then(async doc => {
        const { _id: pid, path: parentPath } = doc || {}

        let needUpdate = false
        let savePromise = null

        model.updateTime = new Date()

        // 新增
        if (!path) {
          model.path = `${parentPath || 0}-${_id}`

          savePromise = model.save()
        } else if (!parentPath) {
          // TODO 该情况理论上不会出现，待定、待优化
          model.path = `0-${pid}-${_id}`

          savePromise = model.save()
        } else {
          model.path = `${parentPath}-${_id}`

          needUpdate = true
          savePromise = model.save()
        }

        return savePromise.then(async result => {
          if (result === null) {
            return Promise.reject(new Error(`修复路径 ${model._id} 失败`))
          }

          if (!needUpdate) return model

          let newPathPrefix = `${parentPath}-`
          const oldPathPrefix = new RegExp(`^${path}-`)

          if (parentPath.startsWith(path)) {
            const [pathParentId] = path.split('-').slice(-2)

            newPathPrefix = path.replace(new RegExp(`-${_id}$`), '-')
            model[PATH_PARENT_ID_FIELD] = pathParentId

            await fixParentId(model, Model, pidField)
          }

          query.path = { $regex: oldPathPrefix }
          await Model.find(query).then(async docs => {
            await batchOperate(docs, Model, '修复路径失败', doc => {
              doc.path = doc.path.replace(oldPathPrefix, newPathPrefix)
              doc.updateTime = new Date()

              return doc.save()
            })

            await fixLevel(docs, Model)
          })

          return model
        })
      })
    })

    await fixLevel(modelLists, Model)

    return result
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `修复路径失败：${error.message}`)
  }
}

export async function fixLevel(modelLists, Model) {
  const data = { lists: [], [FIXED_IDS_FIELD]: [], [FIXED_COUNT_FIELD]: 0 }

  modelLists = castArray(modelLists)

  try {
    return batchOperate(modelLists, Model, '修复层级失败', model => {
      const { path } = model

      model.level = String(path).split('-').length - 1
      model.updateTime = new Date()

      return model.save()
    })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `修复层级失败：${error.message}`)
  }
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
