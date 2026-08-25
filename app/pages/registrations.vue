<script setup lang="ts">
import type { RegistrationDetailItem } from '~/types/models'

definePageMeta({ middleware: 'event-manager' })

const authStore = useAuthStore()
const { apiFetch } = useApi()
const { isOnline } = useNetworkStatus()
const offlineMessage = 'Esta sección no está disponible sin conexión a Internet.'

const { data, pending, error, refresh } = await useAsyncData('registrations', () => {
  if (import.meta.client && !isOnline.value) return null
  return apiFetch<{ registrations: RegistrationDetailItem[] }>('/registrations')
})

if (import.meta.client) {
  watch(isOnline, (online) => {
    if (online) refresh()
  })
}
</script>

<template>
  <div class="registrations-page">
    <div class="card card-header-flex">
      <div>
        <h1 style="margin-bottom: 0.25rem;">Inscripciones</h1>
        <p style="margin-bottom: 0; color: var(--text-muted); font-size: 0.9rem;">
          {{
            authStore.isAdmin
              ? 'Todas las inscripciones registradas en CommunityHub'
              : 'Participantes inscritos en tus actividades'
          }}
        </p>
      </div>
    </div>

    <div v-if="pending" class="state-container">
      <div class="spinner"></div>
      <p>Cargando inscripciones...</p>
    </div>
    <div v-else-if="!isOnline" class="error-message">
      {{ offlineMessage }}
    </div>
    <div v-else-if="error" class="error-message">
      No se pudieron cargar las inscripciones
    </div>
    <div v-else-if="!data?.registrations.length" class="empty-state card">
      <h3>Todavía no hay inscripciones</h3>
      <p>{{ authStore.isAdmin ? 'Ninguna actividad tiene participantes inscritos.' : 'Tus actividades todavía no tienen participantes inscritos.' }}</p>
    </div>

    <div v-else class="table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Actividad</th>
            <th v-if="authStore.isAdmin">Organizador</th>
            <th>Participante</th>
            <th>Correo Electrónico</th>
            <th>Fecha de inscripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="registration in data?.registrations" :key="registration._id">
            <td>
              <NuxtLink
                v-if="registration.event"
                :to="`/events/${registration.event._id}`"
                class="event-title-link"
              >
                <strong>{{ registration.event.title }}</strong>
              </NuxtLink>
            </td>
            <td v-if="authStore.isAdmin">
              <span class="organizer-name">
                {{ registration.event?.organizer?.firstName }} {{ registration.event?.organizer?.lastName }}
              </span>
            </td>
            <td>{{ registration.user?.firstName }} {{ registration.user?.lastName }}</td>
            <td><span class="user-email">{{ registration.user?.email }}</span></td>
            <td>
              <span class="event-date">
                {{ new Date(registration.createdAt).toLocaleDateString() }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.registrations-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-surface);
}

.modern-table th,
.modern-table td {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.modern-table th {
  background: var(--bg-muted);
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-title-link {
  color: var(--text-main);
  text-decoration: none;
}

.event-title-link:hover {
  color: var(--primary);
}

.organizer-name,
.event-date {
  color: var(--text-muted);
}

.user-email {
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
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
