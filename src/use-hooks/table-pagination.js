import { ref, watch } from 'vue'

import noop from 'lodash/noop'
import isFunction from 'lodash/isFunction'

export const ROW_KEY = 'id'

export const LAYOUT = 'slot, ->, total, sizes, prev, pager, next, jumper'
// export const LAYOUT = 'total, sizes, prev, pager, next, jumper, ->, slot'
export const PAGE_SIZES = [2, 6, 8, 9, 10, 12, 15, 16, 20, 30, 40, 50, 100, 200, 300, 500, 1000, 10000]

export function useTable(getDataLists) {
  const table = ref()

  const tableData = ref([])
  const currentPage = ref(1)
  const pageSize = ref(20)
  const total = ref(0)

  if (!isFunction(getDataLists)) getDataLists = noop

  watch(currentPage, () => getDataLists())
  watch(pageSize, () => {
    currentPage.value = 1

    getDataLists()
  })

  return { table, tableData, currentPage, pageSize, total }
}
