<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="协议名称" prop="ProtocolName">
            <el-input v-model="searchForm.ProtocolName" placeholder="请输入协议名称" clearable />
          </el-form-item>
          <el-form-item label="协议ID" prop="ProtocolId">
            <el-input v-model="searchForm.ProtocolId" placeholder="请输入协议ID" clearable />
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
          <h3>协议配置列表</h3>
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
          <el-table-column prop="protocolId" min-width="180" label="协议ID" />
          <el-table-column prop="protocolName" label="协议名称" />
          <el-table-column prop="protocolType" label="协议类型" />
          <el-table-column prop="rack" label="机架" />
          <el-table-column prop="slot" label="插槽" />
          <el-table-column prop="ipAddress" label="IP地址" />
          <el-table-column prop="port" label="端口" />
          <el-table-column prop="connectTimeOut" label="连接超时" />
          <el-table-column prop="sampleCycle" label="采样周期" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作" min-width="120" fixed="right">
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
        <el-form-item label="协议名称" prop="protocolName">
          <el-input v-model="form.protocolName" />
        </el-form-item>
        <el-form-item label="协议类型" prop="protocolType">
          <el-select v-model="form.protocolType" placeholder="请选择协议类型" clearable>
            <el-option label="S7" value="S7" />
            <el-option label="OPCUA" value="OPCUA" />
            <el-option label="MODBUS" value="MODBUS" />
          </el-select>
        </el-form-item>
        <el-form-item label="CPU类型" prop="cpuType">
          <el-input v-model="form.cpuType" />
        </el-form-item>
        <el-form-item label="机架号" prop="rack">
          <el-input v-model="form.rack" />
        </el-form-item>
        <el-form-item label="插槽号" prop="slot">
          <el-input v-model="form.slot" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="form.ipAddress" />
        </el-form-item>
        <el-form-item label="端口号" prop="port">
          <el-input v-model="form.port" />
        </el-form-item>
        <el-form-item label="超时时间" prop="connectTimeOut">
          <el-input v-model="form.connectTimeOut" />
        </el-form-item>
        <el-form-item label="采样周期" prop="sampleCycle">
          <el-input v-model="form.sampleCycle" />
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
import {
  addProtocolConfig,
  updateProtocolConfig,
  deleteProtocolConfig,
  getProtocolConfigList
} from '@/api/scada'
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
  protocolName: '',
  protocolType: '',
  cpuType: '',
  rack: '',
  slot: '',
  ipAddress: '',
  port: '',
  connectTimeOut: 5000,
  sampleCycle: '',
  description: '',
  devices: []
})
// 新增表单验证规则
const rules = {
  protocolName: [{ required: true, message: '请输入协议名称', trigger: 'blur' }],
  protocolType: [{ required: true, message: '请选择协议类型', trigger: 'change' }],
  cpuType: [{ required: true, message: '请选择CPU类型', trigger: 'change' }],
  rack: [{ required: true, message: '请输入机架号', trigger: 'blur' }],
  slot: [{ required: true, message: '请输入插槽号', trigger: 'blur' }],
  ipAddress: [{ required: true, message: '请输入IP地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口号', trigger: 'blur' }],
  connectTimeOut: [{ required: true, message: '请输入连接超时时间', trigger: 'blur' }],
  sampleCycle: [{ required: true, message: '请输入采样周期', trigger: 'blur' }]
}
// 新增表单ref
const formRef = ref(null)
// 搜索表单ref
const searchFormRef = ref(null)

// 条件查询表单
const searchForm = ref({
  SkipCount: 1,
  MaxResultCount: 20,
  ProtocolId: '',
  ProtocolName: ''
})

// 打开新增弹窗
const handleAdd = () => {
  form.value = {
    protocolName: '',
    protocolType: '',
    cpuType: '',
    rack: '',
    slot: '',
    ipAddress: '',
    port: '',
    connectTimeOut: 5000,
    sampleCycle: '',
    description: ''
    // devices: []
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
        data.connectTimeOut = Number(data.connectTimeOut)
        data.sampleCycle = Number(data.sampleCycle)
        data.slot = Number(data.slot)
        data.port = Number(data.port)
        data.rack = Number(data.rack)
        await updateProtocolConfig(data)
        getList()
        handleCancel()
        ElMessage.success('编辑成功')
        return
      }
      // 新增IO配置
      const data = {
        ...form.value
      }
      data.connectTimeOut = Number(data.connectTimeOut)
      data.sampleCycle = Number(data.sampleCycle)
      data.slot = Number(data.slot)
      data.port = Number(data.port)
      data.rack = Number(data.rack)

      await addProtocolConfig(data)
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
    protocolName: '',
    protocolType: '',
    cpuType: '',
    rack: '',
    slot: '',
    ipAddress: '',
    port: '',
    connectTimeOut: 5000,
    sampleCycle: '',
    description: '',
    devices: []
  }
  done()
}
const handleCancel = () => {
  formRef.value.resetFields()
  isEdit.value = false
  isSubmit.value = false
  dialogVisible.value = false
  form.value = {
    protocolName: '',
    protocolType: '',
    cpuType: '',
    rack: '',
    slot: '',
    ipAddress: '',
    port: '',
    connectTimeOut: 5000,
    sampleCycle: '',
    description: '',
    devices: []
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
  ElMessageBox.confirm('确认删除该协议配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await deleteProtocolConfig({
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
  let data = await getProtocolConfigList(params)
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
    ProtocolName: '',
    ProtocolId: '',
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
