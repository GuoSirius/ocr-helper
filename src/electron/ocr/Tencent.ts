import { ocr } from 'tencentcloud-sdk-nodejs'

import IOCR from './IOCR'

import { TENCENT_API_KEY, TENCENT_SECRET_KEY } from './constant'

const { v20181119 } = ocr
const { Client } = v20181119

export default class Tencent implements IOCR {
  ocrClient = null

  constructor() {
    const clientConfig = {
      region: 'ap-shanghai',
      credential: {
        secretId: TENCENT_API_KEY,
        secretKey: TENCENT_SECRET_KEY
      },
      profile: {
        signMethod: 'HmacSHA256',
        httpProfile: {
          reqMethod: 'POST',
          reqTimeout: 30
        }
      }
    }

    const ocrClient = new Client(clientConfig)

    this.ocrClient = ocrClient
  }

  recognize(base64: string) {
    // GeneralAccurateOCR
    return Promise.resolve({ text: base64 })
  }
}
