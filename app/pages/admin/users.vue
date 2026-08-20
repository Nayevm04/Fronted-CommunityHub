<script setup lang="ts">
import type { AuthUser, UserRole } from '~/stores/auth'

definePageMeta({ middleware: 'admin' })

const { apiFetch } = useApi()

const { data, pending, refresh } = await useAsyncData('admin-users', () =>
  apiFetch<{ users: AuthUser[] }>('/users')
)

const errorMessage = ref('')
const successMessage = ref('')
const savingId = ref<string | null>(null)

const handleRoleSave = async (user: AuthUser) => {
  errorMessage.value = ''
  successMessage.value = ''
  savingId.value = user._id
  try {
    await apiFetch(`/users/${user._id}`, { method: 'PUT', body: { role: user.role } })
    successMessage.value = `Rol de ${user.firstName} actualizado a ${user.role}`
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'No se pudo actualizar el rol')
    await refresh() // revierte el select al valor real si la operacion fallo
  } finally {
    savingId.value = null
  }
}

const deleteTarget = ref<AuthUser | null>(null)

const askDelete = (user: AuthUser) => {
  deleteTarget.value = user
}

const cancelDelete = () => {
  deleteTarget.value = null
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  const id = deleteTarget.value._id
  deleteTarget.value = null
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await apiFetch(`/users/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'No se pudo eliminar el usuario')
  }
}

const roles: UserRole[] = ['user', 'organizer', 'admin']
</script>

<template>
  <div>
    <h1>Usuarios</h1>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="successMessage">{{ successMessage }}</p>
    <p v-if="pending">Cargando...</p>

    <table v-else class="card">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in data?.users" :key="user._id">
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>
            <select v-model="user.role">
              <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </td>
          <td>
            <button class="btn" :disabled="savingId === user._id" @click="handleRoleSave(user)">
              Guardar rol
            </button>
            <button class="btn btn-danger" @click="askDelete(user)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Eliminar usuario"
      :message="`¿Estás seguro de que quieres eliminar al usuario “${deleteTarget?.firstName} ${deleteTarget?.lastName}”?`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
