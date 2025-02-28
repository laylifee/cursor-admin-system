<template>
  <div @click="toggleSideBar">
    <el-icon :size="20">
      <Fold v-if="!isCollapse" />
      <Expand v-else />
    </el-icon>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { Fold, Expand } from '@element-plus/icons-vue'

const appStore = useAppStore()
const isCollapse = computed(() => appStore.sidebar.opened)

const toggleSideBar = () => {
  appStore.toggleSidebar()
}
</script> 