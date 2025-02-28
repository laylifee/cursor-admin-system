import router from '@/router'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/404']

// 根据角色获取首页路径
function getDefaultPath(roles) {
  if (roles.includes('admin')) {
    return '/dashboard'
  } else if (roles.includes('editor')) {
    return '/dashboard'
  }
  return '/profile/index'
}

// 检查用户是否有权限访问该路由
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some((role) => route.meta.roles.includes(role))
  }
  return true
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const userStore = useUserStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasRoles = userStore.roles && userStore.roles.length > 0
      if (hasRoles) {
        // 检查是否有权限访问目标路由
        if (to.matched.some((record) => !hasPermission(userStore.roles, record))) {
          next('/404')
        } else {
          // 如果是根路径，重定向到对应角色的首页
          if (to.path === '/') {
            next({ path: getDefaultPath(userStore.roles) })
          } else {
            next()
          }
        }
      } else {
        try {
          const { roles } = await userStore.getInfo()
          // 获取用户信息后，如果是根路径，重定向到对应角色的首页
          if (to.path === '/') {
            next({ path: getDefaultPath(roles) })
          } else {
            // 检查是否有权限访问目标路由
            if (to.matched.some((record) => !hasPermission(roles, record))) {
              next('/404')
            } else {
              next({ ...to, replace: true })
            }
          }
        } catch (error) {
          await userStore.resetToken()
          ElMessage.error(error.message || '出错了')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
