<template>
  <!-- 搜索区域 -->
  <div class="search-container">
    <div class="search-content">
      <slot name="left"></slot>
    </div>
    <div class="search-actions">
      <slot name="right"></slot>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.search-container {
  background-color: #fff;
  border-radius: 4px;
  padding: 16px 16px 0;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-bottom: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;

  .search-content {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;

    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .el-form-item {
        margin-bottom: 8px;
        margin-right: 0;
      }
    }
  }

  .search-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
}
</style>
