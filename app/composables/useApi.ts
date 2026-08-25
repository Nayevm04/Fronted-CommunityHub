// Wrapper de $fetch: agrega la URL base del backend y el token JWT automaticamente.
export const useApi = () => {
  const config = useRuntimeConfig()
  const tokenCookie = useCookie<string | null>('chub_token')

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      // Offline solo se permite consultar actividades, porque esas respuestas estan cacheadas por la PWA.
      const method = (options.method ?? 'GET').toString().toUpperCase()
      if (import.meta.client && !navigator.onLine) {
        const path = request.toString()
        const canUseOfflineCache = method === 'GET' && path.startsWith('/events')

        if (canUseOfflineCache) return

        const offlineError = new Error('Sin conexión') as Error & { data?: { message: string } }
        offlineError.data = {
          message:
            method === 'GET'
              ? 'Esta información no está disponible sin conexión.'
              : 'Necesitás conexión a internet para realizar esta acción.',
        }
        throw offlineError
      }

      if (tokenCookie.value) {
        options.headers.set('Authorization', `Bearer ${tokenCookie.value}`)
      }
    },
    // Si el backend dice que el token ya no es valido, se limpia la sesion local
    onResponseError({ response }) {
      if (response.status === 401 && tokenCookie.value) {
        tokenCookie.value = null
        const authStore = useAuthStore()
        authStore.user = null
        authStore.token = null
        navigateTo('/login')
      }
    },
  })

  return { apiFetch }
}
