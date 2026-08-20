import { defineStore } from 'pinia'
import type { NotificationItem } from '~/types/models'

// Store de notificaciones (generadas por la Lambda de recordatorios, consultadas via el backend)
export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as NotificationItem[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.read).length,
  },

  actions: {
    async fetchNotifications() {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const data = await apiFetch<{ notifications: NotificationItem[] }>('/notifications')
        this.notifications = data.notifications
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudieron cargar las notificaciones')
      } finally {
        this.loading = false
      }
    },

    async markAsRead(id: string) {
      const { apiFetch } = useApi()
      try {
        await apiFetch(`/notifications/${id}/read`, { method: 'PUT' })
        const notification = this.notifications.find((n) => n._id === id)
        if (notification) notification.read = true
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudo marcar la notificación como leída')
      }
    },

    async markAllAsRead() {
      const { apiFetch } = useApi()
      try {
        await apiFetch('/notifications/read-all', { method: 'PUT' })
        this.notifications.forEach((n) => {
          n.read = true
        })
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudieron marcar las notificaciones como leídas')
      }
    },
  },
})
