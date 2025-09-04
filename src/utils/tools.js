import { nextTick } from 'vue'

/** @param {string} str - 要转换的字符串 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**本项目计算表格高度的方法 */
export const calculateTableHeight = () => {
  return new Promise((resolve) => {
    nextTick(() => {
      const appContainer = document.querySelector('.app-container')
      const searchContainer = document.querySelector('.search-container')
      const tableHeader = document.querySelector('.table-header')
      const paginationContainer = document.querySelector('.pagination-container')
      const tableContainer = document.querySelector('.table-content')

      if (appContainer) {
        console.log('paginationContainer', paginationContainer)
        const appContainerHeight = appContainer.clientHeight
        const searchContainerHeight = searchContainer ? searchContainer.clientHeight : 0
        const tableHeaderHeight = tableHeader ? tableHeader.clientHeight : 0
        const paginationContainerHeight = paginationContainer
          ? paginationContainer.clientHeight
          : -60

        // 计算表格高度，留出一些边距，并确保表格内容完整显示
        // 减少边距，确保最后一行不被遮挡
        let height =
          appContainerHeight -
          searchContainerHeight -
          tableHeaderHeight -
          paginationContainerHeight -
          52
        console.log('height', height)
        // 优化：当窗口缩小时，考虑实际的tableContainer高度，防止计算高度大于实际可用空间
        if (tableContainer && tableContainer.parentElement) {
          const parentHeight = tableContainer.parentElement.clientHeight
          // 确保计算的高度不超过父容器的可用空间（减去header）
          if (tableHeader) {
            let availableHeight = parentHeight - tableHeaderHeight - 60 // 40为额外边距
            if (!paginationContainer) {
              availableHeight = availableHeight + 45
            }
            height = availableHeight
          }
        }

        console.log(
          '计算高度:',
          height,
          'tableContainer.clientHeight:',
          tableContainer?.clientHeight || 'N/A'
        )
        resolve(`${Math.max(100, height)}`) // 确保最小高度为100px
      } else {
        // 如果找不到容器，返回默认高度
        resolve('calc(100vh - 200px)')
      }
    })
  })
}
