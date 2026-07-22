import request from '@/utils/request'

// 获取标准记录列表
export function getStandardRecordList(params) {
  return request({
    url: '/irontracksys/alarm-rule',
    method: 'get',
    params
  })
}
// 新增标准记录
export function addStandardRecord(data) {
  return request({
    url: '/irontracksys/alarm-rule',
    method: 'post',
    data
  })
}
// 删除标准记录
export function deleteStandardRecord(data) {
  return request({
    url: `/irontracksys/alarm-rule/${data.id}`,
    method: 'delete'
  })
}
// 更新标准记录
export function updateStandardRecord(data) {
  return request({
    url: `/irontracksys/alarm-rule`,
    method: 'put',
    data
  })
}
// 获取标准记录详情
export function getStandardRecordDetail(data) {
  return request({
    url: `/irontracksys/alarm-rule/${data.id}`,
    method: 'get'
  })
}
