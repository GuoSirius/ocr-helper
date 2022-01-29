import CamoModel from '../CamoModel'

export default class Model extends CamoModel {
  constructor() {
    super()

    this.scheme()
  }

  static collectionName() {
    return 'secret'
  }

  scheme() {
    super.schema({
      name: {
        type: String,
        required: true
      },
      category: {
        type: String,
        default: ''
      },
      appId: {
        type: String,
        required: true
      },
      apiKey: {
        type: String,
        required: true
      },
      secretKey: {
        type: String,
        required: true
      },
      qps: {
        type: Number,
        default: 1
      },
      isActive: {
        type: Boolean,
        default: false
      }
    })
  }
}
