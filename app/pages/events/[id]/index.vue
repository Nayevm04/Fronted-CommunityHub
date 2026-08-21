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
  <div class="event-detail-page">
    <div class="back-nav">
      <NuxtLink to="/events" class="btn-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver a actividades
      </NuxtLink>
    </div>

    <div v-if="pending" class="state-container">
      <div class="spinner"></div>
      <p>Cargando detalle...</p>
    </div>
    <div v-else-if="error" class="error-message">
      {{ getErrorMessage(error, 'La actividad no existe') }}
    </div>

    <div v-else-if="data" class="card detail-card">
      <div class="detail-hero">
        <img
          v-if="data.event.image"
          :src="getImageUrl(data.event.image) ?? undefined"
          alt=""
          class="detail-image"
        />
        <div v-else class="detail-image-fallback">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>CommunityHub Event</span>
        </div>

        <div class="detail-badges">
          <span v-if="data.event.category?.name" class="badge badge-primary">{{ data.event.category?.name }}</span>
          <span class="badge" :class="`badge-status--${data.event.status}`">{{ getStatusLabel(data.event.status) }}</span>
        </div>
      </div>

      <div class="detail-body">
        <h1 class="detail-title">{{ data.event.title }}</h1>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <span class="info-label">Fecha y Hora</span>
              <p class="info-value">{{ new Date(data.event.date).toLocaleDateString() }} — {{ data.event.hour }} HS</p>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <span class="info-label">Ubicación</span>
              <p class="info-value">{{ data.event.location }}</p>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div>
              <span class="info-label">Capacidad Máxima</span>
              <p class="info-value">{{ data.event.capacity }} personas</p>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <span class="info-label">Organizador</span>
              <p class="info-value">{{ data.event.organizer?.firstName }} {{ data.event.organizer?.lastName }}</p>
            </div>
          </div>
        </div>

        <div class="description-section">
          <h2>Sobre esta actividad</h2>
          <p class="description-text">{{ data.event.description }}</p>
        </div>

        <div v-if="canManage" class="detail-actions">
          <NuxtLink class="btn" :to="`/events/${data.event._id}/edit`">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar actividad
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.back-nav {
  margin-bottom: 0.5rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.btn-back:hover {
  color: var(--primary);
}

.btn-back svg {
  width: 18px;
  height: 18px;
}

.detail-card {
  padding: 0;
  overflow: hidden;
}

.detail-hero {
  position: relative;
  width: 100%;
  max-height: 340px;
  min-height: 220px;
  background: var(--bg-muted);
  overflow: hidden;
}

.detail-image {
  width: 100%;
  height: 100%;
  max-height: 340px;
  object-fit: cover;
}

.detail-image-fallback {
  width: 100%;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e7ff 0%, #cffafe 100%);
  color: var(--primary-dark);
  gap: 0.5rem;
}

.detail-image-fallback svg {
  width: 48px;
  height: 48px;
}

.detail-badges {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
}

.detail-body {
  padding: 2rem;
}

.detail-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--text-main);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.info-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon svg {
  width: 20px;
  height: 20px;
}

.info-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.15rem;
}

.info-value {
  margin: 0;
  font-weight: 600;
  color: var(--text-main);
  font-size: 0.95rem;
}

.description-section {
  margin-bottom: 2rem;
}

.description-section h2 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.description-text {
  color: var(--text-muted);
  line-height: 1.6;
  white-space: pre-line;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
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

@media (max-width: 640px) {
  .detail-body {
    padding: 1.25rem;
  }
  .detail-title {
    font-size: 1.5rem;
  }
}
</style>
