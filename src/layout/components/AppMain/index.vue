<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useTagsViewStore } from '@/store/modules/tagsView'

const tagsViewStore = useTagsViewStore()
const cachedViews = computed(() => tagsViewStore.cachedViews)
</script>

<style lang="scss" scoped>
.app-main {
  min-height: calc(100vh - 82px);
  // height: calc(100vh - 84px);
  padding: 82px 20px 20px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
// 合并重复的动画定义
.fade-transform {
  &-enter-active,
  &-leave-active {
    transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
  }

  &-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }

  &-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
}
</style>
