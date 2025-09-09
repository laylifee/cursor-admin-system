import router from './index.js'
import { usePermissionStore } from '@/store/modules/permission.js'
import { useUserStore } from '@/store/modules/user'
import { buildMenuTree } from '@/utils/tools.js'
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
    if (route.menuType === '3') {
      data.component = Layout
    } else if (route.menuType === '1') {
      if (route.component) {
        const comModule =
          modules[`../views/${route.component}.vue`] || modules[`../views/${route.component}.tsx`]

        if (comModule) {
          data.component = comModule
        } else {
          console.error(`未找到${route.component}.vue文件或${route.component}.tsx文件，请创建`)
          // 回退到默认组件
          data.component = () => import('@/views/error-page/404.vue')
        }
      } else {
        // 如果没有组件，使用 Layout 作为默认组件
        data.component = Layout
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

// 恢复路由时重新创建组件函数
export const restoreRoutes = async () => {
  const permissionStore = usePermissionStore()

  if (permissionStore.isRoutesAdded && permissionStore.addRoutes.length > 0) {
    console.log('从存储恢复动态路由')
    const routes = buildMenuTree(permissionStore.rawAuthData)

    // 清空现有动态路由（避免重复）
    // removeDynamicRoutes()

    await permissionStore.generateRoutes(routes)

    return permissionStore.addRoutes
  }

  return []
}

// 移除所有动态路由
const removeDynamicRoutes = () => {
  const routesToRemove = router
    .getRoutes()
    .filter((route) => route.name && !['Login', '404', 'Home', 'NotFound'].includes(route.name))
  console.log('routesToRemove', routesToRemove)
  routesToRemove.forEach((route) => {
    if (route.name) {
      router.removeRoute(route.name)
    }
  })
}
