<template>
  <div class="sidebar">
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { constantRoutes } from '@/router'
import SidebarItem from './SidebarItem.vue'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission.js'

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const isCollapse = computed(() => !appStore.sidebar.opened)

const routes = computed(() => {
  // 合并 constantRoutes 和动态路由 (addRoutes)
  const allRoutes = [...permissionStore.routes]
  console.log('allRoutes所有的路由:', allRoutes)
  return allRoutes.filter((route) => route.meta && !route.meta.hidden)
})
const handleResize = () => {
  if (window.innerWidth < 992) {
    appStore.closeSidebar()
  } else {
    appStore.openSidebar()
  }
}
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const variables = {
  menuText: '#e6e6e6',
  menuActiveText: '#ffffff',
  menuBg: '#2c3e50'
}
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  background-color: #2c3e50;
  transition: width 0.28s;

  :deep(.el-scrollbar) {
    height: 100%;
  }

  :deep(.el-menu) {
    border: none;
    height: 100%;
    width: 100%;
  }

  :deep(.el-menu--collapse) {
    width: 64px;
    .el-sub-menu__title,
    .el-menu-item {
      span {
        display: none;
      }
      .el-sub-menu__icon-arrow {
        display: none;
      }
    }
  }

  :deep(.el-menu-item) {
    &:hover {
      background-color: #34495e !important;
    }
    &.is-active {
      background-color: #3498db !important;
      color: #ffffff !important;
    }
  }

  :deep(.el-sub-menu) {
    &.is-active {
      > .el-sub-menu__title {
        color: #3498db !important;
      }
    }

    .el-sub-menu__title {
      &:hover {
        background-color: #34495e !important;
      }
    }

    &.is-active {
      .el-menu-item.is-active {
        color: #ffffff !important;
      }
    }
  }
}
</style>
