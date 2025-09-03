import userMock from './user'
import permissionMock from './permission'

export function setupProdMockServer() {
  // 生产环境下的 mock 服务
}

// 导出所有mock数据
export default [...userMock, ...permissionMock]
