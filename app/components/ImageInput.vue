<script setup lang="ts">
// Input de imagen: por URL o archivo. Emite la ruta final lista para guardar.
const props = defineProps<{
  modelValue: string | null | undefined
  label?: string
  // Subcarpeta del backend donde se guarda el archivo subido (profiles, events)
  folder?: 'profiles' | 'events'
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

const mode = ref<'url' | 'file'>('url')
const urlValue = ref(props.modelValue ?? '')
const uploading = ref(false)
const errorMessage = ref('')
const previewError = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const previewSrc = computed(() => getImageUrl(props.modelValue))

watch(
  () => props.modelValue,
  () => {
    previewError.value = false
  }
)

const handleUrlInput = () => {
  errorMessage.value = ''
  emit('update:modelValue', urlValue.value.trim() || null)
}

const handleFileChange = async (event: Event) => {
  errorMessage.value = ''
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value = 'La imagen seleccionada no es válida. Usá JPG, PNG o WEBP.'
    return
  }
  if (file.size > MAX_SIZE) {
    errorMessage.value = 'La imagen supera el tamaño permitido (máx. 5MB).'
    return
  }

  const { apiFetch } = useApi()
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const query = props.folder ? `?folder=${props.folder}` : ''
    const data = await apiFetch<{ image: string }>(`/uploads${query}`, { method: 'POST', body: formData })
    emit('update:modelValue', data.image)
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'No se pudo subir la imagen')
  } finally {
    uploading.value = false
  }
}

const clearImage = () => {
  urlValue.value = ''
  errorMessage.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="form-field">
    <label>{{ label || 'Imagen' }}</label>

    <div class="image-mode-toggle">
      <label><input v-model="mode" type="radio" value="url" /> Usar URL</label>
      <label><input v-model="mode" type="radio" value="file" /> Subir archivo</label>
    </div>

    <input
      v-if="mode === 'url'"
      v-model="urlValue"
      type="url"
      placeholder="https://..."
      @input="handleUrlInput"
    />
    <input
      v-else
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      @change="handleFileChange"
    />

    <p v-if="uploading">Subiendo imagen...</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="previewSrc && !previewError" class="image-preview">
      <img :src="previewSrc" alt="Vista previa" @error="previewError = true" />
    </div>
    <p v-else-if="previewSrc && previewError" class="error-message">No se pudo cargar la imagen.</p>

    <button v-if="modelValue" type="button" class="btn btn-secondary" @click="clearImage">
      Quitar imagen
    </button>
  </div>
</template>

<style scoped>
.image-mode-toggle {
  display: flex;
  gap: 1rem;
  font-weight: normal;
  margin-bottom: 0.5rem;
}
.image-preview img {
  max-width: 160px;
  max-height: 160px;
  border-radius: 6px;
  margin-top: 0.5rem;
  object-fit: cover;
}
</style>
