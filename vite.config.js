import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { viteMockServe } from 'vite-plugin-mock'
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  const env = loadEnv(mode, process.cwd(), '')
  const isBuild = command === 'build'

  return {
    // 项目基础路径
    base: env.VITE_APP_BASE_URL,

    // 插件配置
    plugins: [
      vue(),
      viteMockServe({
        mockPath: 'src/mock',
        localEnabled: true,
        prodEnabled: false,
        logger: true
      })
    ],

    // 路径解析配置
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },

    // 服务器配置
    server: {
      host: true,
      port: 3000,
      open: true,
      cors: true,
      allowedHosts: ['9jvw4utw-7m7uktf0-zobw5iuvdfc.vcc3p.mcprev.cn']
    },

    // CSS 配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/variables.scss";'
        }
      }
    },

    // 构建配置
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  }
})
