import { defineStore } from 'pinia'

export type UserRole = 'user' | 'organizer' | 'admin'

export interface AuthUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  profileImage: string | null
  role: UserRole
}

interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  profileImage?: string
}

interface LoginPayload {
  email: string
  password: string
}

// Store centralizado de autenticacion. Ninguna pagina debe duplicar esta logica.
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    token: null as string | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role ?? null,
    isAdmin: (state) => state.user?.role === 'admin',
    isOrganizer: (state) => state.user?.role === 'organizer',
    isUser: (state) => state.user?.role === 'user',
  },

  actions: {
    async register(payload: RegisterPayload) {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const data = await apiFetch<{ user: AuthUser; token: string }>('/auth/register', {
          method: 'POST',
          body: payload,
        })
        this.setSession(data.user, data.token)
      } catch (error) {
        this.error = getErrorMessage(error, 'No se pudo completar el registro')
      } finally {
        this.loading = false
      }
    },

    async login(payload: LoginPayload) {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const data = await apiFetch<{ user: AuthUser; token: string }>('/auth/login', {
          method: 'POST',
          body: payload,
        })
        this.setSession(data.user, data.token)
      } catch (error) {
        this.error = getErrorMessage(error, 'Correo o contraseña incorrectos')
      } finally {
        this.loading = false
      }
    },

    // Recupera la sesion consultando /api/auth/me con el token guardado
    async fetchCurrentUser() {
      if (!this.token) return
      const { apiFetch } = useApi()
      try {
        const data = await apiFetch<{ user: AuthUser }>('/auth/me')
        this.user = data.user
      } catch {
        this.clearSession()
      }
    },

    async logout() {
      const { apiFetch } = useApi()
      try {
        await apiFetch('/auth/logout', { method: 'POST' })
      } finally {
        this.clearSession()
      }
    },

    setSession(user: AuthUser, token: string) {
      this.user = user
      this.token = token
      this.error = null
      const tokenCookie = useCookie<string | null>('chub_token', { maxAge: 60 * 60 * 24 * 7 })
      tokenCookie.value = token
    },

    clearSession() {
      this.user = null
      this.token = null
      const tokenCookie = useCookie<string | null>('chub_token')
      tokenCookie.value = null
    },
  },
})
