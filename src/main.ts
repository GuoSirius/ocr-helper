import 'reset-css'
import 'normalize.css'
import 'element-plus/dist/index.css'

import 'animate.css'
// import './assets/buttons.css'

import './assets/scss/common.scss'
import './assets/scss/element-ui.scss'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCN from 'element-plus/es/locale/lang/zh-cn'
import * as icons from '@element-plus/icons-vue'

import forEach from 'lodash/forEach'

import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

// @ts-expect-error TypeScript
import { registerComponent } from '@/components'

if (process.env.IS_ELECTRON) {
  process.on('unhandledRejection', error => {
    /* eslint-disable-next-line no-console */
    console.error(error)
  })

  require('./service/electron-log')
  require('./service/vue-devtools')
}

const app = createApp(App)

app.use(store).use(router).use(ElementPlus, { locale: zhCN }).mount('#app')

forEach(icons, (component: unknown, name) => {
  // @ts-expect-error unknown
  let _name = component.name || name

  if (_name === 'Menu') _name = 'IconMenu'

  // @ts-expect-error ComponentPublicInstance
  app.component(_name, component)
})

registerComponent(app)
