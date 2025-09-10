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
        <el-button :disabled="loading" type="primary" @click="getList">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button :disabled="loading" @click="resetSearch">
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
              <el-button
                class="plain-icon-button"
                type="primary"
                icon="Edit"
                @click="handleEdit(row)"
              />
              <el-button
                class="plain-icon-button"
                type="success"
                icon="Lock"
                @click="handlePermission(row)"
              />
              <el-button
                class="plain-icon-button"
                type="danger"
                icon="Delete"
                @click="handleDelete(row)"
              />
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
        <el-button :disabled="isSubmit" @click="handlerRoleCancel">取消</el-button>
        <el-button :disabled="isSubmit" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置弹窗 -->
    <el-dialog
      title="角色权限配置"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="permissionVisible"
      width="40%"
      destroy-on-close
      :before-close="handleRolePermissionClose"
    >
      <div v-if="currentRole">
        <div class="permission-content">
          <el-tree
            :data="menuTreeData"
            show-checkbox
            node-key="id"
            :props="{
              children: 'children',
              label: 'name'
            }"
            ref="menuTree"
            @check-change="handleCheckChange"
          />
        </div>
      </div>

      <template #footer>
        <el-button :disabled="isSubmit" @click="handleRolePermissionCancel">取消</el-button>
        <el-button :disabled="isSubmit" type="primary" @click="savePermission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getRoleList, addRole, deleteRole, updateRole, getRoleDetail } from '@/api/role'
import { getPermissionList, getRolePermissions, assignRolePermissions } from '@/api/permission'
import { useTableHeight } from '@/utils/useTableHeight'
const loading = ref(false)
const tableData = ref()
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(20)

const { tableHeight, calculateTableHeight } = useTableHeight()
// 是否提交的
const isSubmit = ref(false)
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
// 菜单树ref
const menuTree = ref(null)
// 当前激活的标签页
const activeTab = ref('menu')
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
      isSubmit.value = true
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
      isSubmit.value = false
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
// 当前选中的角色
const currentRole = ref(null)
// 权限配置弹窗
const permissionVisible = ref(false)
// 菜单权限数据
const menuTreeData = ref([])
// 按钮权限数据
const buttonData = ref([])
// 选中的菜单权限
const selectedMenuIds = ref([])
// 选中的按钮权限
const selectedButtonIds = ref([])

// 权限配置
const handlePermission = (row) => {
  currentRole.value = row
  permissionVisible.value = true
  loadPermissions()
  loadRolePermissions()
}

// 加载权限数据
const loadPermissions = async () => {
  try {
    // 加载菜单列表
    const menuRes = await getPermissionList({
      SkipCount: 0,
      MaxResultCount: 999
    })
    if (menuRes?.items && menuRes?.items.length > 0) {
      menuTreeData.value = buildTree(menuRes?.items)
    } else {
      menuTreeData.value = []
    }
  } catch (error) {
    console.error('加载权限数据失败:', error)
    ElMessage.error('加载权限数据失败')
  }
}
// 加载角色已有的权限
const loadRolePermissions = async () => {
  try {
    const res = await getRolePermissions(currentRole.value.id)
    // 确保只设置实际需要的权限ID
    if (res?.permissions && res.permissions.length > 0) {
      // 过滤掉不需要的权限（如果有必要）
      const filteredPermissions = res.permissions.filter((permission) => {
        // 这里可以根据实际业务需求添加过滤条件
        return true // 默认不过滤所有返回的权限
      })

      selectedMenuIds.value = filteredPermissions.map((item) => item.id)
      selectedMenuIds.value.map((item) => {
        menuTree.value.setChecked(item, true)
      })

      console.log('默认选中的权限ID:', selectedMenuIds.value)
      console.log('角色已有的权限', res)
    } else {
      selectedMenuIds.value = []
    }
  } catch (error) {
    console.error('加载角色已有的权限失败:', error)
    ElMessage.error('加载角色已有的权限失败')
  }
}
// 构建树形结构
const buildTree = (data, parentId = null) => {
  return data
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(data, item.id)
    }))
}

// 处理节点选中状态变化
const handleCheckChange = (data, checked, indeterminate) => {
  // 获取所有全选中的节点（包括子节点）
  const checkedKeys = menuTree.value.getCheckedKeys()
  // 获取所有半选中的节点（父节点）
  const halfCheckedKeys = menuTree.value.getHalfCheckedKeys()
  // console.log('选中的菜单权限ID列表:', menuTree.value.getCheckedKeys())
  // console.log('半选中的菜单权限ID列表:', menuTree.value.getHalfCheckedKeys())
  // 合并全选中和半选中的节点ID
  const allSelectedIds = [...checkedKeys, ...halfCheckedKeys]

  // 去重，确保每个ID只出现一次
  selectedMenuIds.value = [...new Set(allSelectedIds)]

  console.log('选中的菜单权限总数:', selectedMenuIds.value.length)
  console.log('选中的菜单权限ID列表:', selectedMenuIds.value)
}
const handleRolePermissionClose = (done) => {
  selectedMenuIds.value = []
  permissionVisible.value = false
  done()
}
const handleRolePermissionCancel = () => {
  selectedMenuIds.value = []
  permissionVisible.value = false
}
// 保存权限配置
const savePermission = async () => {
  try {
    if (selectedMenuIds.value.length === 0) {
      ElMessage.error('请选择菜单权限')
      return
    }
    isSubmit.value = true
    // 分配菜单权限
    await assignRolePermissions({
      roleId: currentRole.value.id,
      permissionIds: selectedMenuIds.value
    })
    permissionVisible.value = false
    ElMessage.success('权限配置保存成功')
  } catch (error) {
    console.error('保存权限配置失败:', error)
    ElMessage.error('保存权限配置失败')
  } finally {
    isSubmit.value = false
  }
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
  getList()
}

// 重置搜索
const resetSearch = () => {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields()
  }
  searchForm.value = {
    name: '',
    code: '',
    SkipCount: 1,
    MaxResultCount: 20
  }
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.permission-dialog-header {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  font-weight: 500;
}

.permission-tabs {
  margin-top: 12px;
}

.permission-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px 0;
}

.button-item {
  margin-bottom: 8px;
}

.empty-tips {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.el-tree {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 8px;
}
</style>
