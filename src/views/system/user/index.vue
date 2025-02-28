<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="roles" label="角色">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role" class="mr-1">
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="introduction" label="简介" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const getList = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/user/list',
      method: 'get',
      params: {
        page: currentPage.value,
        limit: pageSize.value
      }
    })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getList()
}

const handleAdd = () => {
  ElMessage.info('新增用户功能开发中')
}

const handleEdit = (row) => {
  ElMessage.info('编辑用户功能开发中')
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 16px; // 1rem to 16px

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination-container {
    margin-top: 16px; // 1rem to 16px
    display: flex;
    justify-content: flex-end;
  }
}
</style>
