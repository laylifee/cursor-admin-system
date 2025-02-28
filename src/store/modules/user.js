import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { login, logout, getInfo } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  }),
  
  actions: {
    // 登录
    async login(userInfo) {
      const { username, password } = userInfo
      try {
        const response = await login({ username: username.trim(), password })
        const { data } = response
        this.token = data.token
        setToken(data.token)
        return Promise.resolve()
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async getInfo() {
      try {
        const { data } = await getInfo(this.token)
        const { roles, name, avatar } = data
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
        await logout(this.token)
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
