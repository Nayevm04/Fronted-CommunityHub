import { defineStore } from 'pinia'
import type { FavoriteItem } from '~/types/models'

// Store de favoritos del usuario autenticado: marcar, quitar y consultar "Mis favoritos"
export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: [] as FavoriteItem[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isFavorite: (state) => (eventId: string) =>
      state.favorites.some((f) => f.event?._id === eventId),
  },

  actions: {
    async fetchMyFavorites() {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const data = await apiFetch<{ favorites: FavoriteItem[] }>('/users/me/favorites')
        this.favorites = data.favorites
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudieron cargar tus favoritos')
      } finally {
        this.loading = false
      }
    },

    async addFavorite(eventId: string) {
      const { apiFetch } = useApi()
      this.error = null
      try {
        await apiFetch(`/events/${eventId}/favorite`, { method: 'POST' })
        await this.fetchMyFavorites()
        return true
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudo agregar a favoritos')
        return false
      }
    },

    async removeFavorite(eventId: string) {
      const { apiFetch } = useApi()
      this.error = null
      try {
        await apiFetch(`/events/${eventId}/favorite`, { method: 'DELETE' })
        this.favorites = this.favorites.filter((f) => f.event?._id !== eventId)
        return true
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudo quitar de favoritos')
        return false
      }
    },
  },
})
