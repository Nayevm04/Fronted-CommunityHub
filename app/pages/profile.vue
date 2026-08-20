<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
</script>

<template>
  <div class="card">
    <h1>Mi perfil</h1>
    <p><strong>Nombre:</strong> {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</p>
    <p><strong>Correo:</strong> {{ authStore.user?.email }}</p>
    <p><strong>Rol:</strong> <span class="badge">{{ authStore.user?.role }}</span></p>
    <img
      v-if="authStore.user?.profileImage"
      :src="getImageUrl(authStore.user.profileImage) ?? undefined"
      alt="Foto de perfil"
      style="max-width: 120px; border-radius: 50%"
    />
  </div>
</template>
