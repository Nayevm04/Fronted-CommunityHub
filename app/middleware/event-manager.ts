// Editar actividad: organizer o admin. El chequeo de "es el dueno" lo hace el backend.
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!authStore.isOrganizer && !authStore.isAdmin) {
    return navigateTo('/')
  }
})
