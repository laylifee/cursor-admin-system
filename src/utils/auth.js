import Cookies from 'js-cookie'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

// 检查是否拥有指定按钮权限
export const hasButtonPermission = (permissionKey) => {
  const permissionStore = usePermissionStore()
  const userStore = useUserStore()
  const routes = permissionStore.routes || []
  if (userStore.userInfo.userName === 'admin') {
    return true
  }

  // 递归查找路由树中的按钮权限
  const findPermission = (menus) => {
    for (const menu of menus) {
      // 检查当前菜单的按钮权限
      if (menu.meta && menu.meta.buttons) {
        // console.log(menu.meta.buttons)
        const hasPermission = menu.meta.buttons.some((btn) => btn.permissionKey === permissionKey)
        if (hasPermission) return true
      }

      // 递归检查子菜单
      if (menu.children && menu.children.length > 0) {
        const found = findPermission(menu.children)
        if (found) return true
      }
    }
    return false
  }

  return findPermission(routes)
}
