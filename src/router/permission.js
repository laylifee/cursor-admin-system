import router from '@/router'
import { useUserStore } from '@/store/modules/user'
import { constantRoutes, asyncRoutes } from '@/router/index.js'
import { ElMessage } from 'element-plus'
import { usePermissionStore } from '@/store/modules/permission.js'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { addDynamicRoutes, initDynamicRoutes } from './dynamic-routes'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/404']

// 根据角色获取首页路径
function getDefaultPath() {
  const permissionStore = usePermissionStore()
  const accessRoutes = permissionStore.addRoutes

  // 安全检查，确保accessRoutes是数组且有元素
  if (Array.isArray(accessRoutes) && accessRoutes.length > 0) {
    const defaultPath = accessRoutes[0].path
    // 确保默认路径不是根路径，避免重定向循环
    return defaultPath && defaultPath !== '/' ? defaultPath : '/dashboard'
  }
  return '/dashboard' // 提供一个默认的备用路径，不要
}
// 检查路由是否在用户的访问权限路由列表中
function hasPermission(accessRoutes, route) {
  console.log('hasPermission---accessRoutes', accessRoutes)
  console.log('hasPermission--route', route)
  // 递归检查路由是否存在于访问权限列表中
  function checkRouteExists(routes, path, visited = new Set()) {
    // 防止重复访问同一个路由对象
    if (!routes || !Array.isArray(routes)) {
      return false
    }

    for (const item of routes) {
      // 检查是否已访问过该路由对象，防止循环引用导致的无限递归
      const itemId = item.path || item.name
      if (visited.has(itemId)) {
        continue
      }
      visited.add(itemId)

      if (item.path === path) {
        return true
      }

      // 安全地检查和遍历子路由
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        if (checkRouteExists(item.children, path, visited)) {
          return true
        }
      }
    }
    return false
  }

  // 检查当前路由路径是否在访问权限列表中
  return checkRouteExists(accessRoutes, route.path)
}
/**
 * 在路由数组中查找指定路径的路由配置
 */
function findRouteByPath(routes, key) {
  for (const route of routes) {
    if (route.name === key) {
      return route
    }
    if (route.children && route.children.length > 0) {
      const found = findRouteByPath(route.children, key)
      if (found) {
        return found
      }
    }
  }
  return null
}
function filterAndMapRoutes(authList) {
  const currentLevelRoutes = []

  authList.forEach((auth) => {
    // 尝试从本地 asyncRoutes 中查找对应的路由配置
    const localRoute = findRouteByPath(asyncRoutes, auth.permissionKey)

    // 如果找到本地路由配置，则使用其 component
    let component = null
    if (localRoute && localRoute.component) {
      component = localRoute.component
    } else if (auth.component === 'Layout') {
      component = () => import('@/layout/index.vue')
    } else if (auth.component && auth.component.trim()) {
      component = () => import(`@/views${auth.component}`)
    } else {
      console.warn(`跳过无效路由：${auth.path}，未找到有效的组件配置`)
      return // 跳过当前路由
    }

    const route = {
      path: auth.path,
      name: auth.name,
      component: component,
      hidden: auth.hidden || localRoute?.meta?.hidden || false,
      meta: {
        title: auth.title,
        icon: auth.icon,
        roles: [],
        hidden: auth.hidden || localRoute?.meta?.hidden || false,
        affix: auth.affix || localRoute?.meta?.affix || false,
        keepAlive: auth.keepAlive || localRoute?.meta?.keepAlive || false
      }
    }

    if (auth.children && auth.children.length > 0) {
      route.children = filterAndMapRoutes(auth.children)
    }

    currentLevelRoutes.push(route)
  })

  return currentLevelRoutes
}
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const hasToken = userStore.token

  console.log('路由守卫触发:', to.path, 'hasToken:', !!hasToken)

  if (hasToken) {
    if (to.path === '/login') {
      // 已登录用户访问登录页，直接重定向到默认路径而不是根路径
      next({ path: getDefaultPath(), replace: true })
    } else {
      try {
        // 应用启动时初始化路由
        if (!permissionStore.isRoutesAdded) {
          await initDynamicRoutes()
          // 动态路由添加完成后，重定向到当前要去的页面
          next({ ...to, replace: true })
        } else {
          const userId = userStore.userInfo.id
          await initDynamicRoutes()
          next()
        }
      } catch (err) {
        console.log('路由守卫错误', err)
        userStore.resetToken()
        permissionStore.resetRoutes()
        next(`/login?redirect=${to.path}`)
      }
    }
  } else {
    // 没有 token
    if (whiteList.includes(to.path)) {
      // 在白名单中，直接放行
      next()
    } else {
      // 不在白名单中，重定向到登录页
      next(`/login?redirect=${to.path}`)
    }
  }
})

// 处理路由访问权限检查
function handleRouteAccess(to, next) {
  const permissionStore = usePermissionStore()

  // 如果是根路径，重定向到对应角色的首页
  if (to.path === '/') {
    next({ path: getDefaultPath(), replace: true })
  } else {
    // 使用 permissionStore.routes 检查是否有权限访问目标路由
    if (!hasPermission(permissionStore.routes, to)) {
      next('/404')
    } else {
      // 直接调用next()而不是next({...to, replace: true})避免重复触发路由守卫
      next()
    }
  }
}

router.afterEach(() => {
  NProgress.done()
})
