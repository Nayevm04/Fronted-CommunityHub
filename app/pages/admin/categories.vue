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
  <div>
    <h1>Categorías</h1>

    <div class="card">
      <h2>Nueva categoría</h2>
      <form @submit.prevent="handleCreate">
        <div class="form-field">
          <label for="name">Nombre</label>
          <input id="name" v-model="form.name" type="text" required />
        </div>
        <div class="form-field">
          <label for="description">Descripción (opcional)</label>
          <input id="description" v-model="form.description" type="text" />
        </div>
        <p v-if="formError" class="error-message">{{ formError }}</p>
        <button class="btn" type="submit" :disabled="creating">+ Nueva categoría</button>
      </form>
    </div>

    <p v-if="rowError" class="error-message">{{ rowError }}</p>
    <p v-if="pending">Cargando...</p>
    <p v-else-if="!data?.categories.length">Todavía no hay categorías creadas.</p>

    <table v-else class="card">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in data?.categories" :key="cat._id">
          <template v-if="editingId === cat._id">
            <td><input v-model="editForm.name" type="text" /></td>
            <td><input v-model="editForm.description" type="text" /></td>
            <td><span class="badge">{{ cat.isActive ? 'activa' : 'inactiva' }}</span></td>
            <td>
              <button class="btn" @click="saveEdit(cat._id)">Guardar</button>
              <button class="btn btn-secondary" @click="cancelEdit">Cancelar</button>
            </td>
          </template>
          <template v-else>
            <td>{{ cat.name }}</td>
            <td>{{ cat.description }}</td>
            <td><span class="badge">{{ cat.isActive ? 'activa' : 'inactiva' }}</span></td>
            <td>
              <button class="btn" @click="startEdit(cat)">Editar</button>
              <button class="btn btn-secondary" @click="handleToggleActive(cat)">
                {{ cat.isActive ? 'Desactivar' : 'Activar' }}
              </button>
              <button class="btn btn-danger" @click="askDelete(cat)">Eliminar</button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Eliminar categoría"
      :message="`¿Estás seguro de que quieres eliminar la categoría “${deleteTarget?.name}”?`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
