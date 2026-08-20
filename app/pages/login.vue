<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const handleSubmit = async () => {
  await authStore.login({ email: form.email, password: form.password })
  if (authStore.isAuthenticated) {
    router.push('/')
  }
}
</script>

<template>
  <div class="card">
    <h1>Ingresar</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="email">Correo electronico</label>
        <input id="email" v-model="form.email" type="email" required />
      </div>
      <div class="form-field">
        <label for="password">Contrasena</label>
        <input id="password" v-model="form.password" type="password" required />
      </div>

      <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>

      <button class="btn" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>
    <p>¿No tenes cuenta? <NuxtLink to="/register">Registrate aqui</NuxtLink></p>
  </div>
</template>
