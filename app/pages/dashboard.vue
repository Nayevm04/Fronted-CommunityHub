<script setup lang="ts">
import type { DashboardData } from '~/types/models'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { apiFetch } = useApi()
const { isOnline } = useNetworkStatus()
const offlineMessage = 'Esta sección no está disponible sin conexión a Internet.'

const { data, pending, error, refresh } = await useAsyncData('dashboard', () => {
  if (import.meta.client && !isOnline.value) return null
  return apiFetch<DashboardData>('/dashboard')
})

if (import.meta.client) {
  watch(isOnline, (online) => {
    if (online) refresh()
  })
}
</script>

<template>
  <div class="dashboard-page">
    <div class="card card-header-flex">
      <div>
        <h1 style="margin-bottom: 0.25rem;">Dashboard</h1>
        <p style="margin-bottom: 0; color: var(--text-muted); font-size: 0.9rem;">
          Resumen de tu actividad en CommunityHub, {{ authStore.user?.firstName }}
        </p>
      </div>
    </div>

    <div v-if="pending" class="state-container">
      <div class="spinner"></div>
      <p>Cargando dashboard...</p>
    </div>
    <div v-else-if="!isOnline" class="error-message">
      {{ offlineMessage }}
    </div>
    <div v-else-if="error" class="error-message">
      No se pudo cargar el dashboard
    </div>

    <!-- Dashboard de usuario -->
    <template v-else-if="data?.role === 'user'">
      <div class="stats-grid">
        <NuxtLink class="card stat-tile card-interactive" to="/my-registrations">
          <span class="stat-value">{{ data.registrationsCount }}</span>
          <span class="stat-label">Inscripciones</span>
        </NuxtLink>
        <NuxtLink class="card stat-tile card-interactive" to="/my-favorites">
          <span class="stat-value">{{ data.favoritesCount }}</span>
          <span class="stat-label">Favoritos</span>
        </NuxtLink>
      </div>

      <div class="quick-links">
        <NuxtLink class="btn btn-secondary btn-sm" to="/my-registrations">Ver mis inscripciones</NuxtLink>
        <NuxtLink class="btn btn-secondary btn-sm" to="/my-favorites">Ver mis favoritos</NuxtLink>
        <NuxtLink class="btn btn-secondary btn-sm" to="/notifications">Ver notificaciones</NuxtLink>
      </div>

      <div class="card section-card">
        <h2>Próximas actividades</h2>
        <div v-if="!data.upcomingRegistrations.length" class="empty-inline">
          No tenés actividades próximas. <NuxtLink to="/events">Explorá actividades</NuxtLink>
        </div>
        <div v-else class="upcoming-list">
          <NuxtLink
            v-for="registration in data.upcomingRegistrations"
            :key="registration._id"
            class="upcoming-item"
            :to="`/events/${registration.event?._id}`"
          >
            <span class="upcoming-title">{{ registration.event?.title }}</span>
            <span class="upcoming-meta">
              {{ registration.event ? formatEventDate(registration.event.date) : '' }} — {{ registration.event?.hour }} HS
            </span>
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Dashboard de organizador -->
    <template v-else-if="data?.role === 'organizer'">
      <div class="stats-grid">
        <NuxtLink class="card stat-tile card-interactive" to="/my-events">
          <span class="stat-value">{{ data.totalEvents }}</span>
          <span class="stat-label">Actividades creadas</span>
        </NuxtLink>
        <NuxtLink class="card stat-tile card-interactive" to="/my-events">
          <span class="stat-value">{{ data.activeEvents }}</span>
          <span class="stat-label">Actividades activas</span>
        </NuxtLink>
        <NuxtLink class="card stat-tile card-interactive" to="/registrations">
          <span class="stat-value">{{ data.totalRegistrations }}</span>
          <span class="stat-label">Inscripciones totales</span>
        </NuxtLink>
      </div>

      <div class="card section-card">
        <h2>Tus actividades</h2>
        <div v-if="!data.events.length" class="empty-inline">
          Todavía no creaste ninguna actividad. <NuxtLink to="/events/create">Crear actividad</NuxtLink>
        </div>
        <div v-else class="events-table">
          <div v-for="event in data.events" :key="event._id" class="events-table-row">
            <div class="events-table-main">
              <span class="events-table-title">{{ event.title }}</span>
              <span class="badge" :class="`badge-status--${event.status}`">{{ getStatusLabel(event.status) }}</span>
            </div>
            <span class="events-table-meta">{{ formatEventDate(event.date) }} — {{ event.hour }} HS</span>
            <span class="events-table-meta">
              {{ event.registeredCount ?? 0 }} / {{ event.capacity }} inscritos
              — {{ Math.max(event.capacity - (event.registeredCount ?? 0), 0) }} disponibles
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Dashboard de administrador -->
    <template v-else-if="data?.role === 'admin'">
      <div class="stats-grid">
        <NuxtLink class="card stat-tile card-interactive" to="/admin/users">
          <span class="stat-value">{{ data.totalUsers }}</span>
          <span class="stat-label">Usuarios registrados</span>
        </NuxtLink>
        <NuxtLink class="card stat-tile card-interactive" to="/admin/users">
          <span class="stat-value">{{ data.totalOrganizers }}</span>
          <span class="stat-label">Organizadores</span>
        </NuxtLink>
        <NuxtLink class="card stat-tile card-interactive" to="/admin/events">
          <span class="stat-value">{{ data.totalEvents }}</span>
          <span class="stat-label">Actividades</span>
        </NuxtLink>
        <NuxtLink class="card stat-tile card-interactive" to="/registrations">
          <span class="stat-value">{{ data.totalRegistrations }}</span>
          <span class="stat-label">Inscripciones</span>
        </NuxtLink>
      </div>

      <div class="card section-card">
        <h2>Actividades por estado</h2>
        <div class="status-breakdown">
          <span class="badge badge-status--active">Activas: {{ data.eventsByStatus.active }}</span>
          <span class="badge badge-status--finished">Finalizadas: {{ data.eventsByStatus.completed }}</span>
          <span class="badge badge-status--cancelled">Canceladas: {{ data.eventsByStatus.cancelled }}</span>
        </div>
      </div>

      <div class="quick-links">
        <NuxtLink class="btn btn-secondary btn-sm" to="/admin/users">Gestionar usuarios</NuxtLink>
        <NuxtLink class="btn btn-secondary btn-sm" to="/admin/events">Gestionar actividades</NuxtLink>
        <NuxtLink class="btn btn-secondary btn-sm" to="/admin/categories">Gestionar categorías</NuxtLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-tile {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: center;
  text-align: center;
  padding: 1.5rem 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.quick-links {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.section-card h2 {
  margin-bottom: 1rem;
}

.empty-inline {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upcoming-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
}

.upcoming-item:hover {
  border-color: var(--primary);
  background: var(--primary-subtle);
}

.upcoming-title {
  font-weight: 700;
}

.upcoming-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.events-table {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.events-table-row {
  padding: 0.85rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.events-table-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.events-table-title {
  font-weight: 700;
}

.events-table-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.status-breakdown {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.badge-status--active,
.badge-status--activa {
  background: var(--status-active-bg);
  color: var(--status-active-text);
  border-color: var(--status-active-border);
}

.badge-status--cancelled,
.badge-status--cancelada {
  background: var(--status-danger-bg);
  color: var(--status-danger-text);
  border-color: var(--status-danger-border);
}

.badge-status--finished,
.badge-status--finalizada {
  background: var(--status-muted-bg);
  color: var(--status-muted-text);
  border-color: var(--status-muted-border);
}

.state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-muted);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
