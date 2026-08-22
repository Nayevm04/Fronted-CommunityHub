import { defineStore } from 'pinia'
import type { RegistrationItem } from '~/types/models'

// Store de inscripciones del usuario autenticado: inscribirse, cancelar y consultar "Mis inscripciones"
export const useRegistrationsStore = defineStore('registrations', {
  state: () => ({
    registrations: [] as RegistrationItem[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isRegistered: (state) => (eventId: string) =>
      state.registrations.some((r) => r.event?._id === eventId),
  },

  actions: {
    async fetchMyRegistrations() {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const data = await apiFetch<{ registrations: RegistrationItem[] }>('/users/me/registrations')
        this.registrations = data.registrations
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudieron cargar tus inscripciones')
      } finally {
        this.loading = false
      }
    },

    async register(eventId: string) {
      const { apiFetch } = useApi()
      this.error = null
      try {
        await apiFetch(`/events/${eventId}/register`, { method: 'POST' })
        await this.fetchMyRegistrations()
        return true
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudo completar la inscripción')
        return false
      }
    },

    async cancelRegistration(eventId: string) {
      const { apiFetch } = useApi()
      this.error = null
      try {
        await apiFetch(`/events/${eventId}/register`, { method: 'DELETE' })
        this.registrations = this.registrations.filter((r) => r.event?._id !== eventId)
        return true
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudo cancelar la inscripción')
        return false
      }
    },
  },
})
