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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/404',
    hidden: true,
    meta: { title: '404', icon: '404' }
  }
]

export const asyncRoutes = [
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
  },
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
  },
  {
    path: '/test/1',
    name: 'Test1',
    component: () => import('@/views/test/index.vue'),
    meta: { title: '测试1', icon: 'Test', roles: ['admin'] }
  },
  {
    path: '/test/2',
    name: 'Test2',
    component: Layout,
    meta: { title: '测试2', icon: 'Test', roles: ['admin'] },
    children: [
      {
        path: '/test/2/1',
        name: 'Test21',
        component: () => import('@/views/test/index.vue'),
        meta: { title: '测试21', icon: 'Test', roles: ['admin'] }
      },
      {
        path: '/test/2/2',
        name: 'Test22',
        component: () => import('@/views/test/index.vue'),
        meta: { title: '测试22', icon: 'Test', roles: ['admin'] }
      },
      {
        path: '/test/2/3',
        name: 'Test23',
        component: () => import('@/views/test/index.vue'),
        meta: { title: '测试23', icon: 'Test', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/test/3',
    name: 'Test3',
    component: Layout,
    meta: { title: '测试3', icon: 'Test', roles: ['admin'] },
    children: [
      {
        path: '/test/3/1',
        name: 'Test31',
        component: () => import('@/views/test/index.vue'),
        meta: { title: '测试31', icon: 'Test', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/test/4',
    name: 'Test4',
    component: () => import('@/views/test/index.vue'),
    meta: { title: '测试4', icon: 'Test', roles: ['admin'] }
  }
]

const router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes: constantRoutes.concat(asyncRoutes),
  scrollBehavior: () => ({ top: 0 })
})

export default router
