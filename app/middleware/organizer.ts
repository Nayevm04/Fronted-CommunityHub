// "Mis actividades" es solo del organizer. El admin usa /admin/events.
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!authStore.isOrganizer) {
    return navigateTo('/')
  }
})
