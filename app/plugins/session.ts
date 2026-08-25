// Al iniciar la app, si hay un token guardado en cookie, se recupera la sesion
// consultando GET /api/auth/me. Asi la sesion sobrevive a un F5.
export default defineNuxtPlugin(async () => {
  const tokenCookie = useCookie<string | null>('chub_token')
  const authStore = useAuthStore()

  if (tokenCookie.value && !authStore.user) {
    authStore.token = tokenCookie.value

    if (import.meta.client && !navigator.onLine) {
      window.addEventListener('online', () => authStore.fetchCurrentUser(), { once: true })
      return
    }

    await authStore.fetchCurrentUser()
  }
})
