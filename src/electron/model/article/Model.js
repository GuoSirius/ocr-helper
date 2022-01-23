import CamoModel from '../CamoModel'

export default class Model extends CamoModel {
  constructor() {
    super()

    this.scheme()
  }

  static collectionName() {
    return 'article'
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
        default: 'item_name'
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
