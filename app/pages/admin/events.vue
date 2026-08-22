<script setup lang="ts">
import type { EventItem } from '~/types/models'

definePageMeta({ middleware: 'admin' })

const { apiFetch } = useApi()

const { data, pending, refresh } = await useAsyncData('admin-events', () =>
  apiFetch<{ events: EventItem[] }>('/events')
)

const errorMessage = ref('')
const deleteTarget = ref<EventItem | null>(null)

const askDelete = (event: EventItem) => {
  deleteTarget.value = event
}

const cancelDelete = () => {
  deleteTarget.value = null
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  const id = deleteTarget.value._id
  deleteTarget.value = null
  errorMessage.value = ''
  try {
    await apiFetch(`/events/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'No se pudo eliminar la actividad')
  }
}
</script>

<template>
  <div class="admin-events-page">
    <div class="card card-header-flex">
      <div>
        <h1 style="margin-bottom: 0.25rem;">Todas las Actividades</h1>
        <p style="margin-bottom: 0; color: var(--text-muted); font-size: 0.9rem;">
          Panel de administración global de eventos de CommunityHub
        </p>
      </div>
      <NuxtLink class="btn" to="/events/create">+ Nueva actividad</NuxtLink>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="pending" class="state-container">
      <div class="spinner"></div>
      <p>Cargando actividades...</p>
    </div>

    <div v-else-if="!data?.events.length" class="empty-state card">
      <h3>No hay actividades registradas en la plataforma.</h3>
    </div>

    <div v-else class="table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Organizador</th>
            <th>Fecha y Hora</th>
            <th>Estado</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in data?.events" :key="event._id">
            <td>
              <NuxtLink :to="`/events/${event._id}`" class="event-title-link">
                <strong>{{ event.title }}</strong>
              </NuxtLink>
            </td>
            <td>
              <span class="organizer-name">
                {{ event.organizer?.firstName }} {{ event.organizer?.lastName }}
              </span>
            </td>
            <td>
              <span class="event-date">
                {{ new Date(event.date).toLocaleDateString() }} — {{ event.hour }} HS
              </span>
            </td>
            <td>
              <span class="badge" :class="`badge-status--${event.status}`">
                {{ getStatusLabel(event.status) }}
              </span>
            </td>
            <td>
              <div class="table-actions-group right">
                <NuxtLink
                  v-if="event.status !== 'completed'"
                  class="btn btn-secondary btn-sm"
                  :to="`/events/${event._id}/edit`"
                >
                  Editar
                </NuxtLink>
                <button class="btn btn-danger btn-sm" @click="askDelete(event)">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Eliminar actividad"
      :message="`¿Estás seguro de que quieres eliminar la actividad “${deleteTarget?.title}”?`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.admin-events-page {
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

.organizer-name, .event-date {
  color: var(--text-muted);
}

.table-actions-group {
  display: flex;
  gap: 0.4rem;
}

.table-actions-group.right {
  justify-content: flex-end;
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
