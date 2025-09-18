import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
/***
 * 
 *  {
        path: '/system/user',
        name: 'User', //保持唯一性
        component: () => import('@/views/system/user/index.vue'),
        hidden: false, 是否显示在侧边栏 默认是false
        meta: { title: '用户管理', keepAlive: true, icon: 'User', roles: ['admin'] }
      },
      meta:{
      title: '用户管理',
      keepAlive: false, 默认是不缓存 true 缓存
      icon: 'User', 图标
      affix: false tag标签是否是否固定
      }
 * 
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    hidden: true,
    meta: { title: '登录' }
  },

  {
    path: '/404',
    name: '404',
    meta: { title: '404', icon: '404' },
    component: () => import('@/views/error-page/404.vue'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    name: 'Home',
    redirect: '/dashboard',
    meta: { title: '首页', icon: 'Home' },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          hidden: false,
          icon: 'Odometer',
          roles: ['admin', 'editor'],
          affix: true
        }
      }
    ]
  }
]

export const asyncRoutes = [
  {
    path: '/system',
    component: Layout,
    name: 'System',
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'Setting', roles: ['admin'] },
    children: [
      {
        path: '/system/user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', keepAlive: true, icon: 'User', roles: ['admin'] }
      },
      {
        path: '/system/role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', keepAlive: true, icon: 'UserFilled', roles: ['admin'] }
      },
      {
        path: '/system/menu',
        name: 'Route',
        component: () => import('@/views/system/menu/index.vue'),
        meta: { title: '菜单管理', icon: 'Guide', roles: ['admin'] }
      },
      {
        path: '/system/deviceConfig',
        name: 'DeviceConfig',
        component: () => import('@/views/system/deviceConfig/index.vue'),
        meta: { title: '设备配置', icon: 'Guide', roles: ['admin'] }
      },
      {
        path: '/system/IOConfig',
        name: 'IOConfig',
        component: () => import('@/views/system/IOConfig/index.vue'),
        meta: { title: 'IO配置', icon: 'Guide', roles: ['admin'] }
      },
      {
        path: '/system/protocolConfig',
        name: 'ProtocolConfig',
        component: () => import('@/views/system/protocolConfig/index.vue'),
        meta: { title: '协议配置', icon: 'Guide', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    name: 'ProfileIndex',
    meta: { title: '个人中心', icon: 'User' },
    children: [
      {
        path: '/profile/index',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', icon: 'User' }
      }
    ]
  }
]

const router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
