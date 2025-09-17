<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="点位名称" prop="TagName">
            <el-input v-model="searchForm.TagName" placeholder="请输入点位名称" clearable />
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
          <h3>IO配置列表</h3>
        </div>
        <div class="header-actions">
          <el-button class="ripple-button" @click="handleAdd"> 新增 </el-button>
          <el-button @click="refreshTable">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="table-content">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" :height="tableHeight">
          <el-table-column prop="tagName" label="点位名称" />
          <el-table-column prop="address" label="点位地址" />
          <el-table-column prop="byteLength" label="字节长度" />
          <el-table-column prop="scale" label="缩放系数" />
          <el-table-column prop="offset" label="偏移量" />
          <el-table-column prop="dataType" label="数据类型">
            <template #default="{ row }">
              {{ row.dataType }}
            </template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.enabled ? 'success' : 'danger'">{{
                row.enabled ? '启用' : '停用'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="useScaling" min-width="120" label="是否使用缩放">
            <template #default="{ row }">
              <el-tag :type="row.useScaling ? 'success' : 'danger'">{{
                row.useScaling ? '启用' : '停用'
              }}</el-tag>
            </template>
          </el-table-column>
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

    <!-- 新增弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑' : '新增'"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="dialogVisible"
      width="50%"
      modal-class="device-config-dialog"
      :before-close="handleClose"
      transition="dialog-scale"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" inline label-width="120px">
        <el-form-item label="点位名称" prop="tagName">
          <el-input v-model="form.tagName" />
        </el-form-item>
        <el-form-item label="点位地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="字节长度" prop="byteLength">
          <el-input v-model="form.byteLength" />
        </el-form-item>
        <el-form-item label="设备ID" prop="deviceConfigId">
          <el-select v-model="form.deviceConfigId" placeholder="请选择设备ID" clearable>
            <el-option
              v-for="item in deviceConfigList"
              :key="item.id"
              :label="item.deviceName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <el-select v-model="form.dataType" placeholder="请选择数据类型" clearable>
            <el-option label="float" value="float" />
            <el-option label="int" value="int" />
            <el-option label="bool" value="bool" />
            <el-option label="string" value="string" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="form.defaultValue" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-switch v-model="form.enabled" :active-value="true" :inactive-value="false" />
        </el-form-item>
        <el-form-item label="缩放系数" prop="scale">
          <el-input v-model="form.scale" />
        </el-form-item>
        <el-form-item label="偏移量" prop="offset">
          <el-input v-model="form.offset" />
        </el-form-item>
        <el-form-item label="是否使用缩放" prop="useScaling">
          <el-switch v-model="form.useScaling" :active-value="true" :inactive-value="false" />
        </el-form-item>
        <div>
          <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="6" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button :disabled="isSubmit" @click="handleCancel">取消</el-button>
        <el-button :disabled="isSubmit" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { addIOConfig, updateIOConfig, deleteIOConfig, getIOConfigList } from '@/api/IOConfig'
import { getDeviceConfigList } from '@/api/deviceConfig'

import { useTableHeight } from '@/utils/useTableHeight'
const loading = ref(false)
const tableData = ref()

const total = ref(20)

const { tableHeight, calculateTableHeight } = useTableHeight()
// 是否提交的
const isSubmit = ref(false)
// 是否是编辑状态
const isEdit = ref(false)
// 新增弹窗
const dialogVisible = ref(false)
// 设备列表
const deviceConfigList = ref([])
// 新增表单
const form = ref({
  tagName: '',
  address: '',
  byteLength: '',
  dataType: '',
  defaultValue: '',
  description: '',
  enabled: true,
  scale: 1,
  offset: 0,
  useScaling: false,
  deviceConfigId: '',
  deviceConfig: {}
})
// 新增表单验证规则
const rules = {
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  //   byteLength: [{ required: true, message: '请输入字节长度', trigger: 'blur' }],
  dataType: [{ required: true, message: '请选择数据类型', trigger: 'change' }],
  defaultValue: [{ required: true, message: '请输入默认值', trigger: 'blur' }],
  deviceConfigId: [{ required: true, message: '请选择设备ID', trigger: 'change' }]
}
// 新增表单ref
const formRef = ref(null)
// 搜索表单ref
const searchFormRef = ref(null)

// 条件查询表单
const searchForm = ref({
  SkipCount: 1,
  MaxResultCount: 20,
  TagName: ''
})

// 打开新增弹窗
const handleAdd = () => {
  form.value = {
    tagName: '',
    address: '',
    byteLength: '',
    dataType: '',
    defaultValue: '',
    description: '',
    enabled: true,
    scale: 1,
    offset: 0,
    useScaling: false,
    deviceConfigId: ''
    // deviceConfig: {}
  }
  dialogVisible.value = true
}
// 确定新增
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      isSubmit.value = true
      // 编辑IO配置
      if (isEdit.value) {
        const data = {
          ...form.value
        }
        data.byteLength = Number(data.byteLength)
        data.scale = Number(data.scale)
        data.offset = Number(data.offset)
        await updateIOConfig(data)
        getList()
        handleCancel()
        ElMessage.success('编辑成功')
        return
      }
      // 新增IO配置
      const data = {
        ...form.value
      }
      data.byteLength = Number(data.byteLength)
      data.scale = Number(data.scale)
      data.offset = Number(data.offset)
      await addIOConfig(data)
      isSubmit.value = false
      handleCancel()
      getList()
      ElMessage.success('新增成功')
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
  isSubmit.value = false
  form.value = {
    tagName: '',
    address: '',
    byteLength: '',
    dataType: '',
    defaultValue: '',
    description: '',
    enabled: true,
    scale: 1,
    offset: 0,
    useScaling: false,
    deviceConfigId: '',
    deviceConfig: {}
  }
  done()
}
const handleCancel = () => {
  formRef.value.resetFields()
  isEdit.value = false
  isSubmit.value = false
  dialogVisible.value = false
  form.value = {
    tagName: '',
    address: '',
    byteLength: '',
    dataType: '',
    defaultValue: '',
    description: '',
    enabled: true,
    scale: 1,
    offset: 0,
    useScaling: false,
    deviceConfigId: '',
    deviceConfig: {}
  }
}
// 获取设备列表
const getDeviceConfigListFun = async () => {
  let data = await getDeviceConfigList({
    SkipCount: 0,
    MaxResultCount: 999
  })
  deviceConfigList.value = data?.items ?? []
}

const getList = async () => {
  loading.value = true
  try {
    await handleSearch()
  } catch (error) {
    console.error('获取IO配置列表失败:', error)
  } finally {
    loading.value = false
  }
}
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该IO配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await deleteIOConfig({
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
  let data = await getIOConfigList(params)
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
    TagName: '',
    SkipCount: 1,
    MaxResultCount: 20
  }
  getList()
}

onMounted(() => {
  getList()
  getDeviceConfigListFun()
})
</script>

<style lang="scss" scoped>
::v-deep(.device-config-dialog) {
  font-size: 16px;
  .el-dialog__body {
    .switch-container {
      .el-form-item {
        width: unset;
        margin-right: 0;
      }
    }
    .el-form-item {
      width: 46%;
      margin-right: 0;
      margin-left: 0;
      .el-select {
        width: 100%;
        min-width: unset;
      }
    }
  }
}
</style>
