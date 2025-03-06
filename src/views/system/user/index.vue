<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="showAddUserDialog">新增用户</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="roles" label="角色">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role" class="mr-1">
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" width="150" />
        <el-table-column prop="avatar" label="头像" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="简介" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button :loading="isDeleting" type="danger" link @click="handleDelete(row)"
              >删除</el-button
            >
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

    <el-dialog v-model="addUserDialogVisible" :title="dialogTitle">
      <el-form :model="addUserForm" :rules="rules" ref="addUserFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addUserForm.name" style="width: 200px" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model="addUserForm.age" style="width: 200px" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="addUserForm.gender" style="width: 200px">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addUserForm.phone" style="width: 200px" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email" style="width: 200px" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addUserForm.password" style="width: 200px" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="addUserForm.avatar" style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="addUserForm.status" style="width: 200px">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="addUserForm.remark" style="width: 200px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddUser">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { db } from '@/utils/dbConfig.js'

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const addUserDialogVisible = ref(false)
const addUserForm = ref({
  name: '',
  age: '',
  gender: '',
  phone: '',
  email: '',
  password: '',
  avatar: '',
  status: '',
  remark: ''
})
const addUserFormRef = ref(null)
// 弹窗的title
const dialogTitle = ref('新增用户')
// 编辑当前行的数据
const currentRow = ref(null)
// 是否是编辑状态
const isEdit = ref(false)
// 是否正在删除
const isDeleting = ref(false)
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const getList = async () => {
  loading.value = true
  try {
    // const res = await request({
    //   url: '/user/list',
    //   method: 'get',
    //   params: {
    //     page: currentPage.value,
    //     limit: pageSize.value
    //   }
    // })
    // 查找用户表中的所有数据
    const res = await db.users.toArray()
    const count = await db.users.count()
    tableData.value = res
    total.value = count
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

const showAddUserDialog = () => {
  addUserDialogVisible.value = true
}

const handleAddUser = () => {
  addUserFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await db.users.update(currentRow.value.id, addUserForm.value)
          ElMessage.success('编辑用户成功')
          isEdit.value = false
          dialogTitle.value = '新增用户'
          addUserDialogVisible.value = false
          getList()
          return
        }
        const user = { ...addUserForm.value }
        await db.users.add(user)
        ElMessage.success('新增用户成功')
        addUserDialogVisible.value = false
        getList()
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  currentRow.value = { ...row }
  addUserForm.value = { ...row }
  addUserDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      isDeleting.value = true
      await db.users.delete(row.id)
      getList()
      ElMessage.success('删除成功')
    })
    .catch(() => {})
    .finally(() => {
      isDeleting.value = false
    })
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 16px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
