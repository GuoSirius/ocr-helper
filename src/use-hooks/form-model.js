import { ref } from 'vue'

import noop from 'lodash/noop'
import isFunction from 'lodash/isFunction'

export function useFormModel(getDataLists) {
  const form = ref()

  if (!isFunction(getDataLists)) getDataLists = noop

  function resetHandler() {
    form.value.resetFields()

    getDataLists()
  }

  return { form, resetHandler }
}
