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
  <div>
    <div class="card" style="display: flex; justify-content: space-between; align-items: center">
      <h1>Mis actividades</h1>
      <NuxtLink class="btn" to="/events/create">+ Nueva actividad</NuxtLink>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="pending">Cargando...</p>
    <p v-else-if="!data?.events.length">Todavia no creaste ninguna actividad.</p>

    <div v-for="event in data?.events" :key="event._id" class="card">
      <h2>{{ event.title }}</h2>
      <p>
        <span class="badge">{{ getStatusLabel(event.status) }}</span>
      </p>
      <p>{{ new Date(event.date).toLocaleDateString() }} - {{ event.hour }}</p>
      <NuxtLink class="btn" :to="`/events/${event._id}/edit`">Editar</NuxtLink>
      <button class="btn btn-danger" @click="askDelete(event)">Eliminar</button>
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
