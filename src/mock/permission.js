import Mock from 'mockjs'

// 权限列表数据
const permissions = [
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    isActive: true
  },
  {
    id: 2,
    name: '内容编辑',
    code: 'editor',
    description: '负责内容管理',
    isActive: true
  },
  {
    id: 3,
    name: '普通用户',
    code: 'user',
    description: '普通用户权限',
    isActive: true
  },
  {
    id: 4,
    name: '访客',
    code: 'visitor',
    description: '只读权限',
    isActive: false
  }
]

// 菜单列表数据
const menus = [
  {
    id: 1,
    name: '仪表盘',
    code: 'dashboard',
    parentId: 0,
    path: '/dashboard',
    icon: 'HomeFilled',
    children: []
  },
  {
    id: 2,
    name: '系统管理',
    code: 'system',
    parentId: 0,
    path: '/system',
    icon: 'Setting',
    children: [
      {
        id: 3,
        name: '用户管理',
        code: 'user',
        parentId: 2,
        path: '/system/user',
        icon: 'User',
        children: []
      },
      {
        id: 4,
        name: '角色管理',
        code: 'role',
        parentId: 2,
        path: '/system/role',
        icon: 'UserFilled',
        children: []
      },
      {
        id: 5,
        name: '权限管理',
        code: 'permission',
        parentId: 2,
        path: '/system/permission',
        icon: 'Key',
        children: []
      }
    ]
  },
  {
    id: 6,
    name: '内容管理',
    code: 'content',
    parentId: 0,
    path: '/content',
    icon: 'Document',
    children: []
  }
]

// 按钮列表数据
const buttons = [
  {
    id: 1,
    name: '新增',
    code: 'add',
    description: '新增数据'
  },
  {
    id: 2,
    name: '编辑',
    code: 'edit',
    description: '编辑数据'
  },
  {
    id: 3,
    name: '删除',
    code: 'delete',
    description: '删除数据'
  },
  {
    id: 4,
    name: '查看',
    code: 'view',
    description: '查看详情'
  },
  {
    id: 5,
    name: '导入',
    code: 'import',
    description: '导入数据'
  },
  {
    id: 6,
    name: '导出',
    code: 'export',
    description: '导出数据'
  }
]

// 权限-菜单映射关系
const permissionMenus = {
  1: [1, 2, 3, 4, 5, 6], // 超级管理员拥有所有菜单
  2: [1, 6], // 内容编辑只有仪表盘和内容管理
  3: [1], // 普通用户只有仪表盘
  4: [1]  // 访客只有仪表盘
}

// 权限-按钮映射关系
const permissionButtons = {
  1: [1, 2, 3, 4, 5, 6], // 超级管理员拥有所有按钮
  2: [1, 2, 4, 5, 6],    // 内容编辑没有删除权限
  3: [4],                // 普通用户只有查看权限
  4: [4]                 // 访客只有查看权限
}

export default [
  // 获取权限列表
  {
    url: '/permission/list',
    method: 'get',
    response: ({ query }) => {
      const { SkipCount = 1, MaxResultCount = 20, name = '', code = '' } = query
      let filteredList = permissions
      
      // 按名称和编码筛选
      if (name) {
        filteredList = filteredList.filter(item => item.name.includes(name))
      }
      if (code) {
        filteredList = filteredList.filter(item => item.code.includes(code))
      }
      
      // 分页处理
      const page = parseInt(SkipCount) || 1
      const limit = parseInt(MaxResultCount) || 20
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedList = filteredList.slice(start, end)
      
      return {
        code: 200,
        data: {
          items: paginatedList,
          totalCount: filteredList.length
        }
      }
    }
  },
  
  // 获取权限详情
  {
    url: '/permission/detail',
    method: 'get',
    response: ({ query }) => {
      const { id } = query
      const permission = permissions.find(item => item.id === parseInt(id))
      
      if (!permission) {
        return {
          code: 404,
          message: '权限不存在'
        }
      }
      
      return {
        code: 200,
        data: permission
      }
    }
  },
  
  // 新增权限
  {
    url: '/permission/add',
    method: 'post',
    response: ({ body }) => {
      const newPermission = {
        id: permissions.length + 1,
        ...body,
        isActive: body.isActive !== false // 默认启用
      }
      permissions.push(newPermission)
      
      // 初始化权限的菜单和按钮映射
      permissionMenus[newPermission.id] = []
      permissionButtons[newPermission.id] = []
      
      return {
        code: 200,
        data: newPermission,
        message: '新增权限成功'
      }
    }
  },
  
  // 编辑权限
  {
    url: '/permission/edit',
    method: 'put',
    response: ({ body }) => {
      const index = permissions.findIndex(item => item.id === parseInt(body.id))
      
      if (index === -1) {
        return {
          code: 404,
          message: '权限不存在'
        }
      }
      
      permissions[index] = { ...permissions[index], ...body }
      
      return {
        code: 200,
        data: permissions[index],
        message: '编辑权限成功'
      }
    }
  },
  
  // 删除权限
  {
    url: '/permission/delete',
    method: 'delete',
    response: ({ query }) => {
      const { id } = query
      const index = permissions.findIndex(item => item.id === parseInt(id))
      
      if (index === -1) {
        return {
          code: 404,
          message: '权限不存在'
        }
      }
      
      // 不能删除超级管理员
      if (parseInt(id) === 1) {
        return {
          code: 403,
          message: '超级管理员不能删除'
        }
      }
      
      permissions.splice(index, 1)
      
      // 删除对应的菜单和按钮映射
      delete permissionMenus[id]
      delete permissionButtons[id]
      
      return {
        code: 200,
        data: null,
        message: '删除权限成功'
      }
    }
  },
  
  // 获取菜单列表
  {
    url: '/menu/list',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          items: menus
        }
      }
    }
  },
  
  // 获取已分配的菜单
  {
    url: '/permission/assignedMenus',
    method: 'get',
    response: ({ query }) => {
      const { permissionId } = query
      const menuIds = permissionMenus[permissionId] || []
      
      return {
        code: 200,
        data: {
          menuIds
        }
      }
    }
  },
  
  // 分配菜单权限
  {
    url: '/permission/assignMenus',
    method: 'post',
    response: ({ body }) => {
      const { permissionId, menuIds } = body
      
      if (permissionMenus.hasOwnProperty(permissionId)) {
        permissionMenus[permissionId] = menuIds
      }
      
      return {
        code: 200,
        data: null,
        message: '菜单权限配置成功'
      }
    }
  },
  
  // 获取按钮列表
  {
    url: '/button/list',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: {
          items: buttons
        }
      }
    }
  },
  
  // 获取已分配的按钮
  {
    url: '/permission/assignedButtons',
    method: 'get',
    response: ({ query }) => {
      const { permissionId } = query
      const buttonIds = permissionButtons[permissionId] || []
      
      return {
        code: 200,
        data: {
          buttonIds
        }
      }
    }
  },
  
  // 分配按钮权限
  {
    url: '/permission/assignButtons',
    method: 'post',
    response: ({ body }) => {
      const { permissionId, buttonIds } = body
      
      if (permissionButtons.hasOwnProperty(permissionId)) {
        permissionButtons[permissionId] = buttonIds
      }
      
      return {
        code: 200,
        data: null,
        message: '按钮权限配置成功'
      }
    }
  }
]