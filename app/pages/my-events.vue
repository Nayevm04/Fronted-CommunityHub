<script setup lang="ts">
import type { EventItem } from '~/types/models'

definePageMeta({ middleware: 'organizer' })

const authStore = useAuthStore()
const { apiFetch } = useApi()

const { data, pending, refresh } = await useAsyncData('my-events', () =>
  apiFetch<{ events: EventItem[] }>('/events', {
    query: { organizer: authStore.user?._id },
  })
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
  <div class="my-events-page">
    <div class="card card-header-flex">
      <div>
        <h1 style="margin-bottom: 0.25rem;">Mis Actividades</h1>
        <p style="margin-bottom: 0; color: var(--text-muted); font-size: 0.9rem;">
          Gestioná los eventos comunitarios que organizás
        </p>
      </div>
      <NuxtLink class="btn" to="/events/create">+ Nueva actividad</NuxtLink>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="pending" class="state-container">
      <div class="spinner"></div>
      <p>Cargando tus actividades...</p>
    </div>

    <div v-else-if="!data?.events.length" class="empty-state card">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3>Todavía no creaste ninguna actividad</h3>
      <p>Comenzá creando tu primera actividad para convocar a la comunidad.</p>
      <NuxtLink class="btn" to="/events/create" style="margin-top: 1rem;">Crear primera actividad</NuxtLink>
    </div>

    <div v-else class="grid-cards">
      <div v-for="event in data?.events" :key="event._id" class="card my-event-card">
        <div class="my-event-header">
          <h2 class="my-event-title">{{ event.title }}</h2>
          <span class="badge" :class="`badge-status--${event.status}`">{{ getStatusLabel(event.status) }}</span>
        </div>

        <div class="my-event-meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{{ formatEventDate(event.date) }} — {{ event.hour }} HS</span>
        </div>

        <div class="my-event-actions">
          <NuxtLink
            v-if="event.status !== 'completed'"
            class="btn btn-secondary btn-sm"
            :to="`/events/${event._id}/edit`"
          >
            Editar
          </NuxtLink>
          <button class="btn btn-danger btn-sm" @click="askDelete(event)">Eliminar</button>
        </div>
      </div>
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
.my-events-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.my-event-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.my-event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.my-event-title {
  font-size: 1.15rem;
  margin: 0;
}

.my-event-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.my-event-meta svg {
  width: 16px;
  height: 16px;
  color: var(--primary);
}

.my-event-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
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

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.empty-icon svg {
  width: 30px;
  height: 30px;
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
