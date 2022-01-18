import { ocr } from 'baidu-aip-sdk'

import IOCR from './IOCR'

import { BAIDU_APP_ID, BAIDU_API_KEY, BAIDU_SECRET_KEY } from './constant'

export default class Baidu implements IOCR {
  ocrClient: ocr

  constructor() {
    const ocrClient = new ocr(BAIDU_APP_ID, BAIDU_API_KEY, BAIDU_SECRET_KEY)

    this.ocrClient = ocrClient
  }

  recognize(base64: string, needLocation = false) {
    return Promise.resolve({ text: base64 })
  }
}
