import router from './index.js'
import { usePermissionStore } from '@/store/modules/permission.js'
import { useUserStore } from '@/store/modules/user'
import { defineAsyncComponent } from 'vue'
// 使用 Vite 的 import.meta.glob 动态导入所有视图组件
const modules = import.meta.glob('../views/**/*.{vue,tsx}')

/* Layout */
export const Layout = () => import('@/layout/index.vue')

// 后端控制路由生成
export const generateRoutesByServer = (routes) => {
  const res = []

  for (const route of routes) {
    const data = {
      path: route.path,
      name: route.name,
      redirect: route.redirect,
      hidden: route.hidden,
      meta: route.meta
    }
    if (route.component) {
      const comModule =
        modules[`../views/${route.component}.vue`] || modules[`../views/${route.component}.tsx`]
      const component = route.component
      if (!comModule && !component) {
        console.error(`未找到${route.component}.vue文件或${route.component}.tsx文件，请创建`)
      } else {
        // 动态加载路由文件，可根据实际情况进行自定义逻辑
        data.component = component.indexOf('layout') !== -1 ? Layout : comModule
      }
    }
    // recursive child routes
    if (route.children) {
      data.children = generateRoutesByServer(route.children)
    }
    res.push(data)
  }
  return res
}
