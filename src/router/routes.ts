import { RouteRecordRaw } from 'vue-router'

import Home from '@/views/Home.vue'

const redirectPath = '/ocr-recognize'

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
        path: 'ocr-recognize',
        name: 'ocr-recognize',
        component: () => import('@/views/ocr-recognize/OcrRecognize.vue'),
        meta: {
          title: 'OCR 识别'
        }
      },
      {
        path: 'secret-management',
        name: 'secret-management',
        component: () => import('@/views/secret-management/SecretManagement.vue'),
        meta: {
          title: '秘钥管理'
        }
      },
      {
        path: 'label-management',
        name: 'label-management',
        component: () => import('@/views/label-management/label-management/LabelManagement.vue'),
        meta: {
          title: '标签管理'
        }
      },
      {
        path: 'article-management',
        name: 'article-management',
        component: () => import('@/views/label-management/article-management/ArticleManagement.vue'),
        meta: {
          title: '物品管理'
        }
      },
      {
        path: 'location-management',
        name: 'location-management',
        component: () => import('@/views/label-management/location-management/LocationManagement.vue'),
        meta: {
          title: '地点管理'
        }
      },
      {
        path: 'datetime-management',
        name: 'datetime-management',
        component: () => import('@/views/label-management/datetime-management/DatetimeManagement.vue'),
        meta: {
          title: '时间管理'
        }
      },
      {
        path: 'organization-management',
        name: 'organization-management',
        component: () => import('@/views/label-management/organization-management/OrganizationManagement.vue'),
        meta: {
          title: '机构管理'
        }
      },
      {
        path: 'person-name-management',
        name: 'person-name-management',
        component: () => import('@/views/label-management/person-name-management/PersonNameManagement.vue'),
        meta: {
          title: '人名管理'
        }
      },
      {
        path: 'punctuation-management',
        name: 'punctuation-management',
        component: () => import('@/views/label-management/punctuation-management/PunctuationManagement.vue'),
        meta: {
          title: '标点管理'
        }
      },
      {
        path: 'dictionary-management',
        name: 'dictionary-management',
        component: () => import('@/views/system-management/dictionary-management/DictionaryManagement.vue'),
        meta: {
          title: '字典管理'
        }
      },
      {
        path: 'home',
        name: 'Home',
        component: Home,
        meta: {
          title: '主页'
        }
      },
      {
        path: 'about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: 'about' */ '@/views/About.vue'),
        meta: {
          title: '关于'
        }
      }
    ]
  },
  {
    path: '/:catchAll(.*)',
    redirect: redirectPath
  }
]

export default routes
