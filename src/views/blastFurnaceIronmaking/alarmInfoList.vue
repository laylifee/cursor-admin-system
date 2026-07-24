<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="类型" prop="Type">
            <el-select v-model="searchForm.Type" placeholder="请选择类型" clearable>
              <el-option
                v-for="item in filterTypeList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="严重程度" prop="Severity">
            <el-select v-model="searchForm.Severity" placeholder="请选择严重程度" clearable>
              <el-option label="全部" value="" />
              <el-option
                v-for="item in severityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="已读状态" prop="HasRead">
            <el-select v-model="searchForm.HasRead" placeholder="请选择已读状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="未读" :value="false" />
              <el-option label="已读" :value="true" />
            </el-select>
          </el-form-item>
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
          <el-button @click="refreshTable">
            <el-icon><Refresh /></el-icon>
          </el-button>
          <!-- <el-button @click="exportData"> 导出 </el-button>
          <el-button type="primary" :loading="exportAllLoading" @click="exportAllData">
            导出全部
          </el-button> -->
        </div>
      </div>

      <div class="table-content">
        <el-table
          ref="tableRef"
          :data="tableData"
          style="width: 100%"
          v-loading="loading"
          :height="tableHeight"
        >
          <el-table-column prop="message" label="报警信息" show-overflow-tooltip />
          <el-table-column prop="code" label="数据类型" />
          <el-table-column prop="type" label="数据来源" />
          <el-table-column prop="severity" label="严重程度">
            <template #default="{ row }">
              {{ getSeverityLabel(row.severity) }}
            </template>
          </el-table-column>
          <!-- <el-table-column prop="durationSeconds" label="持续时间(秒)" /> -->
          <el-table-column prop="hasRead" label="已读状态">
            <template #default="{ row }">
              <el-tag :type="row.hasRead ? 'success' : 'danger'">
                {{ row.hasRead ? '已读' : '未读' }}
              </el-tag>
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
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useTableHeight } from '@/utils/useTableHeight'
import SearchWrapper from '@/components/SearchWrapper.vue'
import { useRoute } from 'vue-router'
import { getAlarmInfoList } from '@/api/bofSteelMaking'
import { useExportFun } from '@/utils/useExportFun'
import { getDictItemList } from '@/api/basicSetting'
const route = useRoute()
const tableRef = ref(null)

const { tableHeight, calculateTableHeight } = useTableHeight()
// 搜索类型下拉（含级联子项）
const filterTypeList = ref([])
const loading = ref(false)
const exportAllLoading = ref(false)
const tableData = ref([])
const total = ref(0)

const searchForm = ref({
  SkipCount: 1,
  MaxResultCount: 20,
  Severity: '',
  Type: '',
  HasRead: ''
})
const searchFormRef = ref(null)

const severityOptions = ref([
  { label: '提醒', value: 1 },
  { label: '警告', value: 2 },
  { label: '严重', value: 3 }
])

const getSeverityLabel = (val) => {
  const item = severityOptions.value.find((o) => o.value === val)
  return item ? item.label : '-'
}

const getList = async () => {
  loading.value = true
  try {
    const params = {
      SkipCount: (searchForm.value.SkipCount - 1) * searchForm.value.MaxResultCount,
      MaxResultCount: searchForm.value.MaxResultCount,
      Severity: searchForm.value.Severity || undefined,
      Type: searchForm.value.Type || undefined,
      HasRead: searchForm.value.HasRead !== '' ? searchForm.value.HasRead : undefined
    }
    const res = await getAlarmInfoList(params)
    tableData.value = res?.items ?? []
    total.value = res?.totalCount ?? 0
  } catch (error) {
    console.error('获取报警信息列表失败:', error)
    ElMessage.error('获取报警信息列表失败')
  } finally {
    calculateTableHeight()
    loading.value = false
  }
}
// 初始化搜索类型下拉，含级联子项
const initFilterTypeList = async () => {
  try {
    const res = await getDictItemList({ id: 21 })
    const items = res?.items ?? []

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
const handleSizeChange = (val) => {
  searchForm.value.MaxResultCount = val
  getList()
}

const handleCurrentChange = (val) => {
  searchForm.value.SkipCount = val
  getList()
}

const resetSearch = () => {
  searchFormRef.value?.resetFields()
  searchForm.value.SkipCount = 1
  searchForm.value.Severity = ''
  searchForm.value.Type = ''
  searchForm.value.HasRead = ''
  getList()
}

const refreshTable = () => {
  getList()
}

onMounted(async () => {
  getList()
  initFilterTypeList()
})

// 导出当前页数据
const exportData = () => {
  const { exportDataFun } = useExportFun(tableRef, tableData, '报警信息列表数据')
  exportDataFun()
}

// 导出全部数据
const exportAllData = async () => {
  if (total.value === 0) {
    ElMessage.warning('当前无数据可导出')
    return
  }
  exportAllLoading.value = true
  try {
    const params = {
      SkipCount: 0,
      MaxResultCount: total.value,
      Severity: searchForm.value.Severity || undefined,
      Type: searchForm.value.Type || undefined,
      HasRead: searchForm.value.HasRead !== '' ? searchForm.value.HasRead : undefined
    }
    const res = await getAlarmInfoList(params)
    const allData = res?.items ?? []
    if (allData.length === 0) {
      ElMessage.warning('当前无数据可导出')
      return
    }
    const originalData = tableData.value
    tableData.value = allData
    await nextTick()
    const { exportDataFun } = useExportFun(tableRef, tableData, '报警信息列表数据(全部)')
    exportDataFun()
    tableData.value = originalData
  } catch (error) {
    console.error('导出全部失败:', error)
    ElMessage.error('导出全部失败')
  } finally {
    exportAllLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
</style>
