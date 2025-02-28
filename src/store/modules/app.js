import { defineStore } from 'pinia'
import Cookies from 'js-cookie'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebar: {
      opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true
    }
  }),
  
  actions: {
    toggleSidebar() {
      this.sidebar.opened = !this.sidebar.opened
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
    }
  }
}) 