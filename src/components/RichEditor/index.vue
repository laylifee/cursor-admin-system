<template>
  <div class="rich-editor-container">
    <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" class="editor-toolbar" />
    <Editor
      v-model="editorValue"
      :defaultConfig="editorConfig"
      class="editor-content"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  // 编辑器配置
  config: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

// 编辑器实例
const editorRef = ref(null)
const editorValue = ref(props.modelValue)

// 工具栏配置
const toolbarConfig = {
  excludeKeys: ['fullScreen'] // 排除不需要的菜单
}

// 编辑器配置
const editorConfig = ref({
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: import.meta.env.VITE_APP_UPLOAD_URL, // 使用环境变量中的上传地址
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5M
      allowedFileTypes: ['image/*'],
      customInsert(res, insertFn) {
        // 处理上传结果
        if (res.code === 0) {
          insertFn(res.data.url)
        }
      }
    }
  },
  ...props.config
})

// 创建编辑器回调
const handleCreated = (editor) => {
  editorRef.value = editor
}

// 监听内容变化
watch(editorValue, (newVal) => {
  emit('update:modelValue', newVal)
})

// 组件销毁时销毁编辑器
onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy()
    editorRef.value = null
  }
})
</script>

<style scoped>
.rich-editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.editor-toolbar {
  border-bottom: 1px solid #dcdfe6;
}

.editor-content {
  height: 500px;
  overflow-y: hidden;
}
</style>
