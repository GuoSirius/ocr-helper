import CamoModel from '../CamoModel'

export default class Model extends CamoModel {
  constructor() {
    super()

    this.scheme()
  }

  static collectionName() {
    return 'organization'
  }

  scheme() {
    super.schema({
      name: {
        type: String,
        unique: true,
        required: true
      },
      tagCategory: {
        type: String,
        default: 'org_name'
      },
      isRegExp: {
        type: Boolean,
        default: false
      },
      category: {
        type: String,
        default: ''
      }
    })
  }
}
