import request from '@/utils/request'

// 新增协议配置
export function addProtocolConfig(data) {
  return request({
    url: '/irontracksys/ProtocolConfig',
    method: 'post',
    data
  })
}
// 编辑协议配置
export function updateProtocolConfig(data) {
  return request({
    url: `/irontracksys/ProtocolConfig/${data.id}`,
    method: 'put',
    data
  })
}
// 删除协议配置
export function deleteProtocolConfig(data) {
  return request({
    url: `/irontracksys/ProtocolConfig/${data.id}`,
    method: 'delete'
  })
}
// 协议配置列表
export function getProtocolConfigList(params) {
  return request({
    url: '/irontracksys/ProtocolConfig',
    method: 'get',
    params
  })
}
