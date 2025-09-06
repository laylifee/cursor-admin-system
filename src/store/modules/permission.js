import { defineStore } from 'pinia'
import { getPermissionList } from '@/api/permission.js'
import { constantRoutes, asyncRoutes } from '@/router/index.js'
import { getUserRoleMenus } from '@/api/permission.js'
import router from '@/router'
import { buildMenuTree } from '@/utils/tools.js'
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

/**
 * 将权限数据转换为路由配置
 */
function transformAuthToRoute(authList) {
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

  return filterAndMapRoutes(authList)
}

// 用于临时存储原始权限数据，不包含component函数
export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    rawAuthData: [],
    isRoutesAdded: false,
    menuRoutes: [], // 存储用于生成菜单的路由
    currentRoute: null
  }),
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'permission',
        storage: localStorage,
        paths: ['isRoutesAdded'] // 只持久化 isRoutesAdded
      }
    ]
  },

  actions: {
    async setRoutesAdded(val) {
      this.isRoutesAdded = val
    },
    async setMenuRoutes(routes) {
      this.menuRoutes = routes
      // 同时保存到 localStorage 用于刷新后恢复
      localStorage.setItem('menuRoutes', JSON.stringify(routes))
    },
    // 从 localStorage 加载菜单路由
    async loadMenuRoutesFromStorage() {
      const storedRoutes = localStorage.getItem('menuRoutes')
      if (storedRoutes) {
        this.menuRoutes = JSON.parse(storedRoutes)
        this.isRoutesAdded = true
      }
    },
    async setCurrentRoute(route) {
      this.currentRoute = route
    },
    /**
     * 重置路由
     */
    async resetRoutes() {
      this.routes = []
      this.addRoutes = []
      this.isRoutesAdded = false
      this.menuRoutes = []
      this.currentRoute = null
      localStorage.removeItem('menuRoutes')
    },
    // 登录后获取用户角色菜单
    async getRoleMenus(userId) {
      const response = await getUserRoleMenus(userId)
      console.log('response', response)
      const authList =
        response?.items
          .filter((item) => item.menuType === '1')
          .map((item) => ({
            ...item,
            component: item.componentPath, // Map componentPath to component since there's no component value
            path: item.menuPath, // Map menuPath to path
            name: item.permissionKey, // Use displayName or name as title
            meta: {
              title: item.name, // Use displayName or name as title
              icon: item.menuIcon, // Map menuIcon to icon
              keepAlive: item.keepAlive,
              affix: item.affix,
              hidden: item.hidden,
              roles: [] // Use permissionKey as roles
            }
          })) || []
      this.rawAuthData = authList
      const treeRoutes = buildMenuTree(authList)
      console.log('treeRoutes', treeRoutes)
      //   const accessedRoutes = transformAuthToRoute(treeRoutes)
      //   console.log('accessedRoutes', accessedRoutes)
      this.routes = constantRoutes.concat(treeRoutes)
      this.addRoutes = treeRoutes
      return treeRoutes || []
    }
  }
})
