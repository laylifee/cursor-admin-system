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
          <h3>角色列表</h3>
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
          <el-table-column prop="creationTime" label="创建时间">
            <template #default="{ row }">
              {{ row.creationTime ? dayjs(row.creationTime).format('YYYY-MM-DD HH:mm:ss') : '--' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button v-if="+row.code !== 1" type="danger" link @click="handleDelete(row)"
                >删除</el-button
              >
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
            <!-- 状态 -->
            <el-form-item label="状态" prop="isActive">
              <el-radio-group v-model="form.isActive">
                <el-radio :value="true">启用</el-radio>
                <el-radio :value="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input placeholder="请输入姓名" v-model="form.name" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input placeholder="请输入邮箱" :disabled="isEdit" v-model="form.email" />
            </el-form-item>
            <el-form-item label="手机号" prop="phoneNumber">
              <el-input placeholder="请输入手机号" v-model="form.phoneNumber" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
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
import { getUserList, getUserDetail, editUser, deleteUser, addUser } from '@/api/user'
import dayjs from 'dayjs'
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const paramsForm = ref({
  SkipCount: 1,
  MaxResultCount: 20
})
const { tableHeight, calculateTableHeight } = useTableHeight()

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
  roleIds: ['27f1b093-5a61-49c9-9c98-ad603d3ed193']
})
// 新增表单验证规则
const rules = {
  userName: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
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
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
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
        dialogVisible.value = false
        isEdit.value = false
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
      dialogVisible.value = false
      isEdit.value = false
      getList()
      ElMessage.success('新增角色成功')
    }
  })
}
// 编辑
const handleEdit = (row) => {
  form.value = { ...row }
  isEdit.value = true
  dialogVisible.value = true
}

const handlePermission = (row) => {
  ElMessage.info('权限配置功能开发中')
}
const getList = async () => {
  loading.value = true
  try {
    handleSearch()
    // 数据加载完成后重新计算表格高度
    calculateTableHeight()
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
      // 如果登录超级管理员，不允许删除
      if (row.code === '1') {
        ElMessage.warning('超级管理员不允许删除')
        return
      }
      // 软删除
      await db.role.update(row.id, {
        _deleted: 1
      })
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
    loading.value = true
    const data = await getUserList(params)
    console.log(data, '获取角色列表')
    tableData.value = data.items ?? []
    total.value = data.totalCount ?? 0
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }

  // 搜索完成后重新计算表格高度
  calculateTableHeight()
}
// 关闭弹窗
const handleClose = (done) => {
  formRef.value.resetFields()
  isEdit.value = false
  dialogVisible.value = false
  done()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
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
  searchForm.value = {
    name: '',
    code: ''
  }
  currentPage.value = 1
  handleSearch()

  // 重置搜索后重新计算表格高度
  calculateTableHeight()
}

// 随机生成20条数据
const generateRandomData = async () => {
  ElMessageBox.confirm('确定要生成20条随机角色数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      loading.value = true
      try {
        // 角色名称和描述的随机词库
        const roleNames = [
          '管理员',
          '编辑',
          '作者',
          '审核员',
          '访客',
          '用户',
          '开发者',
          '测试员',
          '产品经理',
          '设计师',
          '运营',
          '市场',
          '销售',
          '客服',
          '财务',
          '人事',
          '主管',
          '总监',
          '经理',
          '助理'
        ]

        const descriptions = [
          '系统管理员，拥有所有权限',
          '内容编辑，负责内容创作',
          '文章作者，可以发布文章',
          '内容审核，负责审核内容',
          '只读权限，无法修改内容',
          '普通用户，基础权限',
          '系统开发人员，技术权限',
          '质量测试，测试权限',
          '产品规划，产品相关权限',
          'UI/UX设计，设计相关权限',
          '运营人员，运营相关权限',
          '市场推广，市场相关权限',
          '销售人员，销售相关权限',
          '客户服务，客服相关权限',
          '财务管理，财务相关权限',
          '人事管理，人事相关权限',
          '部门主管，管理权限',
          '部门总监，高级管理权限',
          '项目经理，项目管理权限',
          '行政助理，行政相关权限'
        ]

        // 生成20条随机数据
        for (let i = 0; i < 20; i++) {
          const randomIndex = Math.floor(Math.random() * roleNames.length)
          const name = `${roleNames[randomIndex]}${i + 1}`
          const code = `role_${Date.now()}_${i}`
          const status = Math.random() > 0.3 ? '1' : '0' // 70%概率为启用状态

          await db.role.add({
            name,
            code,
            description: descriptions[randomIndex],
            status,
            _deleted: 0
          })
        }

        ElMessage.success('成功生成20条随机角色数据')
        getList()
      } catch (error) {
        console.error('生成随机数据失败:', error)
        ElMessage.error('生成随机数据失败')
      } finally {
        loading.value = false
      }
    })
    .catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped></style>
