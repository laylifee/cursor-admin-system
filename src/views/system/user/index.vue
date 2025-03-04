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
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
          :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { getAllUsers, addUser, deleteUser, updateUser, addUserBatch } from '@/utils/db/user';

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
import Mock from 'mockjs'

// 定义一个异步函数 getList，用于获取用户列表数据
const getList = async () => {
  loading.value = true // 显示加载状态
  try {
    // 发起请求，获取用户列表数据
    const res = await request({
      url: '/user/list', // 请求的 URL
      method: 'get', // 请求方法
      params: {
        page: currentPage.value, // 当前页码
        limit: pageSize.value // 每页显示的数量
      }
    })
    // 将获取到的数据赋值给 tableData 和 total
    tableData.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    // 捕获请求错误，打印错误信息
    console.error('获取用户列表失败:', error)
  } finally {
    // 无论请求成功或失败，都隐藏加载状态
    loading.value = false
  }
}

// 定义函数 handleSizeChange，用于处理每页显示数量变化时的逻辑
const handleSizeChange = (val) => {
  pageSize.value = val // 更新每页显示数量
  getList() // 重新获取用户列表数据
}

// 定义函数 handleCurrentChange，用于处理当前页码变化时的逻辑
const handleCurrentChange = (val) => {
  currentPage.value = val // 更新当前页码
  getList() // 重新获取用户列表数据
}

// 定义函数 handleAdd，用于处理新增用户的逻辑
const handleAdd = () => {
  ElMessage.info('新增用户功能开发中') // 弹出提示信息
}

// 定义函数 handleEdit，用于处理编辑用户的逻辑
const handleEdit = (row) => {
  ElMessage.info('编辑用户功能开发中') // 弹出提示信息
}

// 定义函数 handleDelete，用于处理删除用户的逻辑
const handleDelete = (row) => {
  // 弹出确认框，询问用户是否确认删除
  ElMessageBox.confirm('确认删除该用户吗？', '提示', {
    confirmButtonText: '确定', // 确认按钮文本
    cancelButtonText: '取消', // 取消按钮文本
    type: 'warning' // 提示框类型
  })
    .then(() => {
      // 用户点击确定后，弹出成功提示
      ElMessage.success('删除成功')
    })
    .catch(() => { }) // 用户点击取消时，不做任何处理
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
