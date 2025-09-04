<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="searchForm.name" placeholder="请输入菜单名称" clearable />
          </el-form-item>
          <el-form-item label="路由地址" prop="path">
            <el-input v-model="searchForm.path" placeholder="请输入路由地址" clearable />
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
          <h3>菜单列表</h3>
        </div>
        <div class="header-actions">
          <el-button class="ripple-button" @click="handleAdd"> 新增菜单 </el-button>
          <el-button @click="refreshTable">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="table-content">
        <el-table
          :data="tableData"
          style="width: 100%"
          v-loading="loading"
          row-key="id"
          :height="tableHeight"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column prop="name" label="菜单名称" min-width="200">
            <template #default="{ row }">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <!-- 菜单类型 -->
          <el-table-column prop="menuType" label="菜单类型" min-width="100">
            <template #default="{ row }">
              <el-tag
                :type="
                  row.menuType === '1' && row.parentId
                    ? 'primary'
                    : row.menuType === '2'
                      ? 'success'
                      : 'info'
                "
                >{{
                  row.menuType === '1' && row.parentId
                    ? '菜单'
                    : row.menuType === '2'
                      ? '按钮'
                      : '目录'
                }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="menuPath" label="路由地址" min-width="200" />
          <el-table-column prop="permissionKey" label="权限标识" min-width="100" />
          <el-table-column prop="externalLink" label="外部链接" min-width="200" />
          <el-table-column prop="sort" label="排序" min-width="100" />
          <!-- 是否禁用 -->
          <el-table-column prop="isEnabled" label="是否禁用" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.isEnabled ? 'danger' : 'success'">{{
                row.isEnabled ? '是' : '否'
              }}</el-tag>
            </template>
          </el-table-column>
          <!-- 是否隐藏 -->
          <el-table-column prop="hidden" label="是否隐藏" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.hidden ? 'danger' : 'success'">{{
                row.hidden ? '是' : '否'
              }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" fixed="right" min-width="150">
            <template #default="{ row }">
              <el-button
                v-if="row.menuType !== '2'"
                class="plain-icon-button"
                type="primary"
                :icon="Plus"
                @click="handleAddChildren(row)"
              />
              <el-button
                class="plain-icon-button"
                type="primary"
                :icon="Edit"
                @click="handleEdit(row)"
              />
              <el-button
                class="plain-icon-button"
                type="danger"
                :icon="Delete"
                @click="handleDelete(row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <!-- <div class="pagination-container">
        <el-pagination
          v-model:current-page="searchForm.SkipCount"
          :page-sizes="[20, 30, 40, 50]"
          :page-size="searchForm.MaxResultCount"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div> -->
    </div>

    <!-- 新增/编辑菜单弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑' : '新增'"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="dialogVisible"
      width="60%"
      modal-class="menu-add-dialog"
      :before-close="handleClose"
      transition="dialog-scale"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" inline label-width="100px">
        <div>
          <el-form-item label="菜单类型">
            <el-radio-group
              v-model="form.menuType"
              size="large"
              :disabled="(!isEdit && !form.parentId) || isEdit"
            >
              <el-radio-button label="菜单" value="1" />
              <el-radio-button label="权限" value="2" />
            </el-radio-group>
          </el-form-item>
        </div>
        <template v-if="form.menuType === '1'">
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入菜单名称" />
          </el-form-item>
          <el-form-item label="权限标识" prop="permissionKey">
            <el-input v-model="form.permissionKey" placeholder="请输入权限标识" />
          </el-form-item>
          <el-form-item label="路由地址" prop="menuPath">
            <el-input v-model="form.menuPath" placeholder="请输入路由地址" />
          </el-form-item>
          <el-form-item label="组件路径">
            <el-input v-model="form.componentPath" placeholder="请输入组件路径" />
          </el-form-item>
          <el-form-item label="图标">
            <IconSelector v-model="form.menuIcon" style="width: 100%" />
          </el-form-item>
          <el-form-item label="菜单排序" prop="sort">
            <el-input-number v-model="form.sort" :min="1" :max="999999" style="width: 100%" />
          </el-form-item>
          <el-form-item label="外部链接" prop="internal" v-if="form.internal">
            <el-input
              v-model="form.externalLink"
              placeholder="外部链接/内嵌地址(https://www.baidu.com)"
            />
          </el-form-item>
          <div class="switch-container">
            <el-form-item label="是否启用">
              <el-switch v-model="form.isEnabled" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
            <el-form-item label="页面缓存">
              <el-switch v-model="form.keepAlive" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
            <el-form-item label="菜单隐藏">
              <el-switch v-model="form.hidden" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
            <el-form-item label="是否内嵌">
              <el-switch v-model="form.internal" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
            <el-form-item label="固定标签">
              <el-switch v-model="form.affix" active-color="#13ce66" inactive-color="#ff4949" />
            </el-form-item>
          </div>
        </template>
        <template v-else>
          <el-form-item label="权限名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入权限名称" />
          </el-form-item>
          <el-form-item label="权限标识" prop="permissionKey">
            <el-input v-model="form.permissionKey" placeholder="请输入权限标识" />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="form.sort" :min="1" :max="999999" style="width: 100%" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElTabs, ElTabPane, ElSwitch, ElInputNumber } from 'element-plus'
