import { defineStore } from 'pinia'

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [],
    cachedViews: []
  }),
  getters: {
    affixTags: (state) => {
      return state.visitedViews.filter((tag) => tag.meta && tag.meta.affix)
    }
  },
  actions: {
    addView(view) {
      this.addVisitedView(view)
      this.addCachedView(view)
    },
    addVisitedView(view) {
      if (this.visitedViews.some((v) => v.path === view.path)) return

      if (view.meta && view.meta.affix) {
        this.visitedViews.unshift(
          Object.assign({}, view, {
            title: view.meta.title || 'no-name'
          })
        )
      } else {
        this.visitedViews.push(
          Object.assign({}, view, {
            title: view.meta.title || 'no-name'
          })
        )
      }
    },
    addCachedView(view) {
      if (this.cachedViews.includes(view.name)) return
      if (view.meta && !view.meta.keepAlive) {
        this.cachedViews.push(view.name)
      }
    },
    delView(view) {
      return new Promise((resolve) => {
        this.delVisitedView(view)
        this.delCachedView(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },
    delVisitedView(view) {
      for (const [i, v] of this.visitedViews.entries()) {
        if (v.path === view.path) {
          this.visitedViews.splice(i, 1)
          break
        }
      }
    },
    delCachedView(view) {
      const index = this.cachedViews.indexOf(view.name)
      index > -1 && this.cachedViews.splice(index, 1)
    },
    delOtherViews(view) {
      return new Promise((resolve) => {
        this.delOtherVisitedViews(view)
        this.delOtherCachedViews(view)
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },
    delOtherVisitedViews(view) {
      this.visitedViews = this.visitedViews.filter((v) => {
        return (v.meta && v.meta.affix) || v.path === view.path
      })
    },
    delOtherCachedViews(view) {
      const index = this.cachedViews.indexOf(view.name)
      if (index > -1) {
        this.cachedViews = this.cachedViews.slice(index, index + 1)
      } else {
        this.cachedViews = []
      }
    },
    delAllViews() {
      return new Promise((resolve) => {
        this.delAllVisitedViews()
        this.delAllCachedViews()
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        })
      })
    },
    delAllVisitedViews() {
      // 保留固定的标签
      this.visitedViews = this.visitedViews.filter((tag) => tag.meta && tag.meta.affix)
    },
    delAllCachedViews() {
      this.cachedViews = []
    },
    updateVisitedView(view) {
      for (let v of this.visitedViews) {
        if (v.path === view.path) {
          v = Object.assign(v, view)
          break
        }
      }
    },
    addAffixTags() {
      // 这个方法应该由路由配置中的固定标签来初始化
      // 实际项目中，可能需要从路由配置中获取所有带有affix: true的路由
      // 这里只是一个示例
      const affixTags = [
        {
          path: '/dashboard',
          meta: { title: '首页', affix: true }
        }
      ]

      for (const tag of affixTags) {
        if (tag.name) {
          this.addVisitedView(tag)
          this.addCachedView(tag)
        }
      }
    }
  }
})
