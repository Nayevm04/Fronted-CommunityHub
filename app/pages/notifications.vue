<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const store = useNotificationsStore()
await store.fetchNotifications()
</script>

<template>
  <div class="notifications-page">
    <div class="card card-header-flex">
      <div>
        <h1 style="margin-bottom: 0.25rem;">Notificaciones</h1>
        <p style="margin-bottom: 0; color: var(--text-muted); font-size: 0.9rem;">
          Novedades y avisos sobre tus actividades comunitarias
        </p>
      </div>
      <button v-if="store.unreadCount > 0" class="btn btn-secondary btn-sm" @click="store.markAllAsRead()">
        Marcar todas como leídas
      </button>
    </div>

    <p v-if="store.error" class="error-message">{{ store.error }}</p>

    <div v-if="store.loading" class="state-container">
      <div class="spinner"></div>
      <p>Cargando notificaciones...</p>
    </div>

    <div v-else-if="!store.notifications.length" class="empty-state card">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h3>Todavía no tenés notificaciones</h3>
      <p>Te avisaremos cuando haya actualizaciones sobre las actividades en las que participás.</p>
    </div>

    <div v-else class="notifications-list">
      <div
        v-for="n in store.notifications"
        :key="n._id"
        class="card notification-card"
        :class="{ 'notification-card--read': n.read, 'notification-card--unread': !n.read }"
      >
        <div class="notification-body">
          <div class="notification-icon" :class="{ unread: !n.read }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          <div class="notification-content">
            <p class="notification-message">{{ n.message }}</p>

            <div v-if="n.event" class="notification-event-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Actividad: <strong>{{ n.event.title }}</strong> — {{ new Date(n.event.date).toLocaleDateString() }} {{ n.event.hour }}</span>
            </div>

            <span class="notification-time">{{ new Date(n.createdAt).toLocaleString() }}</span>
          </div>
        </div>

        <div class="notification-actions">
          <span class="badge" :class="n.read ? 'badge-muted' : 'badge-warning'">
            {{ n.read ? 'leída' : 'no leída' }}
          </span>
          <button v-if="!n.read" class="btn btn-sm" @click="store.markAsRead(n._id)">
            Marcar como leída
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  margin-bottom: 0;
  transition: all var(--transition-fast);
}

.notification-card--unread {
  border-left: 4px solid var(--primary);
  background: var(--bg-surface);
}

.notification-card--read {
  opacity: 0.75;
  background: var(--bg-main);
}

.notification-body {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.notification-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--bg-muted);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.unread {
  background: var(--primary-light);
  color: var(--primary);
}

.notification-icon svg {
  width: 18px;
  height: 18px;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notification-message {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-main);
  margin: 0;
}

.notification-event-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.825rem;
  color: var(--text-muted);
  background: var(--bg-muted);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  margin-top: 0.25rem;
}

.notification-event-tag svg {
  width: 14px;
  height: 14px;
  color: var(--primary);
}

.notification-time {
  font-size: 0.775rem;
  color: var(--text-light);
  margin-top: 0.2rem;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.badge-muted {
  background: var(--status-muted-bg);
  color: var(--status-muted-text);
  border-color: var(--status-muted-border);
}

.badge-warning {
  background: var(--status-warning-bg);
  color: var(--status-warning-text);
  border-color: var(--status-warning-border);
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

@media (max-width: 640px) {
  .notification-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .notification-actions {
    width: 100%;
    justify-content: space-between;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color);
  }
}
</style>
