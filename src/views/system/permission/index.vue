<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="paramsForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="paramsForm.name" placeholder="请输入菜单名称" clearable />
          </el-form-item>
          <el-form-item label="菜单标识" prop="code">
            <el-input v-model="paramsForm.code" placeholder="请输入菜单标识" clearable />
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
          <h3>菜单管理</h3>
        </div>
        <div class="header-actions">
          <el-button class="ripple-button" @click="handleAdd"> 新增菜单 </el-button>
          <el-button @click="refreshTable">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="table-content">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" :height="tableHeight">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="菜单名称" width="150" />
          <el-table-column prop="code" label="菜单标识" width="200" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag :type="+row.isActive ? 'success' : 'danger'">
                {{ +row.isActive ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="250">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="warning" link @click="handleMenuControl(row)">菜单控制</el-button>
              <el-button type="info" link @click="handleButtonControl(row)">按钮控制</el-button>
              <el-button v-if="row.id !== 1" type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
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

    <!-- 新增/编辑菜单弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑菜单' : '新增菜单'"
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
          <el-col :span="24">
            <el-form-item label="菜单名称" prop="name">
              <el-input placeholder="请输入菜单名称" v-model="form.name" />
            </el-form-item>
            <el-form-item label="菜单标识" prop="code">
              <el-input placeholder="请输入菜单标识" v-model="form.code" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input type="textarea" placeholder="请输入描述" v-model="form.description" />
            </el-form-item>
            <!-- 状态 -->
            <el-form-item label="状态" prop="isActive">
              <el-radio-group v-model="form.isActive">
                <el-radio :value="true">启用</el-radio>
                <el-radio :value="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 菜单控制弹窗 -->
    <el-dialog
      title="菜单控制"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="menuDialogVisible"
      width="60%"
      destroy-on-close
    >
      <div class="menu-control-content">
        <div class="menu-control-header">
          <span class="permission-name">{{ currentPermissionName }} 菜单权限配置</span>
          <el-button type="primary" size="small" @click="expandAll">展开全部</el-button>
          <el-button size="small" @click="collapseAll">收起全部</el-button>
        </div>
        <div class="menu-tree-container">
          <el-tree
            v-model="selectedMenuIds"
            ref="menuTree"
            :data="menuList"
            show-checkbox
            node-key="id"
            default-expand-all
            highlight-current
            :props="defaultProps"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="handleMenuCancel">取消</el-button>
        <el-button type="primary" @click="handleMenuSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 按钮控制弹窗 -->
    <el-dialog
      title="按钮控制"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="buttonDialogVisible"
      width="50%"
      destroy-on-close
    >
      <div class="button-control-content">
        <div class="button-control-header">
          <span class="permission-name">{{ currentPermissionName }} 按钮权限配置</span>
        </div>
        <div class="button-list-container">
          <el-checkbox-group v-model="selectedButtonIds">
            <el-checkbox
              v-for="button in buttonList"
              :key="button.id"
              :label="button.id"
              style="display: block; margin: 10px 0;"
            >
              <span>{{ button.name }}</span> 
              <span class="button-code">({{ button.code }})</span>
              <span class="button-desc">{{ button.description }}</span>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleButtonCancel">取消</el-button>
        <el-button type="primary" @click="handleButtonSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useTableHeight } from '@/utils/useTableHeight'

// Mock 数据
const permissions = [
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    isActive: true
  },
  {
    id: 2,
    name: '内容编辑',
    code: 'editor',
    description: '负责内容管理',
    isActive: true
  },
  {
    id: 3,
    name: '普通用户',
    code: 'user',
    description: '普通用户权限',
    isActive: true
  },
  {
    id: 4,
    name: '访客',
    code: 'visitor',
    description: '只读权限',
    isActive: false
  }
]

// 菜单列表数据
const menus = [
  {
    id: 1,
    name: '仪表盘',
    code: 'dashboard',
    parentId: 0,
    path: '/dashboard',
    icon: 'HomeFilled',
    children: []
  },
  {
    id: 2,
    name: '系统管理',
    code: 'system',
    parentId: 0,
    path: '/system',
    icon: 'Setting',
    children: [
      {
        id: 3,
        name: '用户管理',
        code: 'user',
        parentId: 2,
        path: '/system/user',
        icon: 'User',
        children: []
      },
      {
        id: 4,
        name: '角色管理',
        code: 'role',
        parentId: 2,
        path: '/system/role',
        icon: 'UserFilled',
        children: []
      },
      {
        id: 5,
        name: '权限管理',
        code: 'permission',
        parentId: 2,
        path: '/system/permission',
        icon: 'Key',
        children: []
      }
    ]
  },
  {
    id: 6,
    name: '内容管理',
    code: 'content',
    parentId: 0,
    path: '/content',
    icon: 'Document',
    children: []
  }
]

// 按钮列表数据
const buttons = [
  {
    id: 1,
    name: '新增',
    code: 'add',
    description: '新增数据'
  },
  {
    id: 2,
    name: '编辑',
    code: 'edit',
    description: '编辑数据'
  },
  {
    id: 3,
    name: '删除',
    code: 'delete',
    description: '删除数据'
  },
  {
    id: 4,
    name: '查看',
    code: 'view',
    description: '查看详情'
  },
  {
    id: 5,
    name: '导入',
    code: 'import',
    description: '导入数据'
  },
  {
    id: 6,
    name: '导出',
    code: 'export',
    description: '导出数据'
  }
]

// 权限-菜单映射关系
const permissionMenus = {
  1: [1, 2, 3, 4, 5, 6], // 超级管理员拥有所有菜单
  2: [1, 6], // 内容编辑只有仪表盘和内容管理
  3: [1], // 普通用户只有仪表盘
  4: [1]  // 访客只有仪表盘
}

// 权限-按钮映射关系
const permissionButtons = {
  1: [1, 2, 3, 4, 5, 6], // 超级管理员拥有所有按钮
  2: [1, 2, 4, 5, 6],    // 内容编辑没有删除权限
  3: [4],                // 普通用户只有查看权限
  4: [4]                 // 访客只有查看权限
}

// 响应式变量
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const paramsForm = ref({
  SkipCount: 1,
  MaxResultCount: 20,
  name: '',
  code: ''
})
const { tableHeight, calculateTableHeight } = useTableHeight()

// 菜单列表数据
const menuList = ref([])
const buttonList = ref([])

// 对话框控制
const dialogVisible = ref(false)
const menuDialogVisible = ref(false)
const buttonDialogVisible = ref(false)
const isEdit = ref(false)

// 当前操作的权限ID和名称
const currentPermissionId = ref('')
const currentPermissionName = ref('')

// 选中的菜单和按钮ID
const selectedMenuIds = ref([])
const selectedButtonIds = ref([])

// 表单数据
const form = ref({
  id: '',
  name: '',
  code: '',
  description: '',
  isActive: true
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入菜单标识', trigger: 'blur' }
  ],
  isActive: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 菜单树配置
const defaultProps = {
  children: 'children',
  label: 'name'
}

// 表单引用
const formRef = ref(null)
const searchFormRef = ref(null)
const menuTree = ref(null)

// 获取权限列表 - 使用mock数据
const getList = async () => {
  loading.value = true
  try {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    await handleSearch()
  } catch (error) {
    console.error('获取权限列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索功能 - 使用mock数据
const handleSearch = async () => {
  try {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 200))
    
    let filteredList = [...permissions]
    
    // 按名称和编码筛选
    if (paramsForm.value.name) {
      filteredList = filteredList.filter(item => item.name.includes(paramsForm.value.name))
    }
    if (paramsForm.value.code) {
      filteredList = filteredList.filter(item => item.code.includes(paramsForm.value.code))
    }
    
    // 分页处理
    const page = paramsForm.value.SkipCount
    const limit = paramsForm.value.MaxResultCount
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedList = filteredList.slice(start, end)
    
    tableData.value = paginatedList
    total.value = filteredList.length
  } catch (error) {
    console.error('获取权限列表失败:', error)
  } finally {
    calculateTableHeight()
    loading.value = false
  }
}

// 新增菜单
const handleAdd = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  isEdit.value = false
  form.value = {
    id: '',
    name: '',
    code: '',
    description: '',
    isActive: true
  }
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = async (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 提交表单 - 使用mock数据
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        if (isEdit.value) {
          // 编辑菜单
          const index = permissions.findIndex(item => item.id === form.value.id)
          if (index !== -1) {
            permissions[index] = { ...permissions[index], ...form.value }
          }
          ElMessage.success('编辑菜单成功')
        } else {
          // 新增菜单
          const newPermission = {
            id: permissions.length + 1,
            ...form.value,
            isActive: form.value.isActive !== false
          }
          permissions.push(newPermission)
          
          // 初始化权限的菜单和按钮映射
          permissionMenus[newPermission.id] = []
          permissionButtons[newPermission.id] = []
          
          ElMessage.success('新增菜单成功')
        }
        
        handleCancel()
        getList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败，请重试')
      }
    }
  })
}

