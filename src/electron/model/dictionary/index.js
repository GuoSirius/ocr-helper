import isNil from 'lodash/isNil'
import isBoolean from 'lodash/isBoolean'
import isPlainObject from 'lodash/isPlainObject'

import Model from './Model'

import {
  // FAILURE_CODE,
  create,
  update,
  softDelete,
  restore,
  getDetail,
  getPaginationLists
} from '../base-curd'

export * from './constant'

const MESSAGE = '字典'

// 创建 字典
export function createDictionary({ name, code, parentId = '', order = 0, isSystem = false, isDisabled = false } = {}) {
  return create({ name, code, parentId, order, isSystem, isDisabled }, Model, MESSAGE)
}

// 更新 字典
export function updateDictionary({ id, name, code, parentId, order, isDisabled } = {}) {
  return update(id, { name, code, parentId, order, isDisabled }, Model, MESSAGE)
}

// 删除 字典
export function deleteDictionary(ids, isHardDelete, needPromoteChildren) {
  return softDelete(ids, isHardDelete, needPromoteChildren, Model, MESSAGE)
}

// 还原 字典
export function restoreDictionary(ids, needRestoreChildren, needRestoreParent) {
  return restore(ids, needRestoreChildren, needRestoreParent, Model, MESSAGE)
}

// 获取 字典
export function getDictionary(id) {
  return getDetail(id, Model, MESSAGE)
}

// 获取 字典分页列表
export function getDictionaryPaginationLists({
  name,
  code,
  parnetId,
  isDeleted = false,
  isDisabled = false,
  currentPage,
  pageSize
} = {}) {
  const query = {
    $where() {
      const isNameOK = !name || this.name.includes(name)
      const isCodeOK = !code || this.code.includes(code)

      return isNameOK && isCodeOK
    }
  }
  const options = { sort: ['-createTime', '-order'] }

  if (!isNil(parnetId)) query.parnetId = parnetId
  if (isBoolean(isDisabled)) query.isDisabled = isDisabled

  if (isDeleted === true) {
    query.deleteTime = Model.getDeletedCondition()
  } else if (isDeleted === false) {
    query.$or = query.$or || []
    query.$or.push(...Model.getDeletedCondition(false))
  }

  return getPaginationLists(query, options, currentPage, pageSize, Model, MESSAGE)
}

// 通过 parentId 获取 字典列表
export function getDictionaryListByParentId(params) {
  if (!isPlainObject(params)) params = { parentId: params }

  const { name, code, parnetId, isDeleted = false, isDisabled = false } = params

  return getDictionaryPaginationLists({
    name,
    code,
    parnetId,
    isDeleted,
    isDisabled,
    currentPage: false,
    pageSize: false
  })
}

// 获取 字典树
export async function getDictionaryTree({
  name,
  code,
  parnetId,
  isDeleted = false,
  isDisabled = false,
  start,
  end,
  isAll = true
} = {}) {
  await Model.connect()

  return Model.find({ $or: [{ deleteTime: null }, { deleteTime: { $exists: false } }] }, { sort: ['-createTime'] })
}

// 通过 parnetId 获取 字典树
export function getDictionaryTreeByParentId(params) {
  if (!isPlainObject(params)) params = { code: params }

  const { name, code, parnetId, isDeleted = false, isDisabled = false, needPagination = false } = params

  return getDictionaryPaginationLists({ name, code, parnetId, isDeleted, isDisabled, needPagination })
}
