import castArray from 'lodash/castArray'
import isString from 'lodash/isString'

import { FAILURE_CODE } from './base-curd'

export const FIXED_IDS_FIELD = 'fixedIds'
export const FIXED_COUNT_FIELD = 'fixedCount'

export async function fixParentId(modelLists, Model, pidField = 'parentId') {
  let data = { lists: [], [FIXED_IDS_FIELD]: [], [FIXED_COUNT_FIELD]: 0 }

  modelLists = castArray(modelLists)
  const excludeIds = modelLists.map(item => item._id)

  const query = { _id: { $nin: excludeIds } }

  try {
    await Model.connect()

    await Model.find(query)
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `修复 parentId 失败：${error.message}`)
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

  if (isHardDelete) {
    query.path = { $regex: new RegExp(`-(${excludeIds.join('|')})-`) }
  }

  try {
    await Model.connect()

    if (isHardDelete) {
      if (needPromoteChildren) {
        await fixParentId(modelLists, Model, pidField)

        await Model.find(query)
      } else {
        await Model.deleteMany(query)
      }

      return
    }

    const promiseLists = modelLists.map(async model => {
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

    return resultLists
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `修复路径失败：${error.message}`)
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
      .then(async docs => {
        const lists = Model.toJSONList(docs)

        const promiseLists = docs.map(doc => {
          doc.updateTime = new Date()
          doc.deleteTime = null

          return doc.save().then(result => {
            if (result === null) {
              return Promise.reject(new Error(`修复还原状态 ${doc._id} 失败`))
            }

            return result
          })
        })

        const settledLists = await Promise.allSettled(promiseLists)

        const fixedIds = settledLists
          .map(({ status, value }) => {
            if (status !== 'fulfilled') return null

            return value._id
          })
          .filter(item => item !== null)
        const fixedCount = fixedIds.length

        data = { lists, [FIXED_IDS_FIELD]: fixedIds, [FIXED_COUNT_FIELD]: fixedCount }

        if (fixedCount !== lists.length) {
          return Model.jsonResult(data, FAILURE_CODE, '修复还原状态失败')
        }

        return Model.jsonResult(data)
      })
      .catch(error => {
        return Model.jsonResult(data, FAILURE_CODE, `修复还原状态失败：${error.message}`)
      })
  } catch (error) {
    return Model.jsonResult(data, FAILURE_CODE, `修复还原状态失败：${error.message}`)
  }
}
