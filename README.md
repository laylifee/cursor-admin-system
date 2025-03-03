# Admin System

## 技术框架说明

本项目是一个基于 Vue 3 和 Vite 的管理系统，使用了以下主要技术栈：

- **Vue 3**: 采用 Vue 3 的 Composition API 和 `<script setup>` 语法，提供更简洁和高效的开发体验。
- **Vite**: 作为构建工具，具有快速的冷启动和热更新能力。
- **Vue Router**: 用于处理应用的路由和导航。
- **Pinia**: 作为状态管理工具，替代 Vuex，提供更简单和灵活的状态管理方案。
- **Element Plus**: 基于 Vue 3 的 UI 组件库，提供丰富的 UI 组件和样式。
- **ECharts**: 用于数据可视化，支持多种图表类型。

## 运行教程

### 环境准备

在开始之前，请确保你的开发环境中已经安装了以下工具：

- **Node.js**: 推荐使用 Node.js 版本 14.x 或以上。
- **npm 或 Yarn**: Node.js 包管理工具，推荐使用 npm 版本 6.x 或以上，或 Yarn 版本 1.x 或以上。

### 克隆项目

首先，将项目代码克隆到本地：

```bash
git clone https://github.com/your-repo/admin-system.git
cd admin-system
```

### 安装依赖

使用 npm 或 Yarn 安装项目依赖：

```bash
# 使用 npm
npm install

# 或使用 Yarn
yarn install
```

### 运行开发服务器

安装依赖后，可以运行开发服务器：

```bash
# 使用 npm
npm run dev

# 或使用 Yarn
yarn dev
```

运行上述命令后，开发服务器将启动，并在浏览器中自动打开项目。你可以在浏览器中访问 `http://localhost:3000` 查看项目效果。

### 构建项目

如果需要构建项目以供生产环境使用，可以运行以下命令：

```bash
# 使用 npm
npm run build

# 或使用 Yarn
yarn build
```

构建完成后，生成的静态文件将位于 `dist` 目录中。

### 部署项目

将 `dist` 目录中的文件部署到你的 Web 服务器上即可。

## 项目结构

```plaintext
admin-system/
├── public/                 # 公共资源目录
├── src/                    # 源代码目录
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   ├── views/              # 视图组件
│   ├── App.vue             # 根组件
│   ├── main.js             # 入口文件
│   └── ...                 # 其他目录和文件
├── .eslintrc.js            # ESLint 配置
├── .prettierrc             # Prettier 配置
├── package.json            # 项目配置文件
├── vite.config.js          # Vite 配置
└── ...                     # 其他配置文件
```

## 功能模块完成度

- **用户管理**: 80%
- **角色管理**: 70%
- **权限管理**: 60%
- **数据统计**: 50%
- **系统设置**: 40%
- **日志管理**: 30%
- **通知管理**: 20%
- **文件管理**: 10%
- **路由管理**: 90%

## 常见问题解答

### 如何解决依赖安装失败的问题？

请确保你的 Node.js 和 npm/Yarn 版本符合要求。如果依然有问题，可以尝试删除 `node_modules` 目录和 `package-lock.json` 文件（或 `yarn.lock` 文件），然后重新安装依赖：

```bash
rm -rf node_modules package-lock.json
npm install

# 或使用 Yarn
rm -rf node_modules yarn.lock
yarn install
```

### 如何配置代理以解决跨域问题？

在 `vite.config.js` 文件中，可以通过 `proxy` 选项配置代理。例如：

```javascript
// vite.config.js
export default {
  // ...existing code...
  server: {
    proxy: {
      '/api': {
        target: 'http://your-api-server.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

## 其他说明

- **代码规范**: 本项目使用 ESLint 和 Prettier 进行代码规范检查和格式化。
- **提交规范**: 使用 Commitizen 和 commitlint 进行提交信息规范化管理。

如有任何问题，请参考项目中的文档或联系项目维护者。

### 六、文档优化建议

```markdown
## 新增优化建议

- 添加单元测试（Vitest + Testing Library）
- 实现自动化部署脚本
- 添加可视化埋点方案
- 引入前端监控（Sentry/BadJS）
- 实现代码分割策略
- 优化图表内存管理

## 项目结构更新

admin-system/
├── tests/ # 测试目录
├── cypress/ # E2E测试
├── docker/ # Docker配置
└── .github/ # CI/CD配置
```
