<script setup lang="ts">
import type { CategoryItem } from '~/types/models'

definePageMeta({ middleware: 'admin' })

const { apiFetch } = useApi()

const { data, pending, refresh } = await useAsyncData('admin-categories', () =>
  apiFetch<{ categories: CategoryItem[] }>('/categories', { query: { includeInactive: 'true' } })
)

const form = reactive({ name: '', description: '' })
const formError = ref('')
const creating = ref(false)
const rowError = ref('')
const editingId = ref<string | null>(null)
const editForm = reactive({ name: '', description: '' })

const handleCreate = async () => {
  formError.value = ''
  creating.value = true
  try {
    await apiFetch('/categories', { method: 'POST', body: form })
    form.name = ''
    form.description = ''
    await refresh()
  } catch (error) {
    formError.value = getErrorMessage(error, 'No se pudo crear la categoría')
  } finally {
    creating.value = false
  }
}

const startEdit = (category: CategoryItem) => {
  editingId.value = category._id
  editForm.name = category.name
  editForm.description = category.description || ''
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async (id: string) => {
  rowError.value = ''
  try {
    await apiFetch(`/categories/${id}`, { method: 'PUT', body: editForm })
    editingId.value = null
    await refresh()
  } catch (error) {
    rowError.value = getErrorMessage(error, 'No se pudo actualizar la categoría')
  }
}

const handleToggleActive = async (category: CategoryItem) => {
  rowError.value = ''
  try {
    await apiFetch(`/categories/${category._id}`, { method: 'PUT', body: { isActive: !category.isActive } })
    await refresh()
  } catch (error) {
    rowError.value = getErrorMessage(error, 'No se pudo actualizar la categoría')
  }
}

const deleteTarget = ref<CategoryItem | null>(null)

const askDelete = (category: CategoryItem) => {
  deleteTarget.value = category
}

const cancelDelete = () => {
  deleteTarget.value = null
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  const id = deleteTarget.value._id
  deleteTarget.value = null
  rowError.value = ''
  try {
    await apiFetch(`/categories/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (error) {
    rowError.value = getErrorMessage(error, 'No se pudo eliminar la categoría')
  }
}
</script>

<template>
  <div class="admin-categories-page">
    <div class="page-header">
      <h1 class="page-title">Gestión de Categorías</h1>
      <p class="page-subtitle">Administrá las categorías utilizadas para organizar las actividades comunitarias</p>
    </div>

    <div class="card form-card">
      <h2 class="form-card-title">Nueva categoría</h2>
      <form @submit.prevent="handleCreate" class="inline-form-grid">
        <div class="form-field">
          <label for="name">Nombre</label>
          <input id="name" v-model="form.name" type="text" placeholder="Ej. Deportes, Cultura, Educación" required />
        </div>
        <div class="form-field">
          <label for="description">Descripción (opcional)</label>
          <input id="description" v-model="form.description" type="text" placeholder="Breve descripción de la categoría" />
        </div>
        <div class="form-field form-button-align">
          <button class="btn" type="submit" :disabled="creating">+ Agregar categoría</button>
        </div>
      </form>
      <p v-if="formError" class="error-message">{{ formError }}</p>
    </div>

    <p v-if="rowError" class="error-message">{{ rowError }}</p>

    <div v-if="pending" class="state-container">
      <div class="spinner"></div>
      <p>Cargando categorías...</p>
    </div>
    <div v-else-if="!data?.categories.length" class="empty-state card">
      <h3>Todavía no hay categorías creadas.</h3>
    </div>

    <div v-else class="table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in data?.categories" :key="cat._id">
            <template v-if="editingId === cat._id">
              <td>
                <input v-model="editForm.name" type="text" class="table-input" />
              </td>
              <td>
                <input v-model="editForm.description" type="text" class="table-input" />
              </td>
              <td>
                <span class="badge" :class="cat.isActive ? 'badge-success' : 'badge-muted'">
                  {{ cat.isActive ? 'activa' : 'inactiva' }}
                </span>
              </td>
              <td>
                <div class="table-actions-group right">
                  <button class="btn btn-sm" @click="saveEdit(cat._id)">Guardar</button>
                  <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancelar</button>
                </div>
              </td>
            </template>
            <template v-else>
              <td><strong>{{ cat.name }}</strong></td>
              <td><span class="table-desc">{{ cat.description || '—' }}</span></td>
              <td>
                <span class="badge" :class="cat.isActive ? 'badge-success' : 'badge-muted'">
                  {{ cat.isActive ? 'activa' : 'inactiva' }}
                </span>
              </td>
              <td>
                <div class="table-actions-group right">
                  <button class="btn btn-secondary btn-sm" @click="startEdit(cat)">Editar</button>
                  <button class="btn btn-secondary btn-sm" @click="handleToggleActive(cat)">
                    {{ cat.isActive ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button class="btn btn-danger btn-sm" @click="askDelete(cat)">Eliminar</button>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Eliminar categoría"
      :message="`¿Estás seguro de que quieres eliminar la categoría “${deleteTarget?.name}”?`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.admin-categories-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-title {
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.form-card-title {
  font-size: 1.15rem;
  margin-bottom: 1rem;
}

.inline-form-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr auto;
  gap: 1rem;
  align-items: flex-end;
}

.form-button-align {
  margin-bottom: 1.25rem;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-surface);
}

.modern-table th,
.modern-table td {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.modern-table th {
  background: var(--bg-muted);
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-desc {
  color: var(--text-muted);
}

.table-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  width: 100%;
}

.table-actions-group {
  display: flex;
  gap: 0.4rem;
}

.table-actions-group.right {
  justify-content: flex-end;
}

.badge-muted {
  background: var(--status-muted-bg);
  color: var(--status-muted-text);
  border-color: var(--status-muted-border);
}

.badge-success {
  background: var(--status-active-bg);
  color: var(--status-active-text);
  border-color: var(--status-active-border);
}

.state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-muted);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .inline-form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .form-button-align {
    margin-bottom: 1.25rem;
  }
}
</style>
