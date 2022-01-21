import CamoModel from '../CamoModel'

export default class Model extends CamoModel {
  constructor() {
    super()

    this.scheme()
  }

  static collectionName() {
    return 'label'
  }

  scheme() {
    super.schema({
      name: {
        type: String,
        unique: true,
        required: true
      },
      isRegExp: {
        type: Boolean,
        default: false
      },
      isSystem: {
        type: Boolean,
        default: false
      },
      createTime: {
        type: Date,
        default: Date.now
      },
      updateTime: {
        type: Date,
        default: Date.now
      },
      deleteTime: {
        type: Date,
        default: null
      }
    })
  }
}
