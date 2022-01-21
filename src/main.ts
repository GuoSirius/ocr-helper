import 'reset-css'
import 'normalize.css'
import 'element-plus/dist/index.css'

import 'animate.css'
// import './assets/buttons.css'

import './assets/scss/common.scss'
import './assets/scss/element-ui.scss'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as icons from '@element-plus/icons-vue'

import forEach from 'lodash/forEach'

import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

if (process.env.IS_ELECTRON) {
  process.on('unhandledRejection', error => {
    /* eslint-disable-next-line no-console */
    console.error(error)
  })

  // require('./service/vue-devtools')
}

const app = createApp(App)

app.use(store).use(router).use(ElementPlus).mount('#app')

forEach(icons, (component: unknown, name) => {
  // @ts-expect-error unknown
  let _name = component.name || name

  if (_name === 'Menu') _name = 'IconMenu'

  // @ts-expect-error ComponentPublicInstance
  app.component(_name, component)
})
