<template>
  <div class="weight-card" :style="style">
    <div class="top-line"></div>
    <div class="corner-decor corner-tl"></div>
    <div class="corner-decor corner-tr"></div>
    <div class="corner-decor corner-bl"></div>
    <div class="corner-decor corner-br"></div>
    <div class="card-body">
      <div class="card-header">
        <div class="header-bar"></div>
        <span class="header-title">{{ title }}</span>
      </div>
      <div class="main-value">
        <span class="number" id="transit-total">{{ keepDecimalPlaces(number, 2) }}</span>
        <span class="unit">t</span>
      </div>
      <div class="divider"></div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { keepDecimalPlaces } from '@/utils/tools'

const props = defineProps({
  style: {
    type: Object,
    default: () => ({
      top: '280px',
      left: '0'
    })
  },
  title: {
    type: String,
    default: '在途铁水重量'
  },
  number: {
    type: Number,
    default: 0
  }
})
</script>
<style scoped>
/* ========== 样式一：标准卡片版（推荐） ========== */
.weight-card {
  position: absolute;

  z-index: 20;
  width: 220px;
  background: linear-gradient(135deg, rgba(16, 42, 88, 0.9) 0%, rgba(8, 25, 55, 0.95) 100%);
  border: 1px solid rgba(64, 156, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.weight-card .top-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, #409cff, transparent);
  margin-bottom: 12px;
}

.weight-card .corner-decor {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #409cff;
  border-style: solid;
}

.weight-card .corner-tl {
  top: 0;
  left: 0;
  border-width: 2px 0 0 2px;
  border-top-left-radius: 4px;
}
.weight-card .corner-tr {
  top: 0;
  right: 0;
  border-width: 2px 2px 0 0;
  border-top-right-radius: 4px;
}
.weight-card .corner-bl {
  bottom: 0;
  left: 0;
  border-width: 0 0 2px 2px;
  border-bottom-left-radius: 4px;
}
.weight-card .corner-br {
  bottom: 0;
  right: 0;
  border-width: 0 2px 2px 0;
  border-bottom-right-radius: 4px;
}

.weight-card .card-body {
  padding: 16px 20px;
}

.weight-card .card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.weight-card .header-bar {
  width: 4px;
  height: 16px;
  background: #ff6b35;
  border-radius: 2px;
}

.weight-card .header-title {
  color: #8ec5fc;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 1px;
}

.weight-card .main-value {
  text-align: center;
  margin-bottom: 16px;
}

.weight-card .main-value .number {
  font-size: 36px;
  font-weight: 500;
  color: #00d4ff;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  font-family: 'DIN Alternate', 'Arial Black', sans-serif;
}

.weight-card .main-value .unit {
  font-size: 32px;
  color: #5a9fd4;
  margin-left: 4px;
}

.weight-card .divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(64, 156, 255, 0.4), transparent);
  margin-bottom: 12px;
}
</style>
