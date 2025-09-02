import request from '@/utils/request'

// 角色管理-角色列表
export function getRoleList(params) {
  return request({
    url: '/irontracksys/identity/roles',
    method: 'get',
    params
  })
}
// 角色管理-新增角色
export function addRole(data) {
  return request({
    url: '/irontracksys/identity/roles',
    method: 'post',
    data
  })
}
// 角色管理-删除角色
export function deleteRole(params) {
  return request({
    url: '/irontracksys/identity/roles/' + params.id,
    method: 'delete'
  })
}
// 角色管理-编辑角色
export function updateRole(data) {
  return request({
    url: '/irontracksys/identity/roles/' + data.id,
    method: 'put',
    data
  })
}
// 角色管理-获取角色详情
export function getRoleDetail(params) {
  return request({
    url: '/irontracksys/identity/roles/' + params.id,
    method: 'get',
    params
  })
}
