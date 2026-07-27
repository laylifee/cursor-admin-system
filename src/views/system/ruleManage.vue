<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="数据类型" prop="Type">
            <el-select v-model="searchForm.Type" placeholder="请选择类型" clearable>
              <el-option
                v-for="item in filterTypeList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="来源" prop="Code">
            <el-input v-model="searchForm.Code" placeholder="请输入来源" clearable />
          </el-form-item> -->
        </el-form>
      </template>
      <template #right>
        <el-button :disabled="loading" type="primary" @click="getList">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button :disabled="loading" @click="resetSearch">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </template>
    </SearchWrapper>

    <!-- 表格区域 -->
    <div class="table-container">
      <div class="table-header">
        <div class="header-title">
          <h3>{{ route?.meta?.title }}</h3>
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
          <el-table-column prop="name" label="规则名称" />
          <el-table-column prop="dataType" label="数据类型">
            <template #default="{ row }">
              {{ getDataTypeLabel(row.dataType) }}
            </template>
          </el-table-column>
          <el-table-column prop="dataSource" label="数据来源">
            <template #default="{ row }">
              {{ getDataSourceLabel(row.dataSource) }}
            </template>
          </el-table-column>
          <el-table-column prop="lowerLimit" label="下限" />
          <el-table-column prop="upperLimit" label="上限" />
          <el-table-column prop="severity" label="严重程度">
            <template #default="{ row }">
              {{ getSeverityLabel(row.severity) }}
            </template>
          </el-table-column>
          <!-- <el-table-column prop="durationSeconds" label="持续时间(秒)" /> -->
          <el-table-column prop="isEnabled" label="启用状态">
            <template #default="{ row }">
              <el-tag :type="row.isEnabled ? 'success' : 'danger'">
                {{ row.isEnabled ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
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

    <!-- 规则管理弹窗 -->
    <el-dialog
      :title="isEdit ? '编辑规则' : '新增规则'"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="dialogVisible"
      width="50%"
      destroy-on-close
      :before-close="handleClose"
    >
      <el-form :model="form" :rules="rules" inline ref="formRef" label-width="110px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="上限" prop="upperLimit">
          <el-input-number
            style="width: 196px"
            v-model="form.upperLimit"
            :step="0.0001"
            :precision="4"
          />
        </el-form-item>
        <el-form-item label="数据来源" prop="dataSource">
          <el-select
            style="width: 196px"
            v-model="form.dataSource"
            placeholder="请选择数据来源"
            clearable
            :disabled="isEdit"
            @change="handleDataSourceChange"
          >
            <el-option
              v-for="item in dictItemList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下限" prop="lowerLimit">
          <el-input-number
            style="width: 196px"
            v-model="form.lowerLimit"
            :step="0.0001"
            :precision="4"
          />
        </el-form-item>
        <el-form-item label="数据类型" prop="dataType">
          <el-select
            style="width: 196px"
            v-model="form.dataType"
            placeholder="请选择数据类型"
            clearable
            :disabled="isEdit"
            @visible-change="handleDataTypeVisible"
          >
            <el-option
              v-for="item in dataTypeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="持续时间(秒)" prop="durationSeconds">
          <el-input-number v-model="form.durationSeconds" :min="0" style="width: 100%" />
        </el-form-item> -->
        <el-form-item label="严重程度" prop="severity">
          <el-select style="width: 196px" v-model="form.severity" placeholder="请选择严重程度">
            <el-option
              v-for="item in severityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="isEnabled">
          <el-switch v-model="form.isEnabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="isSubmit" @click="handleCancel">取消</el-button>
        <el-button :disabled="isSubmit" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTableHeight } from '@/utils/useTableHeight'
import SearchWrapper from '@/components/SearchWrapper.vue'
import { useRoute } from 'vue-router'
import {
  getStandardRecordList,
  addStandardRecord,
  deleteStandardRecord,
  updateStandardRecord,
  getStandardRecordDetail
} from '@/api/system'
import { getDictItemList } from '@/api/basicSetting'
const dictItemList = ref([])
const route = useRoute()
// 数据类型
const dataTypeList = ref([])
// 搜索类型下拉（含级联子项）
const filterTypeList = ref([])

const { tableHeight, calculateTableHeight } = useTableHeight()

// 表格相关数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const isSubmit = ref(false)

// 搜索表单
const searchForm = ref({
  Type: '',
  Code: '',
  SkipCount: 1,
  MaxResultCount: 20,
  IsIronComposition: false
})
const searchFormRef = ref(null)

// 严重程度选项
const severityOptions = ref([
  { label: '提醒', value: 1 },
  { label: '警告', value: 2 },
  { label: '严重', value: 3 }
  // { label: '严重', value: 4 }
])
// 严重程度转为中文
const getSeverityLabel = (val) => {
  const item = severityOptions.value.find((o) => o.value === val)
  return item ? item.label : '-'
}

// 数据类型转为中文
const getDataTypeLabel = (val) => {
  const item = filterTypeList.value.find((o) => o.code === val)
  return item ? item.name : '-'
}
// 数据来源转为中文
const getDataSourceLabel = (val) => {
  const item = dictItemList.value.find((o) => o.code === val)
  return item ? item.name : '-'
}
// 获取数据类型选项
const getDataTypeOptions = async (id, isType = false) => {
  try {
    const res = await getDictItemList({
      id: id
    })
    if (isType) {
      dataTypeList.value = res?.items ?? []
    } else {
      dictItemList.value = res?.items ?? []
    }
  } catch (error) {
    console.error('获取数据类型选项失败:', error)
    ElMessage.error('获取数据类型选项失败')
  }
}

// 初始化搜索类型下拉，含级联子项
const initFilterTypeList = async () => {
  try {
    const res = await getDictItemList({ id: 21 })
    const items = res?.items ?? []
    dictItemList.value = items

    // 收集 description 是数字的子级 id
    const childIds = items
      .map((item) => item?.description)
      .filter((desc) => desc && !isNaN(Number(desc)))
      .map(Number)

    // 批量请求子级列表
    if (childIds.length > 0) {
      const childResults = await Promise.all(childIds.map((id) => getDictItemList({ id })))
      const childItems = childResults.flatMap((r) => r?.items ?? [])
      filterTypeList.value = [...childItems]
    }
  } catch (error) {
    console.error('初始化类型下拉失败:', error)
  }
}

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  name: '',
  dataType: '',
  dataSource: '',
  upperLimit: 0,
  lowerLimit: 0,
  severity: 1,
  durationSeconds: 0,
  isEnabled: true
})
const formRef = ref(null)
const rules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  dataType: [{ required: true, message: '请输入数据类型', trigger: 'blur' }],
  dataSource: [{ required: true, message: '请输入数据来源', trigger: 'blur' }]
}

