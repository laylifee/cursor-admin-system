<template>
  <section class="app-main">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<style lang="scss" scoped>
.app-main {
  min-height: calc(100vh - 50px);
  // height: calc(100vh - 50px);
  padding: 50px 20px 20px;
  position: relative;
  overflow: hidden;
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
