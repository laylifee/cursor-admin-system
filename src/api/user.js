import request from '@/utils/request'

// 用户管理-用户列表
export function getUserList(params) {
  return request({
    url: '/irontracksys/identity/users',
    method: 'get',
    params
  })
}

// 用户管理-用户详情
export function getUserDetail(params) {
  return request({
    url: '/identity/users/' + params.id,
    method: 'get'
  })
}
// 用户管理-用户编辑
export function editUser(params) {
  return request({
    url: '/irontracksys/identity/users/' + params.id,
    method: 'put',
    data: params
  })
}
// 用户管理-用户添加
export function addUser(params) {
  return request({
    url: '/irontracksys/identity/users',
    method: 'post',
    data: params
  })
}

// 用户管理-用户删除
export function deleteUser(params) {
  return request({
    url: '/irontracksys/identity/users/' + params.id,
    method: 'delete'
  })
}

// 用户管理-登录
export function login(data) {
  return request({
    url: '/irontracksys/account/login',
    method: 'post',
    data
  })
}
// 用户修改密码
export function updatePassword(data) {
  return request({
    url: '/irontracksys/identity/users/' + data.id + '/change-password',
    method: 'post',
    data
  })
}
// 用户管理-登出
export function logout() {
  return request({
    url: '/irontracksys/account/logout',
    method: 'post'
    // params: { token }
  })
}
