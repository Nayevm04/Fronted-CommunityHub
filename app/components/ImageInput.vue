<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null | undefined
  label?: string
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
  <div class="form-field image-input-container">
    <label class="image-input-label">{{ label || 'Imagen' }}</label>

    <div class="mode-segmented-control">
      <button
        type="button"
        class="mode-pill"
        :class="{ active: mode === 'url' }"
        @click="mode = 'url'"
      >
        Usar URL externa
      </button>
      <button
        type="button"
        class="mode-pill"
        :class="{ active: mode === 'file' }"
        @click="mode = 'file'"
      >
        Subir archivo
      </button>
    </div>

    <!-- Mode inputs (keeping hidden inputs bound to v-model for radios if needed, or visual pills) -->
    <div style="display: none;">
      <input v-model="mode" type="radio" value="url" />
      <input v-model="mode" type="radio" value="file" />
    </div>

    <div v-if="mode === 'url'" class="input-url-box">
      <input
        v-model="urlValue"
        type="url"
        placeholder="https://ejemplo.com/imagen.jpg"
        @input="handleUrlInput"
      />
    </div>

    <div v-else class="input-file-box">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="file-input-hidden"
        id="file-upload-input"
        @change="handleFileChange"
      />
      <label for="file-upload-input" class="file-upload-dropzone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>Elegir imagen de tu dispositivo</span>
        <small>Formataos soportados: JPG, PNG, WEBP (máx. 5MB)</small>
      </label>
    </div>

    <p v-if="uploading" class="uploading-state">Subiendo imagen a la plataforma...</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="previewSrc && !previewError" class="preview-card">
      <div class="preview-header">
        <span>Vista previa</span>
        <button type="button" class="btn btn-secondary btn-sm" @click="clearImage">
          Quitar imagen
        </button>
      </div>
      <div class="preview-image-box">
        <img :src="previewSrc" alt="Vista previa" @error="previewError = true" />
      </div>
    </div>

    <p v-else-if="previewSrc && previewError" class="error-message">No se pudo cargar la vista previa de la imagen.</p>
  </div>
</template>

<style scoped>
.image-input-container {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.image-input-label {
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.mode-segmented-control {
  display: flex;
  background: var(--bg-muted);
  padding: 4px;
  border-radius: var(--radius-md);
  gap: 4px;
  margin-bottom: 1rem;
}

.mode-pill {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mode-pill.active {
  background: var(--bg-surface);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.file-input-hidden {
  display: none;
}

.file-upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #cbd5e1;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  background: var(--bg-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
  gap: 0.35rem;
}

.file-upload-dropzone:hover {
  border-color: var(--primary);
  background: var(--primary-subtle);
}

.file-upload-dropzone svg {
  width: 28px;
  height: 28px;
  color: var(--primary);
}

.file-upload-dropzone span {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-main);
}

.file-upload-dropzone small {
  font-size: 0.775rem;
}

.uploading-state {
  font-size: 0.85rem;
  color: var(--primary);
  font-weight: 600;
  margin-top: 0.5rem;
}

.preview-card {
  margin-top: 1rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.825rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.preview-image-box {
  width: 100%;
  max-height: 180px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image-box img {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
}
</style>
