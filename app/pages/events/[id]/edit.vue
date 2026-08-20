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
  <div class="card">
    <h1>Editar actividad</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-field">
        <label for="title">Titulo</label>
        <input id="title" v-model="form.title" type="text" required />
      </div>
      <div class="form-field">
        <label for="description">Descripcion</label>
        <textarea id="description" v-model="form.description" required></textarea>
      </div>
      <div class="form-field">
        <label for="category">Categoria</label>
        <select id="category" v-model="form.category" required>
          <option value="" disabled>Seleccione categoría</option>
          <option v-for="cat in categoryOptions" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
        </select>
      </div>
      <div class="form-field">
        <label for="date">Fecha</label>
        <input id="date" v-model="form.date" type="date" :min="todayDate" required />
      </div>
      <div class="form-field">
        <label for="hour">Hora</label>
        <input id="hour" v-model="form.hour" type="time" required />
      </div>
      <div class="form-field">
        <label for="location">Ubicacion</label>
        <input id="location" v-model="form.location" type="text" required />
      </div>
      <div class="form-field">
        <label for="capacity">Capacidad maxima</label>
        <input id="capacity" v-model.number="form.capacity" type="number" min="1" required />
      </div>

      <ImageInput v-model="form.image" label="Imagen de la actividad (opcional)" folder="events" />

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button class="btn" type="submit" :disabled="submitting">Guardar cambios</button>
    </form>

    <hr />
    <button class="btn btn-secondary" @click="handleCancelEvent">Cancelar actividad</button>
    <button class="btn btn-danger" @click="showDeleteConfirm = true">Eliminar actividad</button>

    <ConfirmDialog
      :open="showDeleteConfirm"
      title="Eliminar actividad"
      :message="`¿Estás seguro de que quieres eliminar la actividad “${form.title}”?`"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
