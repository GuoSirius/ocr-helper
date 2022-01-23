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
      tag: {
        type: String,
        unique: true,
        required: true
      },
      tagPrefix: {
        type: String,
        default: '{{'
      },
      tagSeparator: {
        type: String,
        default: ':'
      },
      tagSuffix: {
        type: String,
        default: '{{'
      }
    })
  }
}
