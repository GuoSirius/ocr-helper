import * as t from 'tencentcloud-sdk-nodejs'

import IOCR from './IOCR'

import { TENCENT_APP_ID, TENCENT_API_KEY, TENCENT_SECRET_KEY } from './constant'

export default class Tencent implements IOCR {
  constructor() {
    console.log(t)
  }

  recognize(base64: string, needLocation = false) {
    return Promise.resolve({ text: base64 })
  }
}
