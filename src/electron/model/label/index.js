import dayjs from 'dayjs'

import Model from './Model'

// 新增 看板
export async function addBillboard(name) {
  await Model.connect()

  const billboard = Model.create({ name })

  return billboard.save()
}

// 编辑 看板
export async function editBillboard(id, name) {
  await Model.connect()

  return Model.findOneAndUpdate({ _id: id }, { name, updateTime: new Date() })
}

// 删除 看板
export async function deleteBillboard(id, isHardDelete = false) {
  await Model.connect()

  return isHardDelete
    ? Model.deleteOne({ _id: id })
    : Model.findOneAndUpdate({ _id: id }, { updateTime: new Date(), deleteTime: new Date() })
}

// 获取 看板列表
export async function getBillboardLists(name = '', isCompleted = null) {
  await Model.connect()

  let method = 'some'

  if (isCompleted) method = 'every'

  return Model.find(
    {
      $or: [{ deleteTime: null }, { deleteTime: { $exists: false } }],
      $where() {
        return !name || this.name.includes(name)
      }
    },
    { sort: ['-createTime'] }
  )
    .then(lists => {
      if (isCompleted === null) return lists

      return Promise.all(
        lists.map(async item => {
          // const { _id } = item
          const lists = []

          return { ...item, lists }
        })
      )
    })
    .then(lists => {
      return lists
        .map(item => item.toJSON?.() || item)
        .filter(item => isCompleted === null || item.lists[method](card => card.isCompleted === isCompleted))
        .map(item => ({ ...item, createDate: dayjs(item.createTime).format('MM/DD/YYYY') }))
    })
}
