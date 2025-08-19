<template>
  <div class="tags-view-container" :class="{ 'is-collapse': isCollapse }">
    <div class="tags-view-wrapper" ref="tagsViewWrapper">
      <div
        class="tags-view-item"
        :class="isActive(tag) ? 'active' : ''"
        v-for="tag in visitedViews"
        :key="tag.path"
        @click="goToTag(tag)"
        @contextmenu.prevent="openContextMenu($event, tag)"
      >
        {{ tag.title }}
        <span v-if="!isAffix(tag)" class="el-icon-close" @click.stop="closeSelectedTag(tag)">
          ×
        </span>
      </div>
    </div>
    <ul
      v-show="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
    >
      <li @click="refreshSelectedTag(selectedTag)">刷新页面</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭当前</li>
      <li @click="closeOtherTags">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()
const isCollapse = inject('isCollapse')
const tagsViewWrapper = ref(null)
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const selectedTag = ref({})

// 获取已访问的视图
const visitedViews = computed(() => tagsViewStore.visitedViews)

// 判断标签是否为固定标签
const isAffix = (tag) => {
  return tag.meta && tag.meta.affix
}

// 判断标签是否为当前激活状态
const isActive = (tag) => {
  return tag.path === route.path
}

// 跳转到标签对应的路由
const goToTag = (tag) => {
  router.push(tag.path)
}

// 关闭选中的标签
const closeSelectedTag = (tag) => {
  tagsViewStore.delView(tag).then(({ visitedViews }) => {
    if (isActive(tag)) {
      toLastView(visitedViews, tag)
    }
  })
}

// 关闭其他标签
const closeOtherTags = () => {
  tagsViewStore.delOtherViews(selectedTag.value)
  contextMenuVisible.value = false
}

// 关闭所有标签
const closeAllTags = (view) => {
  tagsViewStore.delAllViews().then(({ visitedViews }) => {
    if (visitedViews.some((v) => v.path === view.path)) {
      router.push(view.path)
    } else {
      toLastView(visitedViews, view)
    }
  })
  contextMenuVisible.value = false
}

// 刷新选中的标签
const refreshSelectedTag = (view) => {
  tagsViewStore.delCachedView(view).then(() => {
    const { path } = view
    router.replace({
      path: '/redirect' + path
    })
  })
  contextMenuVisible.value = false
}

// 跳转到最后一个标签
const toLastView = (visitedViews, view) => {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    router.push(latestView.path)
  } else {
    // 如果没有标签了，跳转到首页
    if (view.name === 'Dashboard') {
      router.replace({ path: '/redirect' + view.path })
    } else {
      router.push('/')
    }
  }
}

// 打开右键菜单
const openContextMenu = (e, tag) => {
  e.preventDefault()
  contextMenuVisible.value = true
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
  selectedTag.value = tag
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
}

// 添加标签
const addTags = () => {
  const { name } = route
  if (name) {
    tagsViewStore.addView(route)
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    addTags()
    scrollToCurrentTag()
  }
)

// 滚动到当前标签
const scrollToCurrentTag = () => {
  nextTick(() => {
    const tags = tagsViewWrapper.value?.getElementsByClassName('tags-view-item')
    if (!tags) return

    for (const tag of tags) {
      if (tag.classList.contains('active')) {
        const wrapper = tagsViewWrapper.value
        const tagLeft = tag.offsetLeft
        const tagWidth = tag.offsetWidth
        const wrapperWidth = wrapper.offsetWidth
        const wrapperScrollLeft = wrapper.scrollLeft

        if (tagLeft < wrapperScrollLeft) {
          // 标签在可视区域左侧
          wrapper.scrollTo({
            left: tagLeft,
            behavior: 'smooth'
          })
        } else if (tagLeft + tagWidth > wrapperScrollLeft + wrapperWidth) {
          // 标签在可视区域右侧
          wrapper.scrollTo({
            left: tagLeft - wrapperWidth + tagWidth,
            behavior: 'smooth'
          })
        }
        break
      }
    }
  })
}

// 初始化固定标签
const initTags = () => {
  const affixTags = tagsViewStore.affixTags
  if (affixTags.length) {
    tagsViewStore.addAffixTags()
  }
}

onMounted(() => {
  initTags()
  addTags()
})

// 点击其他地方关闭右键菜单
window.addEventListener('click', closeContextMenu)
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);
  position: fixed;
  top: 48px;
  left: 210px;
  right: 0;
  overflow: hidden;
  transition: left 0.3s;
  z-index: 9;
  box-sizing: border-box;
  &.is-collapse {
    left: 64px;
  }

  .tags-view-wrapper {
    display: flex;
    height: 100%;
    overflow-x: auto;
    white-space: nowrap;
    padding: 0 16px;

    &::-webkit-scrollbar {
      height: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdcdc;
      border-radius: 2px;
    }
  }

  .tags-view-item {
    display: inline-flex;
    align-items: center;
    margin: 3px 4px 2px 0;
    height: 26px;
    line-height: 26px;
    padding: 0 8px;
    border-radius: 3px;
    font-size: 12px;
    color: #495060;
    background: #fff;
    border: 1px solid #d8dce5;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    &.active {
      background-color: #409eff;
      color: #fff;
      border-color: #409eff;

      &::before {
        content: '';
        background: #fff;
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 5px;
      }
      .el-icon-close {
        &:hover {
          background-color: rgba(255, 255, 255, 0.3);
          color: #fff;
        }
      }
    }

    .el-icon-close {
      margin-left: 5px;
      font-size: 12px;
      width: 14px;
      height: 14px;
      line-height: 14px;
      text-align: center;
      border-radius: 50%;
      transition: all 0.3s;
      &:hover {
        background-color: rgba(64, 158, 255, 1);
        color: #fff;
      }
    }
  }

  .context-menu {
    margin: 0;
    padding: 5px 0;
    background: #fff;
    z-index: 100;
    position: fixed;
    list-style-type: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;

      &:hover {
        background: #eee;
      }
    }
  }
}
</style>
