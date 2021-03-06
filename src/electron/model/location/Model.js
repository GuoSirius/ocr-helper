import CamoModel from '../CamoModel'

export default class Model extends CamoModel {
  constructor() {
    super()

    this.scheme()
  }

  static collectionName() {
    return 'location'
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
        default: 'location'
      },
      isRegExp: {
        type: Boolean,
        default: false
      }
    })
  }
}
