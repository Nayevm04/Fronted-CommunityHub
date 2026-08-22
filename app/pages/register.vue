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
  <div class="auth-container">
    <div class="card auth-card">
      <div class="auth-header">
        <div class="auth-brand-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="6" r="3" fill="currentColor" />
            <circle cx="6" cy="16" r="3" fill="currentColor" />
            <circle cx="18" cy="16" r="3" fill="currentColor" />
            <path d="M12 9V12M12 12L8.5 14M12 12L15.5 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h1>Crear cuenta</h1>
        <p class="auth-subtitle">Unite a CommunityHub para participar y organizar eventos</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-row-2">
          <div class="form-field">
            <label for="firstName">Nombre</label>
            <input id="firstName" v-model="form.firstName" type="text" placeholder="Juan" required />
          </div>
          <div class="form-field">
            <label for="lastName">Apellido</label>
            <input id="lastName" v-model="form.lastName" type="text" placeholder="Pérez" required />
          </div>
        </div>

        <div class="form-field">
          <label for="email">Correo electrónico</label>
          <input id="email" v-model="form.email" type="email" placeholder="tu@email.com" required />
        </div>

        <div class="form-field">
          <label for="password">Contraseña</label>
          <input id="password" v-model="form.password" type="password" minlength="8" placeholder="••••••••" required />
          <small>Mínimo 8 caracteres</small>
        </div>

        <ImageInput v-model="form.profileImage" label="Foto de perfil (opcional)" folder="profiles" />

        <p v-if="clientError" class="error-message">{{ clientError }}</p>
        <p v-else-if="authStore.error" class="error-message">{{ authStore.error }}</p>

        <button class="btn full-width" type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Creando cuenta...' : 'Registrarse' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>¿Ya tenés cuenta? <NuxtLink to="/login" class="auth-link">Ingresá aquí</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
}

.auth-card {
  max-width: 520px;
  width: 100%;
  padding: 2.25rem 2rem;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.auth-brand-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  padding: 8px;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

.auth-brand-icon svg {
  width: 100%;
  height: 100%;
}

.auth-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.35rem;
}

.auth-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.full-width {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  margin-top: 1rem;
}

.auth-footer {
  text-align: center;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.9rem;
  color: var(--text-muted);
}

.auth-footer p {
  margin: 0;
}

.auth-link {
  font-weight: 700;
  color: var(--primary);
}

@media (max-width: 520px) {
  .form-row-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
