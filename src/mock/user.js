import Mock from 'mockjs'

// 用户列表
const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    roles: ['admin'],
    name: '超级管理员',
    avatar: Mock.Random.image('100x100', '#409EFF', '#fff', 'A'),
    introduction: '我是超级管理员',
    token: 'admin-token'
  },
  {
    id: 2,
    username: 'editor',
    password: '123456',
    roles: ['editor'],
    name: '编辑人员',
    avatar: Mock.Random.image('100x100', '#52C41A', '#fff', 'E'),
    introduction: '我是编辑',
    token: 'editor-token'
  },
  {
    id: 3,
    username: 'test',
    password: '123456',
    roles: ['visitor'],
    name: '测试人员',
    avatar: Mock.Random.image('100x100', '#F6CA9D', '#fff', 'T'),
    introduction: '我是测试人员',
    token: 'test-token'
  }
]

export default [
  // 用户登录
  {
    url: '/user/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body
      const user = users.find((item) => item.username === username && item.password === password)

      if (!user) {
        return {
          code: 401,
          message: '用户名或密码错误'
        }
      }

      return {
        code: 200,
        data: {
          token: user.token
        },
        message: '登录成功'
      }
    }
  },

  // 获取用户信息
  {
    url: '/user/info',
    method: 'get',
    response: ({ query }) => {
      const { token } = query
      const user = users.find((item) => item.token === token)

      if (!user) {
        return {
          code: 401,
          message: '无效的token'
        }
      }

      return {
        code: 200,
        data: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          roles: user.roles,
          introduction: user.introduction
        }
      }
    }
  },

  // 用户登出
  {
    url: '/user/logout',
    method: 'post',
    response: () => {
      return {
        code: 200,
        data: null,
        message: '登出成功'
      }
    }
  },

  // 获取用户列表
  {
    url: '/user/list',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, limit = 10 } = query
      const list = users.map(({ password, token, ...rest }) => rest)
      const start = (page - 1) * limit
      const end = start + limit

      return {
        code: 200,
        data: {
          total: list.length,
          list: list.slice(start, end)
        }
      }
    }
  }
]
