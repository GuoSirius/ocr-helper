import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

import routes from './routes'

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: process.env.IS_ELECTRON
    ? createWebHashHistory(process.env.BASE_URL)
    : createWebHistory(process.env.BASE_URL),
  routes
})

export default router
