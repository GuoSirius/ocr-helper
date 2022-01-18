import 'reset-css'
import 'normalize.css'
import 'animate.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'

import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

if (process.env.IS_ELECTRON) {
  process.on('unhandledRejection', error => {
    console.error(error)
  })
}

createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
