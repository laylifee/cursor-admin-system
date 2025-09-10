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

      // 分离菜单数据和按钮权限数据
      const allItems = response?.items || []
      const menuItems = allItems
        .filter((item) => item.menuType === '1' || item.menuType === '3') // 只保留目录和菜单
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
            roles: [], // Use permissionKey as roles
            buttons: [] // 为每个菜单预留按钮权限数组
          }
        }))

      // 收集所有按钮权限
      const buttonPermissions = allItems
        .filter((item) => item.menuType === '2') // 只保留按钮权限
        .map((item) => ({
          id: item.id,
          parentId: item.parentId,
          permissionKey: item.permissionKey,
          name: item.name
        }))

      // 将按钮权限添加到对应的父菜单
      const addButtonsToParentMenu = (menus, buttons) => {
        menus.forEach((menu) => {
          // 查找当前菜单的按钮权限
          const menuButtons = buttons.filter((btn) => btn.parentId === menu.id)
          if (menuButtons.length > 0) {
            menu.meta.buttons = menuButtons
          }

          // 递归处理子菜单
          if (menu.children && menu.children.length > 0) {
            addButtonsToParentMenu(menu.children, buttons)
          }
        })
      }

      const menuTree = buildMenuTree(menuItems)
      addButtonsToParentMenu(menuTree, buttonPermissions)

      this.rawAuthData = menuTree
      console.log('menuTree with buttons', menuTree)
      return menuTree || []
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
