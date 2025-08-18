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

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const isCollapse = computed(() => !appStore.sidebar.opened)

const routes = computed(() => {
  return constantRoutes.filter((route) => {
    if (route.hidden) return false

    // 检查是否有权限访问该路由
    if (route.meta && route.meta.roles) {
      return route.meta.roles.some((role) => userStore.roles.includes(role))
    }
    return true
  })
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
  menuText: '#bfcbd9',
  menuActiveText: '#409eff',
  menuBg: '#304156'
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
  background-color: $menu-bg-color;
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
      background-color: #263445 !important;
    }
    &.is-active {
      background-color: #1890ff !important;
      color: #ffffff !important;
    }
  }

  :deep(.el-sub-menu) {
    &.is-active {
      > .el-sub-menu__title {
        color: #f4f4f5 !important;
      }
    }

    .el-sub-menu__title {
      &:hover {
        background-color: #263445 !important;
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
