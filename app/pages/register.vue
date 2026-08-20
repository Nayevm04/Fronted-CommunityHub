<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  profileImage: null as string | null,
})

// Validacion propia del formulario, ademas de la que hace el backend
const clientError = ref('')

const handleSubmit = async () => {
  clientError.value = ''

  if (form.password.length < 8) {
    clientError.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  await authStore.register({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password,
    profileImage: form.profileImage ?? undefined,
  })

  if (authStore.isAuthenticated) {
    router.push('/')
  }
}
</script>

<template>
  <div class="card">
    <h1>Crear cuenta</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="firstName">Nombre</label>
        <input id="firstName" v-model="form.firstName" type="text" required />
      </div>
      <div class="form-field">
        <label for="lastName">Apellido</label>
        <input id="lastName" v-model="form.lastName" type="text" required />
      </div>
      <div class="form-field">
        <label for="email">Correo electronico</label>
        <input id="email" v-model="form.email" type="email" required />
      </div>
      <div class="form-field">
        <label for="password">Contrasena</label>
        <input id="password" v-model="form.password" type="password" minlength="8" required />
        <small>Minimo 8 caracteres</small>
      </div>
      <ImageInput v-model="form.profileImage" label="Foto de perfil (opcional)" folder="profiles" />

      <p v-if="clientError" class="error-message">{{ clientError }}</p>
      <p v-else-if="authStore.error" class="error-message">{{ authStore.error }}</p>

      <button class="btn" type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Creando cuenta...' : 'Registrarse' }}
      </button>
    </form>
    <p>¿Ya tenes cuenta? <NuxtLink to="/login">Ingresa aqui</NuxtLink></p>
  </div>
</template>
