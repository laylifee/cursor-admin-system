import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  // 在开发环境中使用相对路径，让Vite代理处理请求
  // 生产环境使用绝对路径
  // baseURL: import.meta.env.DEV
  //   ? '/irontracksys'
  //   : import.meta.env.VITE_APP_API_BASE_URL || 'https://localhost:44392/irontracksys',
  baseURL: '',
  // baseURL: '/irontracksys',
  timeout: 5000,
  withCredentials: true
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 配置请求头
    // config.headers['Content-Type'] = 'application/json'
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    console.log('请求响应原始数据', res)
    if (res.code !== 200) {
      if (res.code === 401) {
        ElMessage({
          message: '登录过期，请重新登录',
          type: 'error',
          duration: 5 * 1000
        })
        router.push(`/login?redirect=${router.currentRoute.value.fullPath}`)
      } else {
        ElMessage({
          message: res.message || '错误',
          type: 'error',
          duration: 5 * 1000
        })
      }
      return Promise.reject(new Error(res.message || '错误'))
    } else {
      return Promise.resolve(res.data)
    }
  },
  (error) => {
    console.log(error)
    let data = error.response.data?.data
    ElMessage({
      message: data.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject()
  }
)

// 上传文件
export function uploadFile(url, file) {
  const formData = new FormData()
  formData.append('file', file)

  return service.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载文件
export function downloadFile(url, params) {
  return service
    .get(url, {
      params,
      responseType: 'blob'
    })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'file') // 指定文件名
      document.body.appendChild(link)
      link.click()
      link.remove()
    })
}

export default service