import { Refresh, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { useTableHeight } from '@/utils/useTableHeight'
import SearchWrapper from '@/components/SearchWrapper.vue'
import IconSelector from '@/components/IconSelector.vue'
import {
  getPermissionList,
  getPermissionDetail,
  addPermission,
  editPermission,
  deletePermission
} from '@/api/permission'

const { tableHeight, calculateTableHeight } = useTableHeight()
// 表格相关数据
const loading = ref(false)
const tableData = ref([])
const allMenus = ref([])
const total = ref(0)

// 搜索表单
const searchForm = ref({
  name: '',
  path: '',
  SkipCount: 1,
  MaxResultCount: 999
})
const searchFormRef = ref(null)

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  menuType: '1',
  id: '',
  name: '',
  menuIcon: '',
  permissionKey: '', // 权限标识
  menuPath: '',
  componentPath: '', // 组件路径
  externalLink: '', // 外部链接
  sort: 0,
  parentId: null,
  isEnabled: false, // 是否启用
  keepAlive: true, // 页面缓存
  hidden: false, // 菜单隐藏
  internal: false, // 是否内嵌
  affix: false // 固定标签
})
const formRef = ref(null)
const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuPath: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  permissionKey: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
}

// 菜单控制相关
// 菜单类型
const menuType = ref('menu')
const menuControlVisible = ref(false)
const menuTree = ref(null)
const defaultProps = {
  children: 'children',
  label: 'name'
}
const selectedMenuIds = ref([])
const currentMenu = ref(null)

// 按钮控制相关
const buttonControlVisible = ref(false)
const buttonList = ref([
  { id: 1, name: '新增', code: 'add' },
  { id: 2, name: '编辑', code: 'edit' },
  { id: 3, name: '删除', code: 'delete' },
  { id: 4, name: '查看', code: 'view' },
  { id: 5, name: '导出', code: 'export' },
  { id: 6, name: '导入', code: 'import' }
])
const selectedButtonIds = ref([])

// 获取菜单列表
const getList = async () => {
  loading.value = true
  try {
    const params = {
      SkipCount: (searchForm.value.SkipCount - 1) * searchForm.value.MaxResultCount,
      MaxResultCount: searchForm.value.MaxResultCount
    }
    const res = await getPermissionList(params)
    if (res?.items && res?.items.length > 0) {
      tableData.value = buildTree(res?.items)
    } else {
      tableData.value = []
    }
    total.value = res?.totalCount ?? 0
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
  } finally {
    calculateTableHeight()
    loading.value = false
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

// 分页处理
const handleSizeChange = (val) => {
  searchForm.value.MaxResultCount = val
  getList()
}

const handleCurrentChange = (val) => {
  searchForm.value.SkipCount = val
  getList()
}

// 搜索和重置
const handleSearch = () => {
  searchForm.value.SkipCount = 1
  getList()
}

const resetSearch = () => {
  searchFormRef.value.resetFields()
  searchForm.value.SkipCount = 1
  getList()
}

// 刷新表格
const refreshTable = () => {
  getList()
}

// 新增菜单
const handleAdd = (row = null) => {
  isEdit.value = false
  formRef.value && formRef.value.resetFields()
  form.value = {
    menuType: '1',
    id: '',
    name: '',
    menuIcon: '',
    permissionKey: '', // 权限标识
    menuPath: '',
    componentPath: '', // 组件路径
    externalLink: '', // 外部链接
    sort: 0,
    parentId: null,
    isEnabled: false, // 是否启用
    keepAlive: true, // 页面缓存
    hidden: false, // 菜单隐藏
    internal: false, // 是否内嵌
    affix: false // 固定标签
  }
  dialogVisible.value = true
}

// 新增子菜单或者按钮权限
const handleAddChildren = (row) => {
  isEdit.value = false
  formRef.value && formRef.value.resetFields()
  form.value = {
    menuType: '1',
    id: '',
    name: '',
    menuIcon: '',
    permissionKey: '', // 权限标识
    menuPath: '',
    componentPath: '', // 组件路径
    externalLink: '', // 外部链接
    sort: 0,
    parentId: row.id,
    isEnabled: false, // 是否启用
    keepAlive: true, // 页面缓存
    hidden: false, // 菜单隐藏
    internal: false, // 是否内嵌
    affix: false // 固定标签
  }
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row) => {
  isEdit.value = true
  form.value = {
    ...row
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const params = {
          ...form.value
        }
        console.log('提交参数', params)
        if (isEdit.value) {
          delete params.children
          await editPermission(params)
          ElMessage.success('编辑菜单成功')
        } else {
          delete params.id
          await addPermission(params)
          ElMessage.success('新增菜单成功')
        }

        getList()
        handleCancel()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 删除菜单
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该菜单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await deletePermission(row.id)

      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

// 弹窗关闭处理
const handleClose = (done) => {
  dialogVisible.value = false
  done()
}

const handleCancel = () => {
  formRef.value.resetFields()
  dialogVisible.value = false
  isEdit.value = false
}

const handleMenuControlClose = () => {
  menuControlVisible.value = false
}

const handleMenuControlCancel = () => {
  menuControlVisible.value = false
}

const handleButtonControlClose = () => {
  buttonControlVisible.value = false
}

const handleButtonControlCancel = () => {
  buttonControlVisible.value = false
}

// 初始化
onMounted(async () => {
  getList()
})
</script>

<style lang="scss" scoped>
::v-deep(.menu-add-dialog) {
  font-size: 16px;
  .el-dialog__body {
    .switch-container {
      .el-form-item {
        width: unset;
        margin-right: 0;
      }
    }
    .el-form-item {
      width: 50%;
      margin-right: 0;
    }
  }
}
</style>
