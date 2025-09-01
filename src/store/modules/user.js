import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, logout, getInfo } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    userInfo: {}
  }),
  // 添加持久化存储配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage
      }
    ]
  },

  actions: {
    // 登录
    async login(userInfo) {
      try {
        const response = await login({
          ...userInfo
        })
        console.log(response, '用户信息')

        this.token = response.accessToken
        this.userInfo = response.user
        setToken(this.token)
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async getInfo() {
      try {
        // const { data } = await getInfo(this.token)
        const data = {
          roles: ['admin'],
          name: 'admin',
          avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
        }
        const { roles, name, avatar } = {
          roles: ['admin'],
          name: 'admin',
          avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
        }
        this.roles = roles
        this.name = name
        this.avatar = avatar
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 登出
    async logout() {
      try {
        await logout()
        this.token = ''
        this.roles = []
        removeToken()
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 重置token
    resetToken() {
      this.token = ''
      this.roles = []
      removeToken()
    }
  }
})
