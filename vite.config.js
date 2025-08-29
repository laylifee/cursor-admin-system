import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { viteMockServe } from 'vite-plugin-mock'
import basicSsl from '@vitejs/plugin-basic-ssl'
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
      // 添加basic-ssl插件，提供开发环境自签名证书
      // basicSsl(),
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
      extensions: [
        '.mjs',
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.vue',
        '.jpg',
        '.jpeg',
        '.png',
        '.svg'
      ]
    },

    // 服务器配置
    server: {
      host: true,
      port: 3000,
      open: true,
      cors: true,
      // 开发环境使用http
      // 使用basic-ssl插件提供自签名证书
      // https: true,
      proxy: {
        '/irontracksys': {
          target: 'http://localhost:44392/irontracksys',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/irontracksys/, '')
          // 忽略自签名证书验证
          // https: {
          //   rejectUnauthorized: false
          // }
        }
      }
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
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      resolve: {
        browserField: false,
        mainFields: ['module', 'jsnext:main', 'jsnext']
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
