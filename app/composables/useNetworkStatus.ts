// Los listeners se registran una sola vez, solo en cliente (SSR no tiene navigator)
const isOnline = ref(true)
const justReconnected = ref(false)
let initialized = false
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

export const useNetworkStatus = () => {
  if (import.meta.client && !initialized) {
    initialized = true
    isOnline.value = navigator.onLine

    window.addEventListener('online', () => {
      isOnline.value = true
      justReconnected.value = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(() => {
        justReconnected.value = false
      }, 4000)
    })

    window.addEventListener('offline', () => {
      isOnline.value = false
      justReconnected.value = false
    })
  }

  return { isOnline, justReconnected }
}
