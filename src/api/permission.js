import request from '@/utils/request'

/**
 * 获取权限列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getPermissionList = (params) => {
  return request({
    url: '/irontracksys/identity/permissions',
    method: 'get',
    params
  })
}

/**
 * 获取权限详情
 * @param {string} id - 权限ID
 * @returns {Promise}
 */
export const getPermissionDetail = (id) => {
  return request({
    url: `/irontracksys/identity/permissions/${id}`,
    method: 'get'
  })
}

/**
 * 新增权限
 * @param {Object} data - 权限数据
 * @returns {Promise}
 */
export const addPermission = (data) => {
  return request({
    url: '/irontracksys/identity/permissions',
    method: 'post',
    data
  })
}

/**
 * 编辑权限
 * @param {Object} data - 权限数据
 * @returns {Promise}
 */
export const editPermission = (data) => {
  return request({
    url: `/irontracksys/identity/permissions/${data.id}`,
    method: 'put',
    data
  })
}

/**
 * 删除权限
 * @param {string} id - 权限ID
 * @returns {Promise}
 */
export const deletePermission = (id) => {
  return request({
    url: `/irontracksys/identity/permissions/${id}`,
    method: 'delete'
  })
}

/**
 * 获取菜单列表（用于权限分配）
 * @returns {Promise}
 */
export const getMenuList = () => {
  return request({
    url: '/menu/list-all',
    method: 'get'
  })
}

/**
 * 分配菜单权限
 * @param {Object} data - 权限分配数据
 * @returns {Promise}
 */
export const assignMenuPermissions = (data) => {
  return request({
    url: '/permission/assign-menu',
    method: 'post',
    data
  })
}

/**
 * 获取按钮权限列表
 * @returns {Promise}
 */
export const getButtonList = () => {
  return request({
    url: '/button/list-all',
    method: 'get'
  })
}

/**
 * 分配按钮权限
 * @param {Object} data - 权限分配数据
 * @returns {Promise}
 */
export const assignButtonPermissions = (data) => {
  return request({
    url: '/permission/assign-button',
    method: 'post',
    data
  })
}

/**
 * 获取指定权限已分配的菜单
 * @param {string} permissionId - 权限ID
 * @returns {Promise}
 */
export const getAssignedMenus = (permissionId) => {
  return request({
    url: `/permission/assigned-menus/${permissionId}`,
    method: 'get'
  })
}

/**
 * 获取指定权限已分配的按钮
 * @param {string} permissionId - 权限ID
 * @returns {Promise}
 */
export const getAssignedButtons = (permissionId) => {
  return request({
    url: `/permission/assigned-buttons/${permissionId}`,
    method: 'get'
  })
}
