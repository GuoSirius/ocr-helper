import CamoModel from '../CamoModel'

export default class Model extends CamoModel {
  constructor() {
    super()

    this.scheme()
  }

  static collectionName() {
    return 'dictionary'
  }

  scheme() {
    super.schema({
      name: {
        type: String,
        required: true
      },
      code: {
        type: String,
        required: true
      },
      parentCode: {
        type: String,
        default: ''
      }
    })
  }
}
