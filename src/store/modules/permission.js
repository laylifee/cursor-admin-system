import { defineStore } from 'pinia'
import { getPermissionList } from '@/api/permission.js'
import { constantRoutes, asyncRoutes } from '@/router/index.js'
import { getUserRoleMenus } from '@/api/permission.js'
import router from '@/router'
import { buildMenuTree } from '@/utils/tools.js'
import { generateRoutesByServer } from '@/router/dynamic-routes.js'
import { cloneDeep } from 'lodash-es'
// 用于临时存储原始权限数据，不包含component函数
export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    rawAuthData: [],
    isRoutesAdded: false
  }),
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'permission',
        storage: localStorage,
        paths: ['isRoutesAdded', 'routes', 'addRoutes', 'rawAuthData'] // 持久化所有路由相关数据
      }
    ]
  },

  actions: {
    async setRoutesAdded(val) {
      this.isRoutesAdded = val
    },
    /**
     * 重置路由
     */
    async resetRoutes() {
      this.routes = []
      this.addRoutes = []
      this.rawAuthData = []
      this.isRoutesAdded = false
    },
    // 登录后获取用户角色菜单
    async getRoleMenus(userId) {
      const response = await getUserRoleMenus(userId)
      console.log('response', response)
      const authList =
        response?.items
          .filter((item) => item.menuType === '1' || item.menuType === '3')
          .map((item) => ({
            ...item,
            component: item.componentPath, // Map componentPath to component since there's no component value
            path: item.menuPath, // Map menuPath to path
            name: item.permissionKey, // Use displayName or name as title
            hidden: item.hidden,
            meta: {
              title: item.name, // Use displayName or name as title
              icon: item.menuIcon, // Map menuIcon to icon
              keepAlive: item.keepAlive,
              affix: item.affix,
              roles: [] // Use permissionKey as roles
            }
          })) || []
      this.rawAuthData = authList
      const treeRoutes = buildMenuTree(authList)
      console.log('treeRoutes', treeRoutes)
      return treeRoutes || []
    },
    generateRoutes(routers) {
      return new Promise((resolve, reject) => {
        try {
          let routerMap = []
          routerMap = generateRoutesByServer(routers)
          console.log('routerMap', routerMap)
          // 动态路由，404一定要放到最后面
          this.addRoutes = routerMap.concat([
            {
              path: '/:path(.*)*',
              redirect: '/404',
              name: 'NotFound',
              hidden: true,
              meta: {
                title: '404',
                icon: '404'
              }
            }
          ])
          // 渲染菜单的所有路由
          this.routes = cloneDeep(constantRoutes).concat(routerMap)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    }
  }
})
