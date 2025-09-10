import { hasButtonPermission } from '@/utils/auth'

// 注册权限指令
export const setupPermissionDirective = (app) => {
  app.directive('has-permission', {
    mounted(el, binding) {
      const { value } = binding
      if (!hasButtonPermission(value)) {
        el.style.display = 'none'
        // 或者移除元素
        // el.parentNode && el.parentNode.removeChild(el)
      }
    }
  })
}
