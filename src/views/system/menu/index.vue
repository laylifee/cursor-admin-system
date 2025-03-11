<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单列表</span>
          <el-button type="primary" @click="handleAdd">新增菜单</el-button>
        </div>
      </template>

      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="菜单名称" min-width="200">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由地址" min-width="200" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleAdd(row)">添加子菜单</el-button>
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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑菜单' : '新增菜单'">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="tableData"
            check-strictly
            :render-after-expand="false"
            node-key="id"
            :props="{ label: 'name', children: 'children' }"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" style="width: 200px" />
        </el-form-item>
        <el-form-item label="路由地址" prop="path">
          <el-input v-model="form.path" style="width: 200px" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" style="width: 200px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { db } from '@/utils/dbConfig.js'

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const form = ref({
  name: '',
  path: '',
  sort: 0,
  parentId: null
})
const formRef = ref(null)
const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const getList = async () => {
  loading.value = true
  try {
    const res = await db.menu.toArray()
    tableData.value = buildTree(res)
    total.value = res.length
  } catch (error) {
    console.error('获取菜单列表失败:', error)
  } finally {
    loading.value = false
  }
}

const buildTree = (data, parentId = null) => {
  return data
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(data, item.id)
    }))
}

const handleSizeChange = (val) => {
  pageSize.value = val
  getList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getList()
}

const handleAdd = (row = null) => {
  formRef.value && formRef.value.resetFields()
  form.value = {
    name: '',
    path: '',
    sort: 0,
    parentId: row ? row.id : null
  }
  dialogVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.value.id) {
          await db.menu.update(form.value.id, form.value)
          ElMessage.success('编辑菜单成功')
        } else {
          await db.menu.add(form.value)
          ElMessage.success('新增菜单成功')
        }
        dialogVisible.value = false
        getList()
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该菜单吗？删除后子菜单也将被删除', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      // 递归删除子菜单
      const deleteMenuAndChildren = async (menuId) => {
        const children = await db.menu.where('parentId').equals(menuId).toArray()
        for (const child of children) {
          await deleteMenuAndChildren(child.id)
        }
        await db.menu.delete(menuId)
      }

      await deleteMenuAndChildren(row.id)
      getList()
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
