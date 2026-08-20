<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <div class="card">
    <h1>Bienvenido a CommunityHub</h1>
    <p v-if="authStore.isAuthenticated">
      Hola {{ authStore.user?.firstName }}, tu rol es <strong>{{ authStore.role }}</strong
      >.
    </p>
    <p v-else>Consulta las actividades disponibles o crea una cuenta para participar.</p>
    <NuxtLink class="btn" to="/events">Ver actividades</NuxtLink>
  </div>
</template>
