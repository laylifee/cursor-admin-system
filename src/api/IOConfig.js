import request from '@/utils/request'

// 新增IO配置
export function addIOConfig(data) {
  return request({
    url: '/irontracksys/IOConfig',
    method: 'post',
    data
  })
}
// 编辑IO配置
export function updateIOConfig(data) {
  return request({
    url: `/irontracksys/IOConfig/${data.id}`,
    method: 'put',
    data
  })
}
// 删除IO配置
export function deleteIOConfig(data) {
  return request({
    url: `/irontracksys/IOConfig/${data.id}`,
    method: 'delete'
  })
}
// IO配置列表
export function getIOConfigList(params) {
  return request({
    url: '/irontracksys/IOConfig',
    method: 'get',
    params
  })
}
