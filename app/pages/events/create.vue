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
  <div class="card">
    <h1>Nueva actividad</h1>
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
          <option v-for="cat in categoriesData?.categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>
        <small v-if="!categoriesData?.categories.length">
          Todavía no hay categorías creadas; pedile a un administrador que cree alguna en /admin/categories.
        </small>
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

      <button class="btn" type="submit" :disabled="submitting">
        {{ submitting ? 'Creando...' : 'Crear actividad' }}
      </button>
    </form>
  </div>
</template>
