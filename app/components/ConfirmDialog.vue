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
  <Transition name="fade">
    <div v-if="open" class="confirm-overlay" @click.self="emit('cancel')">
      <div class="confirm-dialog" role="alertdialog" aria-modal="true">
        <div class="confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 v-if="title" class="confirm-title">{{ title }}</h3>
        <p class="confirm-message">{{ message }}</p>

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
  </Transition>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.confirm-dialog {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  text-align: center;
  border: 1px solid var(--border-color);
}

.confirm-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.confirm-icon svg {
  width: 24px;
  height: 24px;
}

.confirm-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.confirm-message {
  color: var(--text-muted);
  font-size: 0.925rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.confirm-actions button {
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
