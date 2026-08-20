<script setup lang="ts">
// Modal de confirmacion generico. No ejecuta nada por si solo, solo emite confirm/cancel.
defineProps<{
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div v-if="open" class="confirm-overlay" @click.self="emit('cancel')">
    <div class="confirm-dialog" role="alertdialog" aria-modal="true">
      <h3 v-if="title">{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="confirm-actions">
        <button type="button" class="btn btn-secondary" @click="emit('cancel')">
          {{ cancelText || 'Cancelar' }}
        </button>
        <button type="button" class="btn btn-danger" @click="emit('confirm')">
          {{ confirmText || 'Eliminar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}
.confirm-dialog {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.25rem;
}
</style>
