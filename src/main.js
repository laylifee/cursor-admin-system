import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 搜索区域组件
import SearchWrapper from '@/components/SearchWrapper.vue'
import App from './App.vue'
import router from './router'
import './styles/index.scss' // 引入全局样式
import './router/permission' // 引入路由守卫
import { usePermissionStore } from '@/store/modules/permission'
const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.component('SearchWrapper', SearchWrapper)
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 应用启动时初始化路由存储
const routeStore = usePermissionStore()
routeStore.loadMenuRoutesFromStorage()

// 全局挂载 ElMessage
// app.config.globalProperties.$message = ElMessage

app.mount('#app')