// 删除菜单 - 使用mock数据
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该菜单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 不能删除超级管理员
        if (row.id === 1) {
          ElMessage.warning('超级管理员菜单不能删除')
          return
        }
        
        const index = permissions.findIndex(item => item.id === row.id)
        if (index !== -1) {
          permissions.splice(index, 1)
          
          // 删除对应的菜单和按钮映射
          delete permissionMenus[row.id]
          delete permissionButtons[row.id]
          
          getList()
          ElMessage.success('删除成功')
        } else {
          ElMessage.error('菜单不存在')
        }
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败，请重试')
      }
    })
    .catch(() => {})
}

// 菜单控制 - 使用mock数据
const handleMenuControl = async (row) => {
  currentPermissionId.value = row.id
  currentPermissionName.value = row.name
  try {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 设置菜单列表数据
    menuList.value = [...menus]
    
    // 获取已分配的菜单
    selectedMenuIds.value = permissionMenus[row.id] || []
    
    menuDialogVisible.value = true
  } catch (error) {
    console.error('获取菜单数据失败:', error)
    ElMessage.error('获取菜单数据失败，请重试')
  }
}

// 按钮控制 - 使用mock数据
const handleButtonControl = async (row) => {
  currentPermissionId.value = row.id
  currentPermissionName.value = row.name
  try {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 设置按钮列表数据
    buttonList.value = [...buttons]
    
    // 获取已分配的按钮
    selectedButtonIds.value = permissionButtons[row.id] || []
    
    buttonDialogVisible.value = true
  } catch (error) {
    console.error('获取按钮数据失败:', error)
    ElMessage.error('获取按钮数据失败，请重试')
  }
}

