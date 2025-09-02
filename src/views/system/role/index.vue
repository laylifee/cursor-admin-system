<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
          </el-form-item>
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
          </el-form-item>
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
          </el-form-item>
        </el-form>
      </template>
      <template #right>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetSearch">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </template>
    </SearchWrapper>

    <!-- 表格区域 -->
    <div class="table-container">
      <div class="table-header">
        <div class="header-title">
          <h3>角色列表</h3>
        </div>
        <div class="header-actions">
          <el-button class="ripple-button" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
          <el-button @click="refreshTable">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="table-content">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" :height="tableHeight">
          <el-table-column prop="name" label="角色名称" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" link @click="handlePermission(row)">权限</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchForm.SkipCount"
          :page-sizes="[20, 30, 40, 50]"
          :page-size="searchForm.MaxResultCount"
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
      width="30%"
      :before-close="handleClose"
      transition="dialog-scale"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" rows="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handlerRoleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getRoleList, addRole, deleteRole, updateRole, getRoleDetail } from '@/api/role'
import { useTableHeight } from '@/utils/useTableHeight'
const loading = ref(false)
const tableData = ref()
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(20)

const { tableHeight, calculateTableHeight } = useTableHeight()

// 是否是编辑状态
const isEdit = ref(false)
// 新增弹窗
const dialogVisible = ref(false)
// 新增表单
const form = ref({
  name: '',
  description: ''
})
// 新增表单验证规则
const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
  // description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
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
// 条件查询表单
const searchForm = ref({
  SkipCount: 1,
  MaxResultCount: 20
})
// 确定新增
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 编辑角色
      if (isEdit.value) {
        const data = {
          ...form.value
        }
        await updateRole(data)
        getList()
        handlerRoleCancel()
        ElMessage.success('编辑角色成功')
        return
      }
      // 新增角色
      const data = {
        ...form.value,
        permissionIds: [],
        permissionNames: []
      }
      await addRole(data)
      handlerRoleCancel()
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
// 提前关闭
const handleClose = (done) => {
  formRef.value.resetFields()
  isEdit.value = false
  dialogVisible.value = false
  form.value = {
    name: '',
    description: ''
  }
  done()
}
const handlerRoleCancel = () => {
  formRef.value.resetFields()
  isEdit.value = false
  dialogVisible.value = false
  form.value = {
    name: '',
    description: ''
  }
}
const handlePermission = (row) => {
  ElMessage.info('权限配置功能开发中')
}
const getList = async () => {
  loading.value = true
  try {
    handleSearch()
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
      await deleteRole({
        id: row.id
      })
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
// 通过查询条件去查找数据
const handleSearch = async () => {
  const params = {
    ...searchForm.value,
    SkipCount: (searchForm.value.SkipCount - 1) * searchForm.value.MaxResultCount
  }
  let data = await getRoleList(params)
  tableData.value = data?.items ?? []
  total.value = data?.totalCount ?? 0

  // 搜索完成后重新计算表格高度
  calculateTableHeight()
}

const handleSizeChange = (val) => {
  searchForm.value.MaxResultCount = val
  searchForm.value.SkipCount = 1
  getList()
}

const handleCurrentChange = (val) => {
  searchForm.value.SkipCount = val
  getList()
}

// 刷新表格
const refreshTable = () => {
  loading.value = true
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
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped></style>
