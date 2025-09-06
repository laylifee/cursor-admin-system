<template>
  <div class="login-container">
    <div class="login-background">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo-image" />
      </div>
    </div>
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">{{ title }}</h3>
      </div>

      <el-form-item prop="userNameOrEmail">
        <el-input
          ref="usernameRef"
          v-model="loginForm.userNameOrEmail"
          placeholder="用户名"
          type="text"
          tabindex="1"
          autocomplete="on"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          ref="passwordRef"
          v-model="loginForm.password"
          :type="passwordVisible ? 'text' : 'password'"
          placeholder="密码"
          tabindex="2"
          autocomplete="on"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
          <template #suffix>
            <el-icon class="cursor-pointer" @click="passwordVisible = !passwordVisible">
              <View v-if="passwordVisible" />
              <Hide v-else />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <div class="remember-me">
        <el-checkbox v-model="rememberMe">记住我</el-checkbox>
      </div>

      <el-button :loading="loading" type="primary" class="w-full" @click.prevent="handleLogin">
        登录
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { validUsername, validPassword } from '@/utils/validate'
import { ElMessage } from 'element-plus'
const title = computed(() => {
  return import.meta.env.VITE_APP_TITLE || 'Admin System'
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const loginFormRef = ref(null)
const usernameRef = ref(null)
const passwordRef = ref(null)
const loading = ref(false)
const passwordVisible = ref(false)
const rememberMe = ref(true)

const loginForm = ref({
  userNameOrEmail: 'admin',
  password: 'Admin123!'
})

const loginRules = {
  userNameOrEmail: [
    { required: true, trigger: 'blur', message: '请输入用户名' },
    {
      validator: (rule, value, callback) => {
        if (!validUsername(value)) {
          callback(new Error('用户名至少3个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, trigger: 'blur', message: '请输入密码' },
    {
      validator: (rule, value, callback) => {
        if (!validPassword(value)) {
          callback(new Error('密码至少6个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleLogin = () => {
  loginFormRef.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const params = {
          ...loginForm.value,
          rememberMe: rememberMe.value
        }
        await userStore.login(params)
        // await userStore.getInfo()
        // await permissionStore.getRoleMenus(userStore.userInfo.id)
        const redirect = route.query.redirect || '/'
        router.replace(redirect)
        ElMessage.success('登录成功')
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  usernameRef.value?.focus()
})
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  position: relative;
  overflow: hidden;

  .login-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://fastly.picsum.photos/id/19/1920/1080.jpg?hmac=cbrh0kBPEoVfsb2YKz7SzY2Tt1p20W4m5eASktyYbx0');
    background-size: cover;
    background-position: center;
    z-index: 1;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 2;
    }

    .logo-container {
      position: absolute;
      top: 50%;
      left: 10%;
      transform: translateY(-50%);
      z-index: 3;

      .logo-image {
        max-width: 400px;
        width: 100%;
        height: auto;
      }
    }
  }

  .login-form {
    background-color: white;
    border-radius: 0.5rem;
    padding: 2.5rem;
    width: 420px;
    position: relative;
    z-index: 4;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    margin-left: auto;
    margin-right: 10%;
    margin-top: auto;
    margin-bottom: auto;

    .title-container {
      margin-bottom: 2rem;

      .title {
        font-size: 1.8rem;
        font-weight: bold;
        text-align: center;
        color: #374151;
      }
    }

    .remember-me {
      margin-bottom: 1.2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    :deep(.el-input) {
      height: 3rem;
      margin-bottom: 0.5rem;

      input {
        height: 100%;
        padding-left: 2.5rem;
        background: transparent;

        &:-webkit-autofill {
          box-shadow: 0 0 0 1000px white inset !important;
        }
      }

      .el-input__prefix {
        left: 0.5rem;

        .el-icon {
          color: #9ca3af;
        }
      }
    }

    .el-button {
      height: 3rem;
      margin-top: 0.5rem;
      font-size: 1rem;
    }
  }
}

// 响应式布局，确保在小屏幕上登录框不会遮挡logo
@media (max-width: 1200px) {
  .login-container {
    .login-background {
      .logo-container {
        left: 5%;

        .logo-image {
          max-width: 300px;
        }
      }
    }

    .login-form {
      margin-right: 5%;
      width: 380px;
      padding: 2rem;
    }
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    justify-content: center;

    .login-background {
      .logo-container {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        text-align: center;
        padding: 2rem 0;

        .logo-image {
          max-width: 200px;
        }
      }
    }

    .login-form {
      margin: 0 auto;
      width: 90%;
      max-width: 400px;
    }
  }
}
</style>
