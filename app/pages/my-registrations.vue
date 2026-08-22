<script setup lang="ts">
import type { RegistrationItem } from '~/types/models'

definePageMeta({ middleware: 'auth' })

const store = useRegistrationsStore()
await store.fetchMyRegistrations()

const actionError = ref('')
const cancelling = ref(false)
const cancelTarget = ref<RegistrationItem | null>(null)

const askCancel = (registration: RegistrationItem) => {
  actionError.value = ''
  cancelTarget.value = registration
}

const closeCancel = () => {
  cancelTarget.value = null
}

const confirmCancel = async () => {
  const eventId = cancelTarget.value?.event?._id
  cancelTarget.value = null
  if (!eventId) return

  cancelling.value = true
  const ok = await store.cancelRegistration(eventId)
  cancelling.value = false
  if (!ok) {
    actionError.value = store.error || 'No se pudo cancelar la inscripción'
  }
}
</script>

<template>
  <div class="my-registrations-page">
    <div class="card card-header-flex">
      <div>
        <h1 style="margin-bottom: 0.25rem;">Mis Inscripciones</h1>
        <p style="margin-bottom: 0; color: var(--text-muted); font-size: 0.9rem;">
          Actividades comunitarias en las que estás inscrito
        </p>
      </div>
    </div>

    <p v-if="actionError" class="error-message">{{ actionError }}</p>

    <div v-if="store.loading" class="state-container">
      <div class="spinner"></div>
      <p>Cargando tus inscripciones...</p>
    </div>

    <div v-else-if="!store.registrations.length" class="empty-state card">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3>Todavía no te inscribiste a ninguna actividad</h3>
      <p>Explorá las actividades disponibles y sumate a la comunidad.</p>
      <NuxtLink class="btn" to="/events" style="margin-top: 1rem;">Ver actividades</NuxtLink>
    </div>

    <div v-else class="grid-cards">
      <div
        v-for="registration in store.registrations"
        :key="registration._id"
        class="card my-registration-card"
      >
        <template v-if="registration.event">
          <div class="my-registration-header">
            <h2 class="my-registration-title">{{ registration.event.title }}</h2>
            <span class="badge" :class="`badge-status--${registration.event.status}`">
              {{ getStatusLabel(registration.event.status) }}
            </span>
          </div>

          <div class="my-registration-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{{ new Date(registration.event.date).toLocaleDateString() }} — {{ registration.event.hour }} HS</span>
          </div>

          <div class="my-registration-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{{ registration.event.location }}</span>
          </div>

          <div class="my-registration-actions">
            <NuxtLink class="btn btn-secondary btn-sm" :to="`/events/${registration.event._id}`">
              Ver detalle
            </NuxtLink>
            <button
              v-if="registration.event.status === 'active'"
              type="button"
              class="btn btn-danger btn-sm"
              :disabled="cancelling"
              @click="askCancel(registration)"
            >
              Cancelar inscripción
            </button>
          </div>
        </template>
      </div>
    </div>

    <ConfirmDialog
      :open="!!cancelTarget"
      title="Cancelar inscripción"
      :message="`¿Estás seguro de que quieres cancelar tu inscripción en “${cancelTarget?.event?.title}”?`"
      confirm-text="Cancelar inscripción"
      cancel-text="Volver"
      @confirm="confirmCancel"
      @cancel="closeCancel"
    />
  </div>
</template>

<style scoped>
.my-registrations-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.my-registration-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.my-registration-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.my-registration-title {
  font-size: 1.15rem;
  margin: 0;
}

.my-registration-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.my-registration-meta svg {
  width: 16px;
  height: 16px;
  color: var(--primary);
  flex-shrink: 0;
}

.my-registration-actions {
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
