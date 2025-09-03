import { db } from './dbConfig.js'
import { ElMessage } from 'element-plus'

// 初始菜单数据
const initialMenuData = [
  {
    name: '仪表盘',
    permission: 'dashboard',
    path: '/dashboard',
    component: 'dashboard/index.vue',
    icon: 'HomeFilled',
    rolePermission: 'admin',
    externalLink: '',
    activePath: '',
    badge: '',
    sort: 1,
    parentId: null,
    status: 1,
    isEnabled: true,
    isCache: true,
    isHidden: false,
    isEmbedded: false,
    showBadge: false,
    fixedTag: false,
    hiddenTag: false
  },
  {
    name: '系统管理',
    permission: 'system',
    path: '/system',
    component: '',
    icon: 'Setting',
    rolePermission: 'admin',
    externalLink: '',
    activePath: '',
    badge: '',
    sort: 100,
    parentId: null,
    status: 1,
    isEnabled: true,
    isCache: true,
    isHidden: false,
    isEmbedded: false,
    showBadge: false,
    fixedTag: false,
    hiddenTag: false
  },
  {
    name: '用户管理',
    permission: 'system:user',
    path: '/system/user',
    component: 'system/user/index.vue',
    icon: 'User',
    rolePermission: 'admin',
    externalLink: '',
    activePath: '',
    badge: '',
    sort: 101,
    parentId: null, // 这个会在插入后更新
    status: 1,
    isEnabled: true,
    isCache: true,
    isHidden: false,
    isEmbedded: false,
    showBadge: false,
    fixedTag: false,
    hiddenTag: false
  },
  {
    name: '角色管理',
    permission: 'system:role',
    path: '/system/role',
    component: 'system/role/index.vue',
    icon: 'UserFilled',
    rolePermission: 'admin',
    externalLink: '',
    activePath: '',
    badge: '',
    sort: 102,
    parentId: null, // 这个会在插入后更新
    status: 1,
    isEnabled: true,
    isCache: true,
    isHidden: false,
    isEmbedded: false,
    showBadge: false,
    fixedTag: false,
    hiddenTag: false
  },
  {
    name: '菜单管理',
    permission: 'system:menu',
    path: '/system/menu',
    component: 'system/menu/index.vue',
    icon: 'Menu',
    rolePermission: 'admin',
    externalLink: '',
    activePath: '',
    badge: '',
    sort: 103,
    parentId: null, // 这个会在插入后更新
    status: 1,
    isEnabled: true,
    isCache: true,
    isHidden: false,
    isEmbedded: false,
    showBadge: false,
    fixedTag: false,
    hiddenTag: false
  },
  {
    name: '权限管理',
    permission: 'system:permission',
    path: '/system/permission',
    component: 'system/permission/index.vue',
    icon: 'Lock',
    rolePermission: 'admin',
    externalLink: '',
    activePath: '',
    badge: '',
    sort: 104,
    parentId: null, // 这个会在插入后更新
    status: 1,
    isEnabled: true,
    isCache: true,
    isHidden: false,
    isEmbedded: false,
    showBadge: false,
    fixedTag: false,
    hiddenTag: false
  },
  {
    name: '个人中心',
    permission: 'profile',
    path: '/profile',
    component: 'profile/index.vue',
    icon: 'User',
    rolePermission: 'admin,user',
    externalLink: '',
    activePath: '',
    badge: '',
    sort: 200,
    parentId: null,
    status: 1,
    isEnabled: true,
    isCache: true,
    isHidden: false,
    isEmbedded: false,
    showBadge: false,
    fixedTag: false,
    hiddenTag: false
  }
]

// 初始化菜单数据
export async function initMenuData() {
  try {
    // 检查是否已有菜单数据
    const menuCount = await db.menu.count()
    if (menuCount > 0) {
      console.log('菜单数据已存在，无需初始化')
      return
    }

    // 插入初始数据
    const menuIds = await db.menu.bulkAdd(initialMenuData)
    
    // 更新子菜单的parentId
    const systemMenu = await db.menu.where({ name: '系统管理' }).first()
    if (systemMenu) {
      const systemMenuId = systemMenu.id
      
      await db.menu
        .where('name')
        .anyOf(['用户管理', '角色管理', '菜单管理', '权限管理'])
        .modify(menu => {
          menu.parentId = systemMenuId
        })
    }
    
    console.log('菜单数据初始化成功')
    ElMessage.success('菜单数据初始化成功')
  } catch (error) {
    console.error('菜单数据初始化失败:', error)
    ElMessage.error('菜单数据初始化失败')
  }
}

export default initMenuData