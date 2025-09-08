<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="paramsForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="paramsForm.name" placeholder="请输入角色名称" clearable />
          </el-form-item>
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="paramsForm.name" placeholder="请输入角色名称" clearable />
          </el-form-item>
        </el-form>
      </template>
      <template #right>
        <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
        <el-button @click="resetSearch"> 重置 </el-button>
      </template>
    </SearchWrapper>

    <!-- 表格区域 -->
    <div class="table-container">
      <div class="table-header">
        <div class="header-title">
          <h3>用户列表</h3>
        </div>
        <div class="header-actions">
          <el-button class="ripple-button" @click="handleAdd"> 新增用户 </el-button>
          <el-button @click="refreshTable">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="table-content">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" :height="tableHeight">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="userName" label="用户名" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="phoneNumber" label="手机号" />
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag :type="+row.isActive ? 'success' : 'danger'">
                {{ +row.isActive ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="creationTime" label="创建时间">
            <template #default="{ row }">
              {{ row.creationTime ? dayjs(row.creationTime).format('YYYY-MM-DD HH:mm:ss') : '--' }}
            </template>
          </el-table-column> -->
          <el-table-column label="操作" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button v-if="+row.code !== 1" type="danger" link @click="handleDelete(row)"
                >删除</el-button
              >
              <!-- 修改密码 -->
              <el-button type="warning" link @click="handleChangePassword(row)">修改密码</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="paramsForm.SkipCount"
          :page-sizes="[20, 30, 40, 50]"
          :page-size="paramsForm.MaxResultCount"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增角色弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑' : '新增'"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="dialogVisible"
      width="50%"
      :before-close="handleClose"
      transition="dialog-scale"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="userName">
              <el-input placeholder="请输入用户名" v-model="form.userName" />
            </el-form-item>
            <el-form-item label="密码" prop="password" v-if="!isEdit">
              <el-input placeholder="请输入密码" v-model="form.password" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
              <el-input
                placeholder="请输入确认密码"
                :disabled="isEdit"
                v-model="form.confirmPassword"
              />
            </el-form-item>
            <el-form-item label="姓名" prop="name" v-if="isEdit">
              <el-input placeholder="请输入姓名" v-model="form.name" />
            </el-form-item>
            <!-- 状态 -->
            <el-form-item label="状态" prop="isActive">
              <el-radio-group v-model="form.isActive">
                <el-radio :value="true">启用</el-radio>
                <el-radio :value="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleIds">
              <el-select v-model="form.roleIds" multiple filterable placeholder="请选择角色">
                <el-option
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="姓名" prop="name" v-if="!isEdit">
              <el-input placeholder="请输入姓名" v-model="form.name" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input placeholder="请输入邮箱" v-model="form.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input placeholder="请输入手机号" v-model="form.phoneNumber" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="handleCancel" ref="cancelBtn">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog
      title="修改密码"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="passwordDialogVisible"
      width="30%"
      :before-close="handlePasswordClose"
      transition="dialog-scale"
      destroy-on-close
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="formRef2" label-width="100px">
        <el-form-item label="用户名" prop="userName">
          <el-input placeholder="请输入用户名" :disabled="true" v-model="passwordForm.userName" />
        </el-form-item>
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input placeholder="请输入旧密码" v-model="passwordForm.oldPassword" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input placeholder="请输入新密码" v-model="passwordForm.newPassword" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmNewPassword">
          <el-input placeholder="请输入确认新密码" v-model="passwordForm.confirmNewPassword" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handlePasswordCancel">取消</el-button>
        <el-button type="primary" @click="handleChangePasswordSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { db } from '@/utils/dbConfig.js'
import { useTableHeight } from '@/utils/useTableHeight'
import {
  getUserList,
  getUserDetail,
  editUser,
  deleteUser,
  addUser,
  updatePassword
} from '@/api/user'
import { getRoleList } from '@/api/role'
import dayjs from 'dayjs'
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const paramsForm = ref({
  SkipCount: 1,
  MaxResultCount: 20
})
const roleList = ref([])
const { tableHeight, calculateTableHeight } = useTableHeight()
const formRef2 = ref(null)
const passwordDialogVisible = ref(false)
const passwordForm = ref({
  id: '',
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
  userName: ''
})
// 是否是编辑状态
const isEdit = ref(false)
// 新增弹窗
const dialogVisible = ref(false)
// 新增表单
const form = ref({
  userName: '',
  email: '',
  phoneNumber: '',
  password: '',
  isActive: true,
  name: '',
  surname: '',
  roleIds: []
})
// 新增表单验证规则
const rules = {
  userName: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },

    // 校验用户名只能是数字、字母或特殊符号
    {
      validator: (rule, value, callback) => {
        if (!/^[a-zA-Z0-9_.*]+$/.test(value)) {
          callback(new Error('用户名只能是数字、字母或特殊符号'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(value)) {
          callback(new Error('请输入正确的邮箱'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!/^1[3456789]\d{9}$/.test(value)) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  isActive: [{ required: true, message: '请选择状态', trigger: 'change' }],
  confirmPassword: [
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }]
}
const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmNewPassword: [
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
// 新增表单ref
const formRef = ref(null)
// 搜索表单ref
const searchFormRef = ref(null)
const handleAdd = () => {
  formRef.value && formRef.value.resetFields()
  isEdit.value = false
  dialogVisible.value = true
}

// 确定新增
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 编辑角色
      if (isEdit.value) {
        const params = {
          ...form.value
        }
        delete params.confirmPassword
        await editUser(params)
        handleCancel()
        getList()
        ElMessage.success('编辑角色成功')
        return
      }
      // 新增角色
      const data = {
        ...form.value
      }
      delete data.confirmPassword
      await addUser(data)
      handleCancel()
      getList()
      ElMessage.success('新增角色成功')
    }
  })
}
// 修噶密码
const handleChangePasswordSubmit = () => {
  formRef2.value.validate(async (valid) => {
    if (valid) {
      const params = {
        ...passwordForm.value
      }
      await updatePassword(params)
      handlePasswordCancel()
      ElMessage.success('修改密码成功')
    }
  })
}
// 编辑
const handleEdit = (row) => {
  form.value = { ...row }
  isEdit.value = true
  dialogVisible.value = true
}
const handleChangePassword = (row) => {
  const { id, userName } = row
  passwordForm.value.id = id
  passwordForm.value.userName = userName
  passwordDialogVisible.value = true
}
const handlePasswordCancel = () => {
  formRef2.value.resetFields()
  passwordDialogVisible.value = false
  passwordForm.value = {
    id: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    userName: ''
  }
}
const handlePasswordClose = (done) => {
  formRef2.value.resetFields()
  passwordDialogVisible.value = false
  passwordForm.value = {
    id: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    userName: ''
  }
  done()
}

// 获取所有角色
const getAllRoleList = async () => {
  let data = await getRoleList({
    SkipCount: 0,
    MaxResultCount: 1000
  })
  roleList.value = data?.items ?? []
}
const getList = async () => {
  loading.value = true
  try {
    await handleSearch()
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await deleteUser(row)
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
// 通过查询条件去查找数据
const handleSearch = async () => {
  try {
    const params = {
      ...paramsForm.value
    }
    params.SkipCount = (paramsForm.value.SkipCount - 1) * paramsForm.value.MaxResultCount
    const data = await getUserList(params)
    console.log(data, '获取角色列表')
    tableData.value = data.items ?? []
    total.value = data.totalCount ?? 0
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    // 数据加载完成后重新计算表格高度
    calculateTableHeight()
  }
}
// 关闭弹窗
const handleClose = (done) => {
  // 对于取消按钮的调用方式，确保正确重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
  isEdit.value = false
  dialogVisible.value = false
  form.value = {
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    isActive: true,
    name: '',
    surname: '',
    roleIds: []
  }
  done()
}
const handleCancel = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  isEdit.value = false
  dialogVisible.value = false
  form.value = {
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    isActive: true,
    name: '',
    surname: '',
    roleIds: []
  }
}

const handleSizeChange = (val) => {
  paramsForm.value.MaxResultCount = val
  paramsForm.value.SkipCount = 1
  getList()
}

const handleCurrentChange = (val) => {
  paramsForm.value.SkipCount = val
  getList()
}

// 刷新表格
const refreshTable = () => {
  getList()
}

// 重置搜索
const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  paramsForm.value = {
    SkipCount: 1,
    MaxResultCount: 20,
    name: '',
    code: ''
  }
  handleSearch()
}

onMounted(() => {
  getList()
  getAllRoleList()
})
</script>

<style lang="scss" scoped></style>
