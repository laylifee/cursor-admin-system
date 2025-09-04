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
 * 获取角色的权限
 * @param {string} roleId - 角色ID
 * @returns {Promise}
 */
export const getRolePermissions = (roleId) => {
  return request({
    url: `/irontracksys/identity/permissions/role-permissions`,
    method: 'get',
    params: {
      RoleId: roleId
    }
  })
}

// 分配角色权限
export const assignRolePermissions = (data) => {
  return request({
    url: `/irontracksys/identity/permissions/role-permissions`,
    method: 'post',
    data
  })
}
