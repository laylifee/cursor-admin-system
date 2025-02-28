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

## 功能模块完成度

- **用户管理**: 80%
- **角色管理**: 70%
- **权限管理**: 60%
- **数据统计**: 50%
- **系统设置**: 40%
- **日志管理**: 30%

## 其他说明

- **代码规范**: 本项目使用 ESLint 和 Prettier 进行代码规范检查和格式化。
- **提交规范**: 使用 Commitizen 和 commitlint 进行提交信息规范化管理。

如有任何问题，请参考项目中的文档或联系项目维护者。
