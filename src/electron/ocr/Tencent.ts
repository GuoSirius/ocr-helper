import { ocr } from 'tencentcloud-sdk-nodejs'

import { nanoid } from 'nanoid'

import IOCR from './IOCR'

import { TENCENT_API_KEY, TENCENT_SECRET_KEY } from './constant'

export type SignMethod = 'HmacSHA256' | 'TC3-HMAC-SHA256' | 'HmacSHA1' | undefined
export type ReqMethod = 'POST' | 'GET' | undefined

const { v20181119 } = ocr
const { Client } = v20181119

export default class Tencent implements IOCR {
  // @ts-expect-error typeof
  ocrClient: Client

  constructor() {
    const clientConfig = {
      region: 'ap-shanghai',
      credential: {
        secretId: TENCENT_API_KEY,
        secretKey: TENCENT_SECRET_KEY
      },
      profile: {
        signMethod: 'HmacSHA256' as SignMethod,
        httpProfile: {
          reqMethod: 'POST' as ReqMethod,
          reqTimeout: 30
        }
      }
    }

    const ocrClient = new Client(clientConfig)

    this.ocrClient = ocrClient
  }

  recognize(base64: string) {
    const { ocrClient } = this

    const options = { SessionId: nanoid(), ImageBase64: base64 }

    return ocrClient.GeneralAccurateOCR(options)
  }
}
