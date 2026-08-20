<script setup lang="ts">
import type { EventItem } from '~/types/models'

const { apiFetch } = useApi()

const { data, pending, error } = await useAsyncData('events-list', () =>
  apiFetch<{ events: EventItem[] }>('/events')
)
</script>

<template>
  <div>
    <h1>Actividades</h1>

    <p v-if="pending">Cargando actividades...</p>
    <p v-else-if="error" class="error-message">No se pudieron cargar las actividades</p>
    <p v-else-if="!data?.events.length">Todavia no hay actividades publicadas.</p>

    <div v-for="event in data?.events" :key="event._id" class="card">
      <img
        v-if="event.image"
        :src="getImageUrl(event.image) ?? undefined"
        alt=""
        style="max-width: 200px; max-height: 140px; object-fit: cover; border-radius: 6px"
      />
      <h2>{{ event.title }}</h2>
      <p>{{ event.description }}</p>
      <p>
        <span class="badge">{{ event.category?.name }}</span>
        <span class="badge">{{ getStatusLabel(event.status) }}</span>
      </p>
      <p>{{ new Date(event.date).toLocaleDateString() }} - {{ event.hour }} - {{ event.location }}</p>
      <p>Organiza: {{ event.organizer?.firstName }} {{ event.organizer?.lastName }}</p>
      <NuxtLink class="btn" :to="`/events/${event._id}`">Ver detalle</NuxtLink>
    </div>
  </div>
</template>
