import { RouteRecordRaw } from 'vue-router'

import Home from '@/views/Home.vue'

const redirectPath = '/ocr'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'layout',
    component: () => import('@/views/layout/Layout.vue'),
    children: [
      {
        path: '',
        redirect: redirectPath
      },
      {
        path: 'ocr',
        name: 'ocr',
        component: () => import('@/views/ocr/Ocr.vue')
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/system/settings/Settings.vue')
      },
      {
        path: 'home',
        name: 'Home',
        component: Home
      },
      {
        path: 'about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: 'about' */ '@/views/About.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)',
    redirect: redirectPath
  }
]

export default routes
