<script setup lang="ts">
const { isOnline, justReconnected } = useNetworkStatus()
</script>

<template>
  <div v-if="!isOnline" class="network-banner network-banner--offline">
    Estás sin conexión. Se está mostrando información guardada.
  </div>
  <div v-else-if="justReconnected" class="network-banner network-banner--online">
    Conexión restablecida.
  </div>
</template>

<style scoped>
.network-banner {
  text-align: center;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #fff;
}
.network-banner--offline {
  background: #b45309;
}
.network-banner--online {
  background: #16a34a;
}
</style>
