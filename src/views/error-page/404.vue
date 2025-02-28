<template>
  <div class="error-404">
    <div class="error-404__content">
      <h1 class="error-404__title">404</h1>
      <div class="error-404__desc">抱歉，您访问的页面不存在</div>
      <div class="error-404__actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
        <el-button @click="logout">登出</el-button>
      </div>
      <div class="error-404__info">
        <h3>可能的原因：</h3>
        <ul>
          <li>网址输入错误</li>
          <li>页面已被移动或删除</li>
          <li>没有访问权限</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.error-404 {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;

  &__content {
    background-color: white;
    border-radius: 8px; // 0.5rem to 8px
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 48px; // 3rem to 48px
    text-align: center;
    max-width: 512px; // 32rem to 512px
    width: 100%;
  }

  &__title {
    font-size: 96px; // 6rem to 96px
    font-weight: bold;
    color: #374151;
    margin-bottom: 16px; // 1rem to 16px
    background: linear-gradient(120deg, #1890ff, #722ed1);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__desc {
    font-size: 20px; // 1.25rem to 20px
    color: #4b5563;
    margin-bottom: 32px; // 2rem to 32px
  }

  &__actions {
    margin-bottom: 32px; // 2rem to 32px

    .el-button + .el-button {
      margin-left: 16px; // 1rem to 16px
    }
  }

  &__info {
    text-align: left;
    color: #4b5563;

    h3 {
      font-size: 18px; // 1.125rem to 18px
      font-weight: 500;
      margin-bottom: 8px; // 0.5rem to 8px
    }

    ul {
      list-style-type: disc;
      list-style-position: inside;
      color: #6b7280;

      li {
        margin-bottom: 4px; // 0.25rem to 4px
      }
    }
  }
}
</style>
