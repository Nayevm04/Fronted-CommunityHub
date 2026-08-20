<script setup lang="ts">
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    notificationsStore.fetchNotifications()
  }
})
</script>

<template>
  <header class="header">
    <nav class="nav">
      <NuxtLink to="/" class="brand">CommunityHub</NuxtLink>
      <NuxtLink to="/events">Actividades</NuxtLink>

      <template v-if="authStore.isAuthenticated">
        <NuxtLink v-if="authStore.isOrganizer" to="/my-events"> Mis actividades </NuxtLink>
        <NuxtLink v-if="authStore.isAdmin" to="/admin/users"> Usuarios </NuxtLink>
        <NuxtLink v-if="authStore.isAdmin" to="/admin/events"> Todas las actividades </NuxtLink>
        <NuxtLink v-if="authStore.isAdmin" to="/admin/categories"> Categorías </NuxtLink>
        <NuxtLink to="/notifications">
          Notificaciones
          <span v-if="notificationsStore.unreadCount > 0" class="badge">{{ notificationsStore.unreadCount }}</span>
        </NuxtLink>
        <NuxtLink to="/profile">Perfil</NuxtLink>
        <span class="badge">{{ authStore.role }}</span>
        <button class="btn btn-secondary" @click="handleLogout">Cerrar sesion</button>
      </template>
      <template v-else>
        <NuxtLink to="/login">Ingresar</NuxtLink>
        <NuxtLink to="/register">Registrarse</NuxtLink>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.header {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}
.nav {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.brand {
  font-weight: bold;
  margin-right: auto;
  text-decoration: none;
}
.nav a {
  text-decoration: none;
}
</style>
