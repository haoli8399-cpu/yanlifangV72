import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const statusBarHeight = ref(0)
  const navBarHeight = ref(44)
  const safeAreaBottom = ref(0)
  const systemInfo = ref<UniApp.GetSystemInfoResult | null>(null)

  function initSystemInfo() {
    const info = uni.getSystemInfoSync()
    systemInfo.value = info
    statusBarHeight.value = info.statusBarHeight || 0
    safeAreaBottom.value = info.safeAreaInsets?.bottom || 0
    // WeChat nav bar = status bar + 44px
    navBarHeight.value = statusBarHeight.value + 44
  }

  return {
    statusBarHeight,
    navBarHeight,
    safeAreaBottom,
    systemInfo,
    initSystemInfo,
  }
})
