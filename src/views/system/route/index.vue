<template>
  <div class="route-management">
    <el-table :data="routes" style="width: 100%">
      <el-table-column prop="path" label="路径" min-width="180"></el-table-column>
      <el-table-column prop="name" label="名称" min-width="180"></el-table-column>
      <el-table-column prop="meta.title" label="标题" min-width="180"></el-table-column>
      <el-table-column prop="meta.icon" label="图标" min-width="180"></el-table-column>
      <el-table-column prop="meta.roles" label="角色" min-width="180"></el-table-column>
    </el-table>
    <el-form :model="newRoute" @submit.prevent="addRoute">
      <el-form-item label="路径">
        <el-input v-model="newRoute.path"></el-input>
      </el-form-item>
      <el-form-item label="名称">
        <el-input v-model="newRoute.name"></el-input>
      </el-form-item>
      <el-form-item label="标题">
        <el-input v-model="newRoute.meta.title"></el-input>
      </el-form-item>
      <el-form-item label="图标">
        <el-input v-model="newRoute.meta.icon"></el-input>
      </el-form-item>
      <el-form-item label="角色">
        <el-input v-model="newRoute.meta.roles"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">添加路由</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'RouteManagement',
  data() {
    return {
      routes: this.$router.options.routes,
      newRoute: {
        path: '',
        name: '',
        meta: {
          title: '',
          icon: '',
          roles: []
        }
      }
    }
  },
  methods: {
    addRoute() {
      this.$router.addRoute({
        path: this.newRoute.path,
        name: this.newRoute.name,
        component: () => import('@/views/error-page/404.vue'), // Placeholder component
        meta: this.newRoute.meta
      })
      this.routes.push(this.newRoute)
      this.newRoute = {
        path: '',
        name: '',
        meta: {
          title: '',
          icon: '',
          roles: []
        }
      }
    }
  }
}
</script>

<style scoped>
.route-management {
  padding: 20px;
}
</style>