// 获取规则列表
const getList = async () => {
  loading.value = true
  try {
    const params = {
      SkipCount: (searchForm.value.SkipCount - 1) * searchForm.value.MaxResultCount,
      MaxResultCount: searchForm.value.MaxResultCount,
      Type: searchForm.value.Type || undefined,
      Code: searchForm.value.Code || undefined,
      IsIronComposition: searchForm.value.IsIronComposition || false
    }
    const res = await getStandardRecordList(params)
    tableData.value = res?.items ?? []
    total.value = res?.totalCount ?? 0
  } catch (error) {
    console.error('获取规则列表失败:', error)
    ElMessage.error('获取规则列表失败')
  } finally {
    calculateTableHeight()
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (val) => {
  searchForm.value.MaxResultCount = val
  getList()
}

// 处理数据来源选择变化
const handleDataSourceChange = (val) => {
  // 切换数据来源时清空数据类型
  form.value.dataType = ''
  // 获取里面列表对于val的某个字段值
  const item = dictItemList.value.find((o) => o.code === val)
  if (item) {
    let id = item?.description
    getDataTypeOptions(id, true)
  }
}

// 数据类型下拉展开时校验数据来源是否已选
const handleDataTypeVisible = (visible) => {
  if (visible && !form.value.dataSource) {
    ElMessage.warning('请先选择数据来源')
  }
}

const handleCurrentChange = (val) => {
  searchForm.value.SkipCount = val
  getList()
}

// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  searchForm.value.SkipCount = 1
  searchForm.value.Type = ''
  searchForm.value.Code = ''
  searchForm.value.IsIronComposition = false
  getList()
}

// 刷新
const refreshTable = () => {
  getList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  formRef.value?.resetFields()
  form.value = {
    name: '',
    dataType: '',
    dataSource: '',
    upperLimit: 0,
    lowerLimit: 0,
    severity: 1,
    durationSeconds: 0,
    isEnabled: true
  }
  isSubmit.value = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  isSubmit.value = false
  dialogVisible.value = true
}

// 提交
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        isSubmit.value = true
        if (isEdit.value) {
          await updateStandardRecord(form.value)
          ElMessage.success('编辑规则成功')
        } else {
          await addStandardRecord(form.value)
          ElMessage.success('新增规则成功')
        }
        getList()
        handleCancel()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      } finally {
        isSubmit.value = false
      }
    }
  })
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await deleteStandardRecord({ id: row.id })
      ElMessage.success('删除成功')
      getList()
    })
    .catch(() => {})
}

// 弹窗关闭
const handleClose = (done) => {
  dialogVisible.value = false
  done()
}

const handleCancel = () => {
  formRef.value?.resetFields()
  dialogVisible.value = false
  isEdit.value = false
}

// 初始化
onMounted(async () => {
  await initFilterTypeList()
  getList()
})
</script>

<style lang="scss" scoped></style>
