<script setup lang="ts">
import type { EventItem } from '~/types/models'

const route = useRoute()
const authStore = useAuthStore()
const { apiFetch } = useApi()

const { data, pending, error } = await useAsyncData(`event-${route.params.id}`, () =>
  apiFetch<{ event: EventItem }>(`/events/${route.params.id}`)
)

const isOwner = computed(
  () => authStore.user && data.value?.event.organizer?._id === authStore.user._id
)
const canManage = computed(() => isOwner.value || authStore.isAdmin)
</script>

<template>
  <div>
    <p v-if="pending">Cargando...</p>
    <p v-else-if="error" class="error-message">{{ getErrorMessage(error, 'La actividad no existe') }}</p>

    <div v-else-if="data" class="card">
      <img
        v-if="data.event.image"
        :src="getImageUrl(data.event.image) ?? undefined"
        alt=""
        style="max-width: 100%; max-height: 280px; object-fit: cover; border-radius: 6px"
      />
      <h1>{{ data.event.title }}</h1>
      <p>{{ data.event.description }}</p>
      <p>
        <span class="badge">{{ data.event.category?.name }}</span>
        <span class="badge">{{ getStatusLabel(data.event.status) }}</span>
      </p>
      <p>{{ new Date(data.event.date).toLocaleDateString() }} - {{ data.event.hour }}</p>
      <p>Ubicacion: {{ data.event.location }}</p>
      <p>Capacidad: {{ data.event.capacity }}</p>
      <p>Organiza: {{ data.event.organizer?.firstName }} {{ data.event.organizer?.lastName }}</p>

      <NuxtLink v-if="canManage" class="btn" :to="`/events/${data.event._id}/edit`">
        Editar actividad
      </NuxtLink>
    </div>
  </div>
</template>
