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
    <div class="header-inner">
      <NuxtLink to="/" class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="6" r="3" fill="currentColor" />
            <circle cx="6" cy="16" r="3" fill="currentColor" />
            <circle cx="18" cy="16" r="3" fill="currentColor" />
            <path d="M12 9V12M12 12L8.5 14M12 12L15.5 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <span class="brand-title">Community<span class="brand-accent">Hub</span></span>
      </NuxtLink>

      <nav class="nav">
        <NuxtLink to="/events" class="nav-link">Actividades</NuxtLink>

        <template v-if="authStore.isAuthenticated">
          <NuxtLink v-if="authStore.isOrganizer" to="/my-events" class="nav-link">
            Mis actividades
          </NuxtLink>
          <NuxtLink v-if="authStore.isAdmin" to="/admin/users" class="nav-link">
            Usuarios
          </NuxtLink>
          <NuxtLink v-if="authStore.isAdmin" to="/admin/events" class="nav-link">
            Todas las actividades
          </NuxtLink>
          <NuxtLink v-if="authStore.isAdmin" to="/admin/categories" class="nav-link">
            Categorías
          </NuxtLink>
          <NuxtLink to="/notifications" class="nav-link nav-link--notifications">
            Notificaciones
            <span v-if="notificationsStore.unreadCount > 0" class="badge-dot">{{ notificationsStore.unreadCount }}</span>
          </NuxtLink>
          <NuxtLink to="/profile" class="nav-link">Perfil</NuxtLink>
          <span class="role-badge" :class="`role-badge--${authStore.role}`">{{ authStore.role }}</span>
          <button class="btn btn-secondary btn-sm" @click="handleLogout">Cerrar sesion</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="nav-link">Ingresar</NuxtLink>
          <NuxtLink to="/register" class="btn btn-sm">Registrarse</NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.header-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-shadow: 0 2px 5px rgba(79, 70, 229, 0.3);
}

.brand-icon svg {
  width: 100%;
  height: 100%;
}

.brand-accent {
  color: var(--primary);
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-link {
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
}

.nav-link:hover {
  color: var(--primary);
  background-color: var(--primary-subtle);
}

.nav-link.router-link-active {
  color: var(--primary);
  background-color: var(--primary-light);
}

.nav-link--notifications {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.badge-dot {
  background: var(--accent);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  line-height: 1;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full);
  font-size: 0.725rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--bg-muted);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.role-badge--admin {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.role-badge--organizer {
  background: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.role-badge--user {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

@media (max-width: 768px) {
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }
  .nav {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }
}
</style>
