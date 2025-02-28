<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" link @click="handleEdit">编辑</el-button>
            </div>
          </template>
          <div class="profile-box">
            <div class="avatar-wrapper">
              <el-avatar :size="100" :src="userInfo.avatar" />
            </div>
            <div class="info-list">
              <div class="info-item">
                <span class="label">用户名：</span>
                <span class="value">{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">姓名：</span>
                <span class="value">{{ userInfo.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">角色：</span>
                <span class="value">
                  <el-tag v-for="role in userInfo.roles" :key="role" class="mr-1">
                    {{ role }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="label">简介：</span>
                <span class="value">{{ userInfo.introduction }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdatePassword">保存</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { validPassword } from '@/utils/validate'

const userStore = useUserStore()
const userInfo = ref({
  username: userStore.name,
  name: userStore.name,
  avatar: userStore.avatar,
  roles: userStore.roles,
  introduction: '这个人很懒，什么都没有写...'
})

const passwordFormRef = ref(null)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, trigger: 'blur', message: '请输入原密码' },
    { validator: validPassword, trigger: 'blur' }
  ],
  newPassword: [
    { required: true, trigger: 'blur', message: '请输入新密码' },
    { validator: validPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: '请再次输入新密码' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleEdit = () => {
  ElMessage.info('编辑个人信息功能开发中')
}

const handleUpdatePassword = () => {
  passwordFormRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success('密码修改成功')
      resetForm()
    }
  })
}

const resetForm = () => {
  passwordFormRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .profile-box {
    .avatar-wrapper {
      text-align: center;
      margin-bottom: 20px;
    }

    .info-list {
      .info-item {
        margin-bottom: 10px;
        line-height: 1.8;

        .label {
          color: #606266;
          margin-right: 10px;
        }

        .value {
          color: #303133;
        }
      }
    }
  }

  :deep(.el-form) {
    max-width: 500px;
  }
}

.profile {
  padding: 16px; // 1rem to 16px
  // ...other styles...
}
</style>
