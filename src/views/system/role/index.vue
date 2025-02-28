<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="120" />
        <el-table-column prop="code" label="角色标识" width="120" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handlePermission(row)">权限</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    description: '系统最高权限',
    status: 1
  },
  {
    id: 2,
    name: '编辑人员',
    code: 'editor',
    description: '内容编辑权限',
    status: 1
  },
  {
    id: 3,
    name: '访客',
    code: 'visitor',
    description: '只读权限',
    status: 1
  }
])

const handleAdd = () => {
  ElMessage.info('新增角色功能开发中')
}

const handleEdit = (row) => {
  ElMessage.info('编辑角色功能开发中')
}

const handlePermission = (row) => {
  ElMessage.info('权限配置功能开发中')
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该角色吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 16px; // 1rem to 16px

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
