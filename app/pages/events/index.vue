<script setup lang="ts">
import type { EventItem } from '~/types/models'

const { apiFetch } = useApi()

const filters = reactive({
  search: '',
  date: '',
  location: '',
  available: false,
})

const query = computed(() => {
  const q: Record<string, string> = {}
  if (filters.search.trim()) q.search = filters.search.trim()
  if (filters.date) q.date = filters.date
  if (filters.location.trim()) q.location = filters.location.trim()
  if (filters.available) q.available = 'true'
  return q
})

const hasActiveFilters = computed(() => Object.keys(query.value).length > 0)

const clearFilters = () => {
  filters.search = ''
  filters.date = ''
  filters.location = ''
  filters.available = false
}

const { data, pending, error, refresh } = await useAsyncData('events-list', () =>
  apiFetch<{ events: EventItem[] }>('/events', { query: query.value })
)

// Un solo debounce para todos los filtros: evita disparar una peticion por cada tecla
// mientras se escribe en "search"/"location", y mantiene consistente el comportamiento de date/available.
let filtersDebounce: ReturnType<typeof setTimeout> | undefined
watch(filters, () => {
  clearTimeout(filtersDebounce)
  filtersDebounce = setTimeout(() => refresh(), 300)
})
</script>

<template>
  <div class="events-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Actividades Comunitarias</h1>
        <p class="page-subtitle">Explorá los próximos eventos organizados en tu comunidad</p>
      </div>
    </div>

    <div class="card filters-bar">
      <div class="form-field">
        <label for="filter-search">Buscar</label>
        <input id="filter-search" v-model="filters.search" type="text" placeholder="Título o descripción..." />
      </div>
      <div class="form-field">
        <label for="filter-date">Fecha</label>
        <input id="filter-date" v-model="filters.date" type="date" />
      </div>
      <div class="form-field">
        <label for="filter-location">Ubicación</label>
        <input id="filter-location" v-model="filters.location" type="text" placeholder="Lugar..." />
      </div>
      <label class="filter-checkbox">
        <input v-model="filters.available" type="checkbox" />
        Solo con cupo disponible
      </label>
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        :disabled="!hasActiveFilters"
        @click="clearFilters"
      >
        Limpiar filtros
      </button>
    </div>

    <div v-if="pending" class="state-container">
      <div class="spinner"></div>
      <p>Cargando actividades...</p>
    </div>
    <div v-else-if="error" class="error-message">
      No se pudieron cargar las actividades
    </div>
    <div v-else-if="!data?.events.length && hasActiveFilters" class="empty-state card">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h3>No se encontraron actividades con esos filtros</h3>
      <p>Probá ajustar la búsqueda o limpiar los filtros.</p>
      <button type="button" class="btn" style="margin-top: 1rem;" @click="clearFilters">Limpiar filtros</button>
    </div>
    <div v-else-if="!data?.events.length" class="empty-state card">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3>Todavía no hay actividades publicadas</h3>
      <p>Sé el primero en consultar las próximas publicaciones o crear un nuevo evento.</p>
    </div>

    <div v-else class="grid-cards">
      <div v-for="event in data?.events" :key="event._id" class="card event-card card-interactive">
        <div class="event-image-wrapper">
          <img
            v-if="event.image"
            :src="getImageUrl(event.image) ?? undefined"
            alt=""
            class="event-image"
          />
          <div v-else class="event-image-fallback">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            <span>CommunityHub</span>
          </div>

          <div class="event-badges-overlay">
            <span v-if="event.category?.name" class="badge badge-primary">{{ event.category?.name }}</span>
            <span class="badge" :class="`badge-status--${event.status}`">{{ getStatusLabel(event.status) }}</span>
          </div>
        </div>

        <div class="event-card-body">
          <h2 class="event-title">{{ event.title }}</h2>
          <p class="event-description">{{ event.description }}</p>

          <div class="event-meta-list">
            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{{ formatEventDate(event.date) }} - {{ event.hour }}</span>
            </div>

            <div class="meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{{ event.location }}</span>
            </div>

            <div v-if="event.organizer" class="meta-item meta-item--organizer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Organiza: <strong>{{ event.organizer?.firstName }} {{ event.organizer?.lastName }}</strong></span>
            </div>
          </div>

          <div class="event-card-footer">
            <NuxtLink class="btn btn-sm full-width" :to="`/events/${event._id}`">Ver detalle</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.events-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  margin-bottom: 0.5rem;
}

.page-title {
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.filters-bar .form-field {
  flex: 1 1 180px;
  min-width: 160px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
  padding-bottom: 0.6rem;
}

.filter-checkbox input {
  width: 16px;
  height: 16px;
}

.event-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.event-image-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  background-color: var(--bg-muted);
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.event-card:hover .event-image {
  transform: scale(1.04);
}

.event-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e7ff 0%, #cffafe 100%);
  color: var(--primary-dark);
  gap: 0.5rem;
}

.event-image-fallback svg {
  width: 36px;
  height: 36px;
  opacity: 0.8;
}

.event-image-fallback span {
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.85;
}

.event-badges-overlay {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
}

.event-card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.event-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-main);
  line-height: 1.35;
}

.event-description {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.45;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-meta-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-item svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: var(--primary);
}

.event-card-footer {
  margin-top: auto;
}

.full-width {
  width: 100%;
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
