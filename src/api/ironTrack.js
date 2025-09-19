import request from '@/utils/request'

// 新增RFID标签
export function addRfidLabel(data) {
  return request({
    url: '/irontracksys/RfidLabel',
    method: 'post',
    data
  })
}
// 编辑RFID标签
export function updateRfidLabel(data) {
  return request({
    url: `/irontracksys/RfidLabel/${data.id}`,
    method: 'put',
    data
  })
}
// 删除RFID标签
export function deleteRfidLabel(data) {
  return request({
    url: `/irontracksys/RfidLabel/${data.id}`,
    method: 'delete'
  })
}
// RFID标签列表
export function getRfidLabelList(params) {
  return request({
    url: '/irontracksys/RfidLabel',
    method: 'get',
    params
  })
}
