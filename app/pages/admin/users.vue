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
  <div class="admin-users-page">
    <div class="page-header">
      <h1 class="page-title">Gestión de Usuarios</h1>
      <p class="page-subtitle">Administrá los roles y permisos de los usuarios registrados en CommunityHub</p>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

    <div v-if="pending" class="state-container">
      <div class="spinner"></div>
      <p>Cargando usuarios...</p>
    </div>

    <div v-else class="table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo Electrónico</th>
            <th>Rol Asignado</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in data?.users" :key="user._id">
            <td>
              <div class="user-cell">
                <div class="user-avatar-mini">
                  {{ user.firstName?.charAt(0) || 'U' }}
                </div>
                <div>
                  <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                </div>
              </div>
            </td>
            <td>
              <span class="user-email">{{ user.email }}</span>
            </td>
            <td>
              <div class="role-select-wrapper">
                <select v-model="user.role" class="role-select" :class="`role-select--${user.role}`">
                  <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
            </td>
            <td>
              <div class="table-actions-group right">
                <button
                  class="btn btn-secondary btn-sm"
                  :disabled="savingId === user._id"
                  @click="handleRoleSave(user)"
                >
                  {{ savingId === user._id ? 'Guardando...' : 'Guardar rol' }}
                </button>
                <button class="btn btn-danger btn-sm" @click="askDelete(user)">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Eliminar usuario"
      :message="`¿Estás seguro de que quieres eliminar al usuario “${deleteTarget?.firstName} ${deleteTarget?.lastName}”?`"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.admin-users-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-title {
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-mini {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-dark);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.user-email {
  color: var(--text-muted);
}

.role-select-wrapper {
  display: inline-block;
}

.role-select {
  padding: 0.3rem 1.8rem 0.3rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border: 1px solid var(--border-color);
}

.role-select--admin {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.role-select--organizer {
  background-color: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.role-select--user {
  background-color: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

.table-actions-group {
  display: flex;
  gap: 0.4rem;
}

.table-actions-group.right {
  justify-content: flex-end;
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
</style>
