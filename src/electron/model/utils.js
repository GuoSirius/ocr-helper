import toPairs from 'lodash/toPairs'
import fromPairs from 'lodash/fromPairs'
import isNil from 'lodash/isNil'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'

import dayjs from 'dayjs'

export const DATETIME_FIELD_LISTS = ['createTime', 'updateTime', 'deleteTime']

// 格式化输出时间
export function formatDatetime(modelJSON) {
  DATETIME_FIELD_LISTS.forEach(item => {
    const datetime = modelJSON?.[item]

    if (isNil(datetime)) return

    const $datetime = dayjs(datetime)

    if (!$datetime.isValid()) return

    modelJSON[`${item}Date`] = $datetime.format('YYYY-MM-DD HH:mm:ss')
  })
}

// 过滤空值
export function filterNil(data, notNull = false) {
  if (isPlainObject(data)) {
    data = toPairs(data)
      .filter(([, value]) => value !== void 0 && (!notNull || value !== null))
      .map(([key, value]) => [key, filterNil(value)])

    data = fromPairs(data)
  } else if (isArray(data)) {
    // TODO 暂不处理数组
  }

  return data
}
