<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const store = useNotificationsStore()
await store.fetchNotifications()
</script>

<template>
  <div>
    <div class="card" style="display: flex; justify-content: space-between; align-items: center">
      <h1>Notificaciones</h1>
      <button v-if="store.unreadCount > 0" class="btn btn-secondary" @click="store.markAllAsRead()">
        Marcar todas como leídas
      </button>
    </div>

    <p v-if="store.error" class="error-message">{{ store.error }}</p>
    <p v-if="store.loading">Cargando...</p>
    <p v-else-if="!store.notifications.length">Todavía no tenés notificaciones.</p>

    <div
      v-for="n in store.notifications"
      :key="n._id"
      class="card"
      :style="{ opacity: n.read ? 0.6 : 1 }"
    >
      <p>{{ n.message }}</p>
      <p v-if="n.event">
        Actividad: {{ n.event.title }} — {{ new Date(n.event.date).toLocaleDateString() }} {{ n.event.hour }}
      </p>
      <p><small>{{ new Date(n.createdAt).toLocaleString() }}</small></p>
      <span class="badge">{{ n.read ? 'leída' : 'no leída' }}</span>
      <button v-if="!n.read" class="btn" @click="store.markAsRead(n._id)">Marcar como leída</button>
    </div>
  </div>
</template>
