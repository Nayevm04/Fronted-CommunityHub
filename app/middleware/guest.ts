// Para login/registro: si ya hay sesion activa, no tiene sentido mostrar el formulario.
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
