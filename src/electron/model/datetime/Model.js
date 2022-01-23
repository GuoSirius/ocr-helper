import CamoModel from '../CamoModel'

export default class Model extends CamoModel {
  constructor() {
    super()

    this.scheme()
  }

  static collectionName() {
    return 'datetime'
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
        default: 'time'
      },
      isRegExp: {
        type: Boolean,
        default: false
      }
    })
  }
}
