import router from './index.js'
import { usePermissionStore } from '@/store/modules/permission.js'
import { useUserStore } from '@/store/modules/user'
import { defineAsyncComponent } from 'vue'
// 使用 Vite 的 import.meta.glob 动态导入所有视图组件
const views = import.meta.glob('@/views/**/*.vue')
const layouts = import.meta.glob('@/layouts/*.vue')
// 合并所有组件
const allComponents = { ...views, ...layouts }
// 将后端返回的路由结构转换为 Vue Router 需要的格式
const transformAsyncRoutes = (asyncRoutes) => {
  const transformedRoutes = []

  for (const route of asyncRoutes) {
    const transformedRoute = {
      path: route.path,
      name: route.name,
      meta: { ...route.meta }
    }

    // 动态导入组件
    if (route.component.indexOf('layout') !== -1) {
      transformedRoute.component = '@/layout/index.vue'
    } else {
      // 根据组件路径字符串动态导入
      transformedRoute.component = getComponent(route.component)
    }

    if (route.children && route.children.length > 0) {
      transformedRoute.children = transformAsyncRoutes(route.children)
    }

    transformedRoutes.push(transformedRoute)
  }

  return transformedRoutes
}

// 检查是否已经添加过动态路由
const hasAddedDynamicRoutes = () => {
  const routeStore = usePermissionStore()
  return routeStore.isRoutesAdded
}
// 获取组件函数 - Vite 版本
const getComponent = (componentKey) => {
  let componentPath = ''

  if (componentKey.indexOf('layout') > -1) {
    componentPath = '@/layout/index.vue'
  } else {
    componentPath = `@/views/${componentKey}.vue`
  }

  // 查找匹配的组件
  const normalizedPath = componentPath.replace('@/', '/src/')

  for (const [path, importFn] of Object.entries(allComponents)) {
    if (path.includes(normalizedPath)) {
      // 使用 defineAsyncComponent 包装异步导入
      return defineAsyncComponent({
        loader: importFn,
        delay: 200, // 延迟显示加载组件
        timeout: 3000 // 超时时间
      })
    }
  }

  console.warn(`Component not found: ${componentPath}`)
  return defineAsyncComponent(() => import('@/views/error-page/404.vue'))
}
// 添加动态路由的主函数
export const addDynamicRoutes = async (asyncRoutesFromAPI) => {
  const routeStore = usePermissionStore()
  try {
    // 避免重复添加
    if (hasAddedDynamicRoutes()) {
      console.log('动态路由已添加，跳过')
      return
    }

    // 1. 转换路由结构
    const userAsyncRoutes = transformAsyncRoutes(asyncRoutesFromAPI)
    // 2. 保存菜单路由到 store 和 localStorage
    routeStore.setMenuRoutes(userAsyncRoutes)
    routeStore.setRoutesAdded(true)

    console.log('动态路由添加成功')
    return userAsyncRoutes
  } catch (error) {
    console.error('添加动态路由失败:', error)
    throw error
  }
}
// 初始化应用时加载已保存的路由
export const initDynamicRoutes = async () => {
  const routeStore = usePermissionStore()
  const userStore = useUserStore()

  const dynamicRoutes = await routeStore.getRoleMenus(userStore.userInfo.id)
  console.log('获取到接口的', dynamicRoutes)
  // 否则正常添加动态路由
  return await addDynamicRoutes(dynamicRoutes)
}
