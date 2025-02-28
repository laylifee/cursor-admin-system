<template>
  <div class="flex-layout">
    <div class="flex-layout__left">
      <slot name="form"></slot>
    </div>
    <div class="flex-layout__right">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'TableSearch'
})
</script>

<style scoped>
.flex-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.flex-layout__left {
  flex: 1;
}

.flex-layout__right {
  display: flex;
  gap: 8px;
}
</style>
