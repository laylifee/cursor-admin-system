<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <!-- 炉次号 -->
          <el-form-item label="炉次号" prop="HeatNo">
            <el-input v-model="searchForm.HeatNo" placeholder="请输入炉次号" clearable />
          </el-form-item>
          <!-- 钢种 -->
          <el-form-item label="钢种" prop="SteelGrade">
            <el-input v-model="searchForm.SteelGrade" placeholder="请输入钢种" clearable />
          </el-form-item>
          <!-- 样本号 -->
          <el-form-item label="样本号" prop="SampleNo">
            <el-input v-model="searchForm.SampleNo" placeholder="请输入样本号" clearable />
          </el-form-item>

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
          row-key="businessId"
          @row-click="handleRowClick"
        >
          <el-table-column type="expand">
            <template #default="{ row }">
              <div class="expand-content">
                <el-table :data="row.alarms" border size="small">
                  <el-table-column label="预警成分">
                    <template #default="{ row: subRow }">
                      {{ typeNameMap[subRow.type] || subRow.type }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="value" label="当前值" />
                  <el-table-column prop="lowerLimit" label="下限" />
                  <el-table-column prop="upperLimit" label="上限" />
                  <el-table-column label="状态">
                    <template #default="{ row: subRow }">
                      <el-tag :type="getAlarmStatusType(subRow)" size="small">
                        {{ getAlarmStatusLabel(subRow) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="已读">
                    <template #default="{ row: subRow }">
                      <el-tag :type="subRow.hasRead ? 'success' : 'danger'" size="small">
                        {{ subRow.hasRead ? '已读' : '未读' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="heatNo" label="炉次号" min-width="100" />
          <el-table-column prop="steelGrade" label="钢种" min-width="100" />
          <el-table-column prop="sampleNo" label="样本号" min-width="100" />
          <el-table-column label="预警成分" min-width="120">
            <template #default="{ row }">
              <el-tag
                v-for="alarm in row.alarms"
                :key="alarm.type"
                :type="getAlarmStatusType(alarm)"
                size="small"
                class="alarm-tag"
              >
                {{ typeNameMap[alarm.type] || alarm.type }}: {{ alarm.value }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="hasRead" label="已读状态" width="100">
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
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useTableHeight } from '@/utils/useTableHeight'
import SearchWrapper from '@/components/SearchWrapper.vue'
import { useRoute } from 'vue-router'
import { getSteelTypeAlarmInfoList, submitSteelTypeAlarmInfo } from '@/api/bofSteelMaking'
import { useExportFun } from '@/utils/useExportFun'
import { getDictItemList } from '@/api/basicSetting'
const route = useRoute()
const tableRef = ref(null)

const { tableHeight, calculateTableHeight } = useTableHeight()
// 搜索类型下拉（含级联子项）
const filterTypeList = ref([])
const loading = ref(false)
const exportAllLoading = ref(false)
const rawTableData = ref([])
const total = ref(0)

// type 编码 → 中文名 映射
const typeNameMap = computed(() => {
  const map = {}
  filterTypeList.value.forEach((item) => {
    map[item.code] = item.name
  })
  return map
})

// 按 businessId 聚合
const aggregateByBusinessId = (items) => {
  if (!items || items.length === 0) return []
  const map = new Map()
  items.forEach((item) => {
    const key = item.businessId
    if (!map.has(key)) {
      map.set(key, {
        businessId: item.businessId,
        heatNo: item.heatNo,
        steelGrade: item.steelGrade,
        sampleNo: item.sampleNo,
        alarms: []
      })
    }
    map.get(key).alarms.push({
      type: item.type,
      value: item.value,
      upperLimit: item.upperLimit,
      lowerLimit: item.lowerLimit,
      hasRead: item.hasRead
    })
  })
  // 计算聚合行的 hasRead：所有子项都已读才算已读
  const result = Array.from(map.values())
  result.forEach((group) => {
    group.alarmCount = group.alarms.length
    group.hasRead = group.alarms.every((a) => a.hasRead)
  })
  return result
}

// 聚合后的表格数据
const tableData = computed(() => aggregateByBusinessId(rawTableData.value))

const searchForm = ref({
  SkipCount: 1,
  MaxResultCount: 20,
  HeatNo: '',
  SteelGrade: '',
  HasRead: '',
  SampleNo: '',
  Type: '',
  HasRead: ''
})
const searchFormRef = ref(null)

// 判断单个预警的状态
const getAlarmStatusType = (alarm) => {
  if (alarm.value < alarm.lowerLimit) return 'warning'
  if (alarm.value > alarm.upperLimit) return 'danger'
  return ''
}

const getAlarmStatusLabel = (alarm) => {
  if (alarm.value < alarm.lowerLimit) return '偏低'
  if (alarm.value > alarm.upperLimit) return '偏高'
  return '正常'
}

const getList = async () => {
  loading.value = true
  try {
    const params = {
      SkipCount: (searchForm.value.SkipCount - 1) * searchForm.value.MaxResultCount,
      MaxResultCount: searchForm.value.MaxResultCount,
      HeatNo: searchForm.value.HeatNo || undefined,
      SteelGrade: searchForm.value.SteelGrade || undefined,
      HasRead: searchForm.value.HasRead || undefined,
      SampleNo: searchForm.value.SampleNo || undefined,
      Type: searchForm.value.Type || undefined
    }
    const res = await getSteelTypeAlarmInfoList(params)
    rawTableData.value = res?.items ?? []
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
  searchForm.value.HeatNo = ''
  searchForm.value.SteelGrade = ''
  searchForm.value.HasRead = ''
  searchForm.value.SampleNo = ''
  searchForm.value.Type = ''
  getList()
}

const refreshTable = () => {
  getList()
}

// 点击行展开/收起
const handleRowClick = (row) => {
  tableRef.value?.toggleRowExpansion(row)
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
    const originalData = rawTableData.value
    rawTableData.value = allData
    await nextTick()
    const { exportDataFun } = useExportFun(tableRef, tableData, '报警信息列表数据(全部)')
    exportDataFun()
    rawTableData.value = originalData
  } catch (error) {
    console.error('导出全部失败:', error)
    ElMessage.error('导出全部失败')
  } finally {
    exportAllLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.expand-content {
  padding: 8px 20px;
}
.alarm-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}
</style>
