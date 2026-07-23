<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <SearchWrapper>
      <template #left>
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="废钢斗号" prop="BucketNo">
            <el-input v-model="searchForm.BucketNo" placeholder="请输入废钢斗号" clearable />
          </el-form-item>
          <el-form-item label="时间" prop="datetimeRange">
            <DateTimeRange v-model="datetimeRange" @change="handleDateTimeRangeChange" />
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
        </div>
      </div>

      <div class="table-content">
        <el-table :data="tableData" style="width: 100%" v-loading="loading" :height="tableHeight">
          <el-table-column prop="bucketNo" label="废钢斗号" />
          <el-table-column prop="startTime" label="开始时间">
            <template #default="{ row }">
              {{ row.startTime ? dayjs(row.startTime).format('YYYY-MM-DD HH:mm:ss') : '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间">
            <template #default="{ row }">
              {{ row.endTime ? dayjs(row.endTime).format('YYYY-MM-DD HH:mm:ss') : '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="creationTime" label="创建时间">
            <template #default="{ row }">
              {{ row.creationTime ? dayjs(row.creationTime).format('YYYY-MM-DD HH:mm:ss') : '--' }}
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTableHeight } from '@/utils/useTableHeight'
import SearchWrapper from '@/components/SearchWrapper.vue'
import { useRoute } from 'vue-router'
import { getGroundScrapedRecordList } from '@/api/scrapedSteelController'
import dayjs from 'dayjs'

const route = useRoute()

const { tableHeight, calculateTableHeight } = useTableHeight()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const searchForm = ref({
  SkipCount: 1,
  MaxResultCount: 20,
  BucketNo: '',
  StartCreationTime: '',
  EndCreationTime: ''
})
const searchFormRef = ref(null)
const datetimeRange = ref([])

const handleDateTimeRangeChange = (val) => {
  if (val && val.length === 2) {
    searchForm.value.StartCreationTime = val[0]
    searchForm.value.EndCreationTime = val[1]
  } else {
    searchForm.value.StartCreationTime = ''
    searchForm.value.EndCreationTime = ''
  }
}

const getList = async () => {
  loading.value = true
  try {
    const params = {
      SkipCount: (searchForm.value.SkipCount - 1) * searchForm.value.MaxResultCount,
      MaxResultCount: searchForm.value.MaxResultCount,
      BucketNo: searchForm.value.BucketNo || undefined,
      StartCreationTime: searchForm.value.StartCreationTime || undefined,
      EndCreationTime: searchForm.value.EndCreationTime || undefined
    }
    const res = await getGroundScrapedRecordList(params)
    tableData.value = res?.items ?? []
    total.value = res?.totalCount ?? 0
  } catch (error) {
    console.error('获取列表失败:', error)
    ElMessage.error('获取列表失败')
  } finally {
    calculateTableHeight()
    loading.value = false
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
  searchForm.value.BucketNo = ''
  searchForm.value.StartCreationTime = ''
  searchForm.value.EndCreationTime = ''
  datetimeRange.value = []
  getList()
}

const refreshTable = () => {
  getList()
}

onMounted(async () => {
  getList()
})
</script>

<style lang="scss" scoped>
</style>