// 提交菜单权限 - 使用mock数据
const handleMenuSubmit = async () => {
  try {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 保存菜单权限配置
    permissionMenus[currentPermissionId.value] = [...selectedMenuIds.value]
    
    ElMessage.success('菜单权限配置成功')
    handleMenuCancel()
  } catch (error) {
    console.error('菜单权限配置失败:', error)
    ElMessage.error('菜单权限配置失败，请重试')
  }
}

// 提交按钮权限 - 使用mock数据
const handleButtonSubmit = async () => {
  try {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 保存按钮权限配置
    permissionButtons[currentPermissionId.value] = [...selectedButtonIds.value]
    
    ElMessage.success('按钮权限配置成功')
    handleButtonCancel()
  } catch (error) {
    console.error('按钮权限配置失败:', error)
    ElMessage.error('按钮权限配置失败，请重试')
  }
}

// 展开全部菜单
const expandAll = () => {
  if (menuTree.value) {
    menuTree.value.store.nodesMap.forEach(node => {
      menuTree.value.expandNode(node)
    })
  }
}

// 收起全部菜单
const collapseAll = () => {
  if (menuTree.value) {
    menuTree.value.store.nodesMap.forEach(node => {
      menuTree.value.collapseNode(node)
    })
  }
}

// 关闭弹窗
const handleClose = (done) => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  isEdit.value = false
  dialogVisible.value = false
  form.value = {
    id: '',
    name: '',
    code: '',
    description: '',
    isActive: true
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
    id: '',
    name: '',
    code: '',
    description: '',
    isActive: true
  }
}

const handleMenuCancel = () => {
  menuDialogVisible.value = false
  selectedMenuIds.value = []
}

const handleButtonCancel = () => {
  buttonDialogVisible.value = false
  selectedButtonIds.value = []
}

// 分页处理
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

// 组件挂载时初始化数据
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 16px;
}

.table-container {
  margin-top: 16px;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.table-content {
  flex: 1;
  overflow: hidden;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.menu-control-content,
.button-control-content {
  max-height: 400px;
  overflow-y: auto;
}

.menu-control-header,
.button-control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.permission-name {
  font-weight: 500;
  color: #303133;
}

.menu-tree-container {
  max-height: 320px;
  overflow-y: auto;
}

.button-list-container {
  max-height: 320px;
  overflow-y: auto;
}

.button-code {
  color: #606266;
  margin: 0 8px;
}

.button-desc {
  color: #909399;
  font-size: 12px;
}
</style>
