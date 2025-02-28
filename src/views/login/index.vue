<template>
  <div class="login-container">
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

      <el-form-item prop="username">
        <el-input
          ref="usernameRef"
          v-model="loginForm.username"
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
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { validUsername, validPassword } from '@/utils/validate'
import { ElMessage } from 'element-plus'

const title = computed(() => {
  return import.meta.env.VITE_APP_TITLE || 'Admin System'
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const usernameRef = ref(null)
const passwordRef = ref(null)
const loading = ref(false)
const passwordVisible = ref(false)

const loginForm = ref({
  username: 'admin',
  password: '123456'
})

const loginRules = {
  username: [
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
        await userStore.login(loginForm.value)
        await userStore.getInfo()
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
  background-color: rgb(243, 244, 246);
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form {
    background-color: white;
    border-radius: 0.5rem;
    padding: 2rem;
    width: 400px;

    .title-container {
      margin-bottom: 2rem;

      .title {
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        color: #374151;
      }
    }

    :deep(.el-input) {
      height: 3rem;

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
      margin-top: 1rem;
    }
  }
}
</style>
