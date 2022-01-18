export interface IOCRResult {
  text: string
}

export default interface IOCR {
  recognize(base64: string, needLocation: boolean): Promise<IOCRResult>
}
