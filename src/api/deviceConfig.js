import request from '@/utils/request'

// 新增设备配置
export function addDeviceConfig(data) {
  return request({
    url: '/irontracksys/DeviceConfig',
    method: 'post',
    data
  })
}
// 编辑设备配置
export function updateDeviceConfig(data) {
  return request({
    url: `/irontracksys/DeviceConfig/${data.id}`,
    method: 'put',
    data
  })
}
// 删除设备配置
export function deleteDeviceConfig(data) {
  return request({
    url: `/irontracksys/DeviceConfig/${data.id}`,
    method: 'delete'
  })
}
// 设备配置列表
export function getDeviceConfigList(params) {
  return request({
    url: '/irontracksys/DeviceConfig',
    method: 'get',
    params
  })
}
