import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { category } from '@/../electron/config'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'client',
    component: () => import('@/client/index.vue'),
  },
  {
    path: `/${category.ios17Clock}`,
    name: category.ios17Clock,
    component: () => import('@/background/ios17Clock/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
