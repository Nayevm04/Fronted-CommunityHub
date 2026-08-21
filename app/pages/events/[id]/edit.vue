<script setup lang="ts">
import type { CategoryItem, EventItem } from '~/types/models'

definePageMeta({ middleware: 'event-manager' })

const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()

const { data } = await useAsyncData(`event-edit-${route.params.id}`, () =>
  apiFetch<{ event: EventItem }>(`/events/${route.params.id}`)
)

const { data: categoriesData } = await useAsyncData('categories-for-event-edit', () =>
  apiFetch<{ categories: CategoryItem[] }>('/categories')
)

// Si la categoria actual del evento fue desactivada despues, igual se muestra en el select
const categoryOptions = computed(() => {
  const list = categoriesData.value?.categories ?? []
  const current = data.value?.event.category
  if (current && !list.some((c) => c._id === current._id)) {
    return [...list, { ...current, description: '', isActive: false }]
  }
  return list
})

const toDateInput = (isoDate: string) => new Date(isoDate).toISOString().slice(0, 10)

const form = reactive({
  title: data.value?.event.title ?? '',
  description: data.value?.event.description ?? '',
  category: data.value?.event.category?._id ?? '',
  date: data.value?.event.date ? toDateInput(data.value.event.date) : '',
  hour: data.value?.event.hour ?? '',
  location: data.value?.event.location ?? '',
  capacity: data.value?.event.capacity ?? 1,
  image: data.value?.event.image ?? (null as string | null),
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
    await apiFetch(`/events/${route.params.id}`, { method: 'PUT', body: form })
    router.push(`/events/${route.params.id}`)
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'No se pudo actualizar la actividad')
  } finally {
    submitting.value = false
  }
}

const handleCancelEvent = async () => {
  errorMessage.value = ''
  try {
    await apiFetch(`/events/${route.params.id}`, { method: 'PUT', body: { status: 'cancelled' } })
    router.push('/my-events')
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'No se pudo cancelar la actividad')
  }
}

const showDeleteConfirm = ref(false)

const confirmDelete = async () => {
  showDeleteConfirm.value = false
  errorMessage.value = ''
  try {
    await apiFetch(`/events/${route.params.id}`, { method: 'DELETE' })
    router.push('/my-events')
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'No se pudo eliminar la actividad')
  }
}
</script>

<template>
  <div class="edit-event-page">
    <div class="back-nav">
      <NuxtLink :to="`/events/${route.params.id}`" class="btn-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Volver al detalle
      </NuxtLink>
    </div>

    <div class="card form-card">
      <div class="form-header">
        <h1>Editar actividad</h1>
        <p>Modificá la información de tu evento comunitario</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h2 class="section-title">Información Principal</h2>

          <div class="form-field">
            <label for="title">Título de la actividad</label>
            <input id="title" v-model="form.title" type="text" required />
          </div>

          <div class="form-field">
            <label for="description">Descripción</label>
            <textarea id="description" v-model="form.description" required></textarea>
          </div>

          <div class="form-field">
            <label for="category">Categoría</label>
            <select id="category" v-model="form.category" required>
              <option value="" disabled>Seleccione categoría</option>
              <option v-for="cat in categoryOptions" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
            </select>
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
              <label for="location">Ubicación</label>
              <input id="location" v-model="form.location" type="text" required />
            </div>

            <div class="form-field">
              <label for="capacity">Capacidad máxima</label>
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
          <NuxtLink :to="`/events/${route.params.id}`" class="btn btn-secondary">Cancelar</NuxtLink>
          <button class="btn" type="submit" :disabled="submitting">
            {{ submitting ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Danger Zone Card -->
    <div class="card danger-zone-card">
      <h3 class="danger-title">Zona de peligro</h3>
      <p class="danger-desc">Acciones destructivas o de estado para esta actividad</p>
      
      <div class="danger-actions">
        <button type="button" class="btn btn-secondary" @click="handleCancelEvent">
          Marcar como cancelada
        </button>
        <button type="button" class="btn btn-danger" @click="showDeleteConfirm = true">
          Eliminar actividad definitivamente
        </button>
      </div>
    </div>

    <ConfirmDialog
      :open="showDeleteConfirm"
      title="Eliminar actividad"
      :message="`¿Estás seguro de que quieres eliminar la actividad “${form.title}”?`"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.edit-event-page {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
}

.danger-zone-card {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  border-color: #fecaca;
  background-color: #fff5f5;
}

.danger-title {
  color: #b91c1c;
  margin-bottom: 0.25rem;
}

.danger-desc {
  color: #7f1d1d;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.danger-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .form-card, .danger-zone-card {
    padding: 1.25rem;
  }
  .form-grid-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
