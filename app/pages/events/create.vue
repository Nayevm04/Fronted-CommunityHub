<script setup lang="ts">
import type { CategoryItem, EventItem } from '~/types/models'

definePageMeta({ middleware: 'event-manager' })

const { apiFetch } = useApi()
const router = useRouter()

const { data: categoriesData } = await useAsyncData('categories-for-event-create', () =>
  apiFetch<{ categories: CategoryItem[] }>('/categories')
)

const form = reactive({
  title: '',
  description: '',
  category: '',
  date: '',
  hour: '',
  location: '',
  capacity: 10,
  image: null as string | null,
})

const errorMessage = ref('')
const submitting = ref(false)
const todayDate = getLocalDateString()

const handleSubmit = async () => {
  errorMessage.value = ''

  if (isPastDateTime(form.date, form.hour)) {
    errorMessage.value = 'La fecha y hora seleccionadas ya pasaron'
    return
  }

  submitting.value = true
  try {
    const data = await apiFetch<{ event: EventItem }>('/events', {
      method: 'POST',
      body: { ...form, image: form.image ?? undefined },
    })
    router.push(`/events/${data.event._id}`)
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'No se pudo crear la actividad')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="create-event-page">
    <div class="back-nav">
      <NuxtLink to="/events" class="btn-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver a actividades
      </NuxtLink>
    </div>

    <div class="card form-card">
      <div class="form-header">
        <h1>Nueva actividad</h1>
        <p>Completá los detalles para publicar un nuevo evento comunitario</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h2 class="section-title">Información Principal</h2>
          
          <div class="form-field">
            <label for="title">Título de la actividad</label>
            <input id="title" v-model="form.title" type="text" placeholder="Ej. Taller de Reciclaje Comunitario" required />
          </div>

          <div class="form-field">
            <label for="description">Descripción detallada</label>
            <textarea id="description" v-model="form.description" placeholder="Explicá de qué trata el evento, qué llevar o qué actividades se realizarán..." required></textarea>
          </div>

          <div class="form-field">
            <label for="category">Categoría</label>
            <select id="category" v-model="form.category" required>
              <option value="" disabled>Seleccione categoría</option>
              <option v-for="cat in categoriesData?.categories" :key="cat._id" :value="cat._id">
                {{ cat.name }}
              </option>
            </select>
            <small v-if="!categoriesData?.categories.length" class="field-hint warning">
              Todavía no hay categorías creadas; pedile a un administrador que cree alguna en /admin/categories.
            </small>
          </div>
        </div>

        <div class="form-section">
          <h2 class="section-title">Fecha, Hora y Ubicación</h2>

          <div class="form-grid-2">
            <div class="form-field">
              <label for="date">Fecha</label>
              <input id="date" v-model="form.date" type="date" :min="todayDate" required />
            </div>

            <div class="form-field">
              <label for="hour">Hora</label>
              <input id="hour" v-model="form.hour" type="time" required />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-field">
              <label for="location">Ubicación / Lugar</label>
              <input id="location" v-model="form.location" type="text" placeholder="Ej. Centro Cultural Plaza Mayor" required />
            </div>

            <div class="form-field">
              <label for="capacity">Capacidad máxima (personas)</label>
              <input id="capacity" v-model.number="form.capacity" type="number" min="1" required />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h2 class="section-title">Imagen Promocional</h2>
          <ImageInput v-model="form.image" label="Imagen de la actividad (opcional)" folder="events" />
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="form-actions">
          <NuxtLink to="/events" class="btn btn-secondary">Cancelar</NuxtLink>
          <button class="btn" type="submit" :disabled="submitting">
            {{ submitting ? 'Creando...' : 'Crear actividad' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.create-event-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.back-nav {
  margin-bottom: 0.25rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
}

.btn-back:hover {
  color: var(--primary);
}

.btn-back svg {
  width: 18px;
  height: 18px;
}

.form-card {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.form-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.form-header h1 {
  margin-bottom: 0.35rem;
}

.form-header p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  color: var(--primary-dark);
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-light);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-hint.warning {
  color: #b45309;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 640px) {
  .form-card {
    padding: 1.25rem;
  }
  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
