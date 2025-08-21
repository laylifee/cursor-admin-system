<template>
  <div v-if="!isHidden(item)">
    <el-sub-menu
      v-if="hasChildren(item) && !hasSingleChild(item)"
      ref="subMenu"
      :index="item.path"
      popper-append-to-body
    >
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta.title }}</span>
      </template>
      <sidebar-item v-for="child in item.children" :key="child.path" :item="child" />
    </el-sub-menu>
    <template v-else-if="hasSingleChild(item)">
      <el-menu-item :index="item.children[0].path" @click="handleClick(item.children[0].path)">
        <el-icon v-if="item.children[0].meta.icon">
          <component :is="item.children[0].meta.icon" />
        </el-icon>
        <span>{{ item.children[0].meta.title }}</span>
      </el-menu-item>
    </template>
    <template v-else>
      <el-menu-item :index="item.path" @click="handleClick(item.path)">
        <el-icon v-if="item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta.title }}</span>
      </el-menu-item>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { isExternal } from '@/utils/validate'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const hasChildren = (item) => {
  return item.children && item.children.length > 0
}

const hasSingleChild = (item) => {
  return item.children && item.children.length === 1
}

const isHidden = (item) => {
  // 判断路由是否隐藏，默认不隐藏
  return item.meta && item.meta.hidden === true
}

const isDisabled = (item) => {
  // 判断路由是否禁用，默认不禁用
  return item.meta && item.meta.disabled === true
}

const handleClick = (path) => {
  router.push(path)
}
</script>
