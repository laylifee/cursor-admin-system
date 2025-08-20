<template>
  <div class="app-wrapper" :class="{ 'sidebar-collapse': !appStore.sidebar.opened }">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :style="{ width: sidebarWidth }">
      <div class="logo-container">
        <router-link to="/" class="logo-link">
          <img src="../assets/logo.svg" class="logo-img" alt="Logo" />
          <h1 class="logo-title" v-show="!isCollapse">{{ title }}</h1>
        </router-link>
      </div>
      <Sidebar />
    </div>

    <div class="main-container" :style="{ marginLeft: sidebarWidth }">
      <!-- 顶部导航栏 -->
      <Navbar />

      <!-- 标签导航栏 -->
      <TagsView />

      <!-- 主要内容区 -->
      <AppMain />
    </div>
  </div>
</template>

<script setup>
import { computed, provide } from 'vue'
import { useAppStore } from '@/store/modules/app'
import Navbar from './components/Navbar/index.vue'
import Sidebar from './components/Sidebar/index.vue'
import AppMain from './components/AppMain/index.vue'
import TagsView from './components/TagsView/index.vue'

const appStore = useAppStore()
const title = import.meta.env.VITE_APP_TITLE

const isCollapse = computed(() => !appStore.sidebar.opened)
const sidebarWidth = computed(() => (isCollapse.value ? '64px' : '210px'))
provide('isCollapse', isCollapse)
provide('sidebarWidth', sidebarWidth)
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
  overflow-y: scroll;

  /* Custom scrollbar styles to match Element Plus */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdcdc;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #c1c1c1;
  }
}

.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  background-color: $menu-bg-color;
  transition: width 0.28s;
  z-index: 1001;
  overflow: hidden;

  .logo-container {
    height: 50px;
    padding: 10px;
    display: flex;
    align-items: center;
    background-color: darken($menu-bg-color, 2%);

    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      width: 100%;
      overflow: hidden;
    }

    .logo-img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }

    .logo-title {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
    }
  }
}

.main-container {
  height: 100%;
  transition: margin-left 0.28s;
  position: relative;
  overflow: hidden;
}

.sidebar-collapse {
  .logo-title {
    display: none;
  }
}
</style>
