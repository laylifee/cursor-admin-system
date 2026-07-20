/**
 * SPA 部署后资源加载失败自动恢复方案
 *
 * 解决问题：Vue3/Vite 项目发版后，不刷新浏览器点击路由白屏
 * 原因：浏览器内存中的旧 JS 尝试动态 import 已被删除的旧 chunk → 404
 *
 * 使用方式：在 src/main.js 最顶部引入此文件
 *    import './utils/spa-recovery'
 */

const RELOAD_FLAG = '__spa_reload_after_deploy'
const CHUNK_FAIL_PATTERN = /Failed to fetch dynamically|Loading chunk|Loading CSS chunk/i

// ============================================
// 第一层防护：拦截静态资源加载失败（SCRIPT / LINK 标签）
// 覆盖 .js / .mjs / .css 等所有格式
// ============================================
window.addEventListener('error', (event) => {
  const target = event.target
  if (!target) return

  const tagName = target.tagName?.toUpperCase()

  // 匹配所有可能加载 JS/CSS 的标签
  const isScript = tagName === 'SCRIPT'
  const isLink = tagName === 'LINK' && target.rel === 'stylesheet'

  if (isScript || isLink) {
    const src = target.src || target.href || ''

    // 只拦截自己的静态资源（排除第三方 CDN、chrome 扩展等）
    const isOwnAsset = src.includes(window.location.hostname) || src.startsWith('/')
    if (!isOwnAsset) return

    console.warn('[SPA-Recovery] 资源加载失败:', src)

    // ⚡ 立即触发刷新，不等后续事件
    forceReload()
  }
}, true) // capture 阶段，确保最先拦截


// ============================================
// 第二层防护：拦截动态 import() 失败（Promise rejection）
// 这是 Vue Router 懒加载失败的主战场
// ============================================
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason || {}
  const msg = reason.message ?? ''
  const stack = reason.stack ?? ''

  // 匹配动态 import 失败的特征信息
  const isChunkFail = CHUNK_FAIL_PATTERN.test(msg)
  const isLoadingError = msg.includes('Failed to fetch') || msg.includes('Loading')
  const hasMjsStack = stack.includes('.mjs') || stack.includes('.js')

  if (isChunkFail || (isLoadingError && hasMjsStack)) {
    console.warn('[SPA-Recovery] 动态 import 失败:', msg)

    // 阻止默认的错误输出（控制台还是会显示，但不会触发未处理 Promise 警告）
    event.preventDefault()

    // ⚡ 立即触发刷新
    forceReload()
  }
})


// ============================================
// 第三层防护：拦截 Vue Router 导航失败
// 在路由跳转后如果页面内容没有渲染，也触发刷新
// ============================================
let _routerErrorTriggered = false
window.addEventListener('error', (event) => {
  // 这个是普通 JS 错误（非资源加载错误），通过 ErrorEvent 区分
  if (!event.error && !event.message) return // 资源加载错误没有 error 属性，跳过（第一层已处理）

  const msg = event.message ?? ''
  if (
    msg.includes('Loading chunk') ||
    msg.includes('dynamically imported') ||
    msg.includes('Failed to fetch')
  ) {
    console.warn('[SPA-Recovery] 路由加载错误:', msg)
    if (!_routerErrorTriggered) {
      _routerErrorTriggered = true
      forceReload()
    }
  }
})


// ============================================
// 核心刷新逻辑：带防抖 + 强制绕过缓存
// ============================================
function forceReload() {
  // 防重入检查
  if (sessionStorage.getItem(RELOAD_FLAG)) return

  // 设置标志位
  sessionStorage.setItem(RELOAD_FLAG, '1')
  console.warn('[SPA-Recovery] 检测到版本不一致，2秒后强制刷新...')

  // 延迟一小段时间让日志打完，然后刷新
  setTimeout(() => {
    // 用 location.href 赋值代替 reload()，更可靠
    // 加时间戳确保绕过所有缓存
    const url = window.location.href.split('#')[0]
    window.location.href = url + '?_t=' + Date.now() + window.location.hash
  }, 2000) // 2秒延迟，给用户看到提示的时间
}


// ============================================
// 页面加载成功后清除标志位
// （如果用户正常访问了页面说明已经恢复了）
// ============================================
window.addEventListener('load', () => {
  // 延迟清除，确保页面真的加载完了
  setTimeout(() => {
    sessionStorage.removeItem(RELOAD_FLAG)
  }, 3000)
})


console.info(
  '%c[SPA-Recovery] %c部署热更新守护已启用',
  'color: #1890ff; font-weight: bold;',
  'color: #666;'
)
