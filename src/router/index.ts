import { category } from '@/config'
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
  {
    path: `/${category.star}`,
    name: category.star,
    component: () => import('@/background/star/index.vue'),
  },
  {
    path: `/${category.solar}`,
    name: category.solar,
    component: () => import('@/background/solar/index.vue'),
  },
  {
    path: `/${category.calendar}`,
    name: category.calendar,
    component: () => import('@/background/calendar/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
