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
      parentId: {
        type: String,
        default: ''
      },
      name: {
        type: String,
        required: true
      },
      code: {
        type: String,
        required: true
      }
    })
  }
}

window.Model = Model
