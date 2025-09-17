<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="设备ID" prop="DeviceId">
            <el-input v-model="searchForm.DeviceId" placeholder="请输入设备ID" clearable />
          </el-form-item>
          <el-form-item label="设备名称" prop="DeviceName">
            <el-input v-model="searchForm.DeviceName" placeholder="请输入设备名称" clearable />
          </el-form-item>
          <el-form-item label="设备类型" prop="DeviceType">
            <el-select v-model="searchForm.DeviceType" placeholder="请选择设备类型" clearable>
              <el-option label="全部" value="''" />
              <el-option label="火车" :value="1" />
              <el-option label="铁包" :value="2" />
              <el-option label="废钢斗" :value="3" />
              <el-option label="天车" :value="4" />
            </el-select>
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
          <h3>设备配置列表</h3>
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
          <el-table-column prop="deviceId" min-width="180" label="设备ID" />
          <el-table-column prop="factoryNo" label="设备工厂编号" />
          <el-table-column prop="deviceName" label="设备名称" />
          <el-table-column prop="acquisitionInterval" label="采集间隔(秒)">
            <template #default="{ row }">
              {{ row.acquisitionInterval }}
            </template>
          </el-table-column>
          <el-table-column prop="deviceType" label="设备类型">
            <template #default="{ row }">
              {{
                row.deviceType === 1
                  ? '火车'
                  : row.deviceType === 2
                    ? '铁包'
                    : row.deviceType === 3
                      ? '废钢斗'
                      : row.deviceType === 4
                        ? '天车'
                        : '未知'
              }}
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
        <el-form-item label="设备工厂编号" prop="factoryNo">
          <el-input v-model="form.factoryNo" />
        </el-form-item>
        <el-form-item label="设备ID" prop="deviceId" v-if="isEdit">
          <el-input v-model="form.deviceId" disabled />
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="form.deviceName" />
        </el-form-item>
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="form.deviceType" placeholder="请选择设备类型" clearable>
            <el-option label="全部" value="''" />
            <el-option label="火车" :value="1" />
            <el-option label="铁包" :value="2" />
            <el-option label="废钢斗" :value="3" />
            <el-option label="天车" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="采集间隔" prop="acquisitionInterval">
          <el-input v-model="form.acquisitionInterval" />
        </el-form-item>
        <el-form-item label="是否启用" prop="isEnabled">
          <el-switch v-model="form.isEnabled" :active-value="true" :inactive-value="false" />
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
import { getRoleList, addRole, deleteRole, updateRole, getRoleDetail } from '@/api/role'
import {
  getDeviceConfigList,
  addDeviceConfig,
  updateDeviceConfig,
  deleteDeviceConfig
} from '@/api/deviceConfig'

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
// 新增表单
const form = ref({
  factoryNo: '',
  deviceId: '',
  deviceName: '',
  deviceType: '',
  description: '',
  acquisitionInterval: '',
  isEnabled: true
})
// 新增表单验证规则
const rules = {
  factoryNo: [{ required: true, message: '请输入设备工厂编号', trigger: 'blur' }],
  deviceId: [{ required: true, message: '请输入设备ID', trigger: 'blur' }],
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  acquisitionInterval: [{ required: true, message: '请输入采集间隔', trigger: 'blur' }]
}
// 新增表单ref
const formRef = ref(null)
// 搜索表单ref
const searchFormRef = ref(null)

// 条件查询表单
const searchForm = ref({
  SkipCount: 1,
  MaxResultCount: 20,
  DeviceId: '',
  DeviceName: '',
  DeviceType: ''
})

// 打开新增弹窗
const handleAdd = () => {
  form.value = {
    factoryNo: '',
    deviceId: '',
    deviceName: '',
    deviceType: '',
    description: '',
    acquisitionInterval: '',
    isEnabled: true
  }
  dialogVisible.value = true
}
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
        await updateDeviceConfig(data)
        getList()
        handleCancel()
        ElMessage.success('编辑角色成功')
        return
      }
      // 新增角色
      const data = {
        ...form.value,
        permissionIds: [],
        permissionNames: []
      }
      await addDeviceConfig(data)
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
    factoryNo: '',
    deviceId: '',
    deviceName: '',
    deviceType: '',
    description: '',
    acquisitionInterval: '',
    isEnabled: true
  }
  done()
}
const handleCancel = () => {
  formRef.value.resetFields()
  isEdit.value = false
  isSubmit.value = false
  dialogVisible.value = false
  form.value = {
    factoryNo: '',
    deviceId: '',
    deviceName: '',
    deviceType: '',
    description: '',
    acquisitionInterval: '',
    isEnabled: true
  }
}
// 当前选中的角色
const currentRole = ref(null)

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
  ElMessageBox.confirm('确认删除该设备配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await deleteDeviceConfig({
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
  let data = await getDeviceConfigList(params)
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
    DeviceId: '',
    DeviceName: '',
    DeviceType: '',
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
