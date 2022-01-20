// import { ocr } from 'baidu-aip-sdk'

import IOCR from './IOCR'

import { BAIDU_APP_ID, BAIDU_API_KEY, BAIDU_SECRET_KEY } from './constant'

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { ocr } = require('baidu-aip-sdk')

export interface IBaiduOCRResult {
  log_id: number
  words: string
}

export default class Baidu implements IOCR {
  ocrClient: typeof ocr

  constructor() {
    const ocrClient = new ocr(BAIDU_APP_ID, BAIDU_API_KEY, BAIDU_SECRET_KEY)

    this.ocrClient = ocrClient
  }

  recognize(base64: string) {
    const { ocrClient } = this

    const options = { probability: 'true', detect_direction: 'true' }

    // return Promise.resolve({ text: base64 })

    return ocrClient.accurateBasic(base64, options).then((result: IBaiduOCRResult) => {
      const { words } = result

      return { text: words }
    })
  }
}
