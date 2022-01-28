import { getCurrentInstance } from 'vue'

export function useGlobalProperties() {
  const currentInstance = getCurrentInstance()
  const { appContext } = currentInstance
  const { config } = appContext
  const { globalProperties } = config

  return { currentInstance, ...appContext, ...globalProperties }
}
