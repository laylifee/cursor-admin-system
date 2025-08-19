<template>
  <div class="navbar" :class="{ 'is-collapse': isCollapse }">
    <div class="left-menu">
      <hamburger class="hamburger-container" />
      <breadcrumb class="breadcrumb-container" />
    </div>

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <el-avatar :size="30" :src="userStore.avatar" />
          <span class="user-name">{{ userStore.name }}</span>
          <el-icon><CaretBottom /></el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { CaretBottom, SwitchButton } from '@element-plus/icons-vue'
import Hamburger from './Hamburger.vue'
import Breadcrumb from './Breadcrumb.vue'
import { computed } from 'vue'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const isCollapse = computed(() => !appStore.sidebar.opened)
const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 48px; // 3rem to 48px
  overflow: hidden;
  background-color: white;
  // box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: fixed;
  top: 0;
  right: 0;
  width: calc(100% - 210px);
  z-index: 9;
  transition: width 0.28s;
  box-sizing: border-box;
  &.is-collapse {
    width: calc(100% - 64px);
  }
  .left-menu {
    float: left;
    height: 100%;
    display: flex;
    align-items: center;

    .hamburger-container {
      padding: 0 16px; // 1rem to 16px
      cursor: pointer;
      display: flex;
      align-items: center;
      height: 100%;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }
  }

  .right-menu {
    float: right;
    height: 100%;

    .avatar-container {
      cursor: pointer;

      .avatar-wrapper {
        display: flex;
        align-items: center;
        padding: 0 16px; // 1rem to 16px
        height: 48px; // 3rem to 48px

        .user-name {
          margin: 0 8px; // 0.5rem to 8px
        }

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }
  }
}
</style>
