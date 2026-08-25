<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const store = useFavoritesStore()
const { isOnline } = useNetworkStatus()
const offlineMessage = 'Esta sección no está disponible sin conexión a Internet.'

if (isOnline.value) {
  await store.fetchMyFavorites()
} else {
  store.error = offlineMessage
}

if (import.meta.client) {
  watch(isOnline, (online) => {
    if (online) store.fetchMyFavorites()
  })
}

const actionError = ref('')
const removingId = ref<string | null>(null)

const removeFavorite = async (eventId: string) => {
  actionError.value = ''
  removingId.value = eventId
  const ok = await store.removeFavorite(eventId)
  removingId.value = null
  if (!ok) {
    actionError.value = store.error || 'No se pudo quitar de favoritos'
  }
}
</script>

<template>
  <div class="my-favorites-page">
    <div class="card card-header-flex">
      <div>
        <h1 style="margin-bottom: 0.25rem;">Mis Favoritos</h1>
        <p style="margin-bottom: 0; color: var(--text-muted); font-size: 0.9rem;">
          Actividades comunitarias que marcaste como favoritas
        </p>
      </div>
    </div>

    <p v-if="actionError" class="error-message">{{ actionError }}</p>

    <div v-if="store.loading" class="state-container">
      <div class="spinner"></div>
      <p>Cargando tus favoritos...</p>
    </div>

    <div v-else-if="!isOnline" class="empty-state card">
      <h3>Sección no disponible sin conexión</h3>
      <p>{{ offlineMessage }}</p>
    </div>

    <div v-else-if="!store.favorites.length" class="empty-state card">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </div>
      <h3>Todavía no marcaste ninguna actividad como favorita</h3>
      <p>Explorá las actividades disponibles y guardá las que más te interesen.</p>
      <NuxtLink class="btn" to="/events" style="margin-top: 1rem;">Ver actividades</NuxtLink>
    </div>

    <div v-else class="grid-cards">
      <div
        v-for="favorite in store.favorites"
        :key="favorite._id"
        class="card my-favorite-card"
      >
        <template v-if="favorite.event">
          <div class="my-favorite-header">
            <h2 class="my-favorite-title">{{ favorite.event.title }}</h2>
            <span class="badge" :class="`badge-status--${favorite.event.status}`">
              {{ getStatusLabel(favorite.event.status) }}
            </span>
          </div>

          <div class="my-favorite-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{{ formatEventDate(favorite.event.date) }} — {{ favorite.event.hour }} HS</span>
          </div>

          <div class="my-favorite-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{{ favorite.event.location }}</span>
          </div>

          <div class="my-favorite-actions">
            <NuxtLink class="btn btn-secondary btn-sm" :to="`/events/${favorite.event._id}`">
              Ver detalle
            </NuxtLink>
            <button
              type="button"
              class="btn btn-danger btn-sm"
              :disabled="removingId === favorite.event._id"
              @click="removeFavorite(favorite.event._id)"
            >
              {{ removingId === favorite.event._id ? 'Quitando...' : 'Quitar de favoritos' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-favorites-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.my-favorite-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.my-favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.my-favorite-title {
  font-size: 1.15rem;
  margin: 0;
}

.my-favorite-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.my-favorite-meta svg {
  width: 16px;
  height: 16px;
  color: var(--primary);
  flex-shrink: 0;
}

.my-favorite-actions {
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
