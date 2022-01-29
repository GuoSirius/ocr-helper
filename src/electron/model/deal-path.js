import castArray from 'lodash/castArray'

export default async function dealPath(modelLists, Model, isHardDelete = false, needPromoteChildren = false) {
  modelLists = castArray(modelLists)

  try {
    await Model.connect()

    const promiseLists = modelLists.map(async model => {
      const { _id, parentId, path } = model

      console.log(_id, parentId, path)

      if (isHardDelete) {
        if (needPromoteChildren) {
          // TODO
        } else {
          Model.deleteMany({ path: { $regex: new RegExp(`-${_id}-`) } })
        }

        return
      }

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
    return Promise.reject(error)
  }
}
