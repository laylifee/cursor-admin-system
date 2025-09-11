<template>
  <div class="icon-selector">
    <el-input
      v-model="selectedIcon"
      placeholder="请选择图标"
      readonly
      @click="dialogVisible = true"
    >
      <template #prefix>
        <el-icon v-if="selectedIcon">
          <component :is="selectedIcon" />
        </el-icon>
      </template>
    </el-input>

    <el-dialog v-model="dialogVisible" title="选择图标" width="800px">
      <div class="icon-grid">
        <div
          v-for="icon in icons"
          :key="icon"
          class="icon-item"
          :class="{ active: selectedIcon === icon, select: tempSelectedIcon === icon }"
          @click="selectIcon(icon)"
        >
          <el-icon>
            <component :is="icon" />
          </el-icon>
          <div class="icon-name">{{ icon }}</div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSelection">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = ref(false)
const selectedIcon = ref(props.modelValue)
const tempSelectedIcon = ref('')

// 获取所有图标名称
const icons = Object.keys(ElementPlusIconsVue)

// 添加监听器同步props变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== selectedIcon.value) {
      selectedIcon.value = newValue || ''
    }
  }
)

const selectIcon = (icon) => {
  console.log('选择图标', icon)
  if (icon === selectedIcon.value) return
  tempSelectedIcon.value = icon
}

const confirmSelection = () => {
  selectedIcon.value = tempSelectedIcon.value || ''
  emit('update:modelValue', selectedIcon.value)
  dialogVisible.value = false
  tempSelectedIcon.value = ''
}
</script>

<style scoped>
.icon-selector {
  display: inline-block;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-item:hover {
  background-color: #f5f7fa;
}

.icon-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}
.icon-item.select {
  border-color: #12e2a4;
  background-color: #ecf5ff;
}

.icon-name {
  margin-top: 5px;
  font-size: 12px;
  text-align: center;
  word-break: break-all;
}
</style>
