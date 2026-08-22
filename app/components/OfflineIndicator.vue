<script setup lang="ts">
const { isOnline, justReconnected } = useNetworkStatus()
</script>

<template>
  <div v-if="!isOnline" class="network-banner network-banner--offline">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0122.58 9" />
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
    <span>Estás sin conexión. Se está mostrando información guardada.</span>
  </div>
  <div v-else-if="justReconnected" class="network-banner network-banner--online">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 12.55a11 11 0 0114.08 0" />
      <path d="M1.42 9a16 16 0 0121.16 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
    <span>Conexión restablecida.</span>
  </div>
</template>

<style scoped>
.network-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  box-shadow: var(--shadow-sm);
  z-index: 60;
  position: relative;
}

.network-banner svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.network-banner--offline {
  background: linear-gradient(90deg, #d97706 0%, #b45309 100%);
}

.network-banner--online {
  background: linear-gradient(90deg, #059669 0%, #16a34a 100%);
}
</style>
