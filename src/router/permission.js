import router from '@/router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { usePermissionStore } from '@/store/modules/permission.js'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { restoreRoutes } from '@/router/dynamic-routes'

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
        if (!permissionStore.isRoutesAdded || permissionStore.addRoutes.length === 0) {
          try {
            const userId = userStore.userInfo.id
            let roleRoutes = await permissionStore.getRoleMenus(userId)
            console.log('roleRoutes', roleRoutes)
            await permissionStore.generateRoutes(roleRoutes)

            permissionStore.addRoutes.forEach((route) => {
              router.addRoute(route) //添加动态访问路由表
            })

            const redirectPath = from.query.redirect || to.path
            const redirect = decodeURIComponent(redirectPath)
            const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect }
            permissionStore.setRoutesAdded(true)
            next(nextData)
          } catch (err) {
            console.log('路由守卫错误', err)
            userStore.resetToken()
            permissionStore.resetRoutes()
            next(`/login?redirect=${to.path}`)
          }
        } else {
          console.log('刷新不见了')
          // 检查路由是否真的存在（防止组件函数丢失）
          const routeExists = router.getRoutes().some((r) => r.path === to.path)
          if (!routeExists) {
            console.warn('路由不存在，重新恢复:', to.path)
            // let routes = await restoreRoutes()
            // console.log('routes', routes)
            // routes.forEach((route) => {
            //   router.addRoute(route) //添加动态访问路由表
            // })
            const userId = userStore.userInfo.id
            let roleRoutes = await permissionStore.getRoleMenus(userId)
            console.log('roleRoutes', roleRoutes)
            await permissionStore.generateRoutes(roleRoutes)

            permissionStore.addRoutes.forEach((route) => {
              router.addRoute(route) //添加动态访问路由表
            })
            next({ ...to, replace: true })
          } else {
            next()
          }
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

router.afterEach(() => {
  NProgress.done()
})
