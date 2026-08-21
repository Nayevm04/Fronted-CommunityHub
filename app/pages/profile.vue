<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
</script>

<template>
  <div class="profile-page">
    <div class="card profile-card">
      <div class="profile-header">
        <div class="avatar-wrapper">
          <img
            v-if="authStore.user?.profileImage"
            :src="getImageUrl(authStore.user.profileImage) ?? undefined"
            alt="Foto de perfil"
            class="profile-avatar-img"
          />
          <div v-else class="profile-avatar-fallback">
            {{ authStore.user?.firstName?.charAt(0) || 'U' }}
          </div>
        </div>

        <div class="profile-title-block">
          <h1>{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</h1>
          <span class="role-badge" :class="`role-badge--${authStore.user?.role}`">
            {{ authStore.user?.role }}
          </span>
        </div>
      </div>

      <div class="profile-details-grid">
        <div class="detail-box">
          <span class="detail-label">Nombre completo</span>
          <p class="detail-value">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</p>
        </div>

        <div class="detail-box">
          <span class="detail-label">Correo electrónico</span>
          <p class="detail-value">{{ authStore.user?.email }}</p>
        </div>

        <div class="detail-box">
          <span class="detail-label">Rol en la comunidad</span>
          <p class="detail-value text-capitalize">{{ authStore.user?.role }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.profile-card {
  max-width: 580px;
  width: 100%;
  padding: 2.25rem;
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-lg);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.75rem;
  margin-bottom: 1.75rem;
  border-bottom: 1px solid var(--border-color);
}

.avatar-wrapper {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--primary-light);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-fallback {
  width: 100%;
  height: 100%;
  background: var(--primary);
  color: #fff;
  font-size: 2.2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-title-block h1 {
  font-size: 1.5rem;
  margin-bottom: 0.4rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--bg-muted);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.role-badge--admin {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.role-badge--organizer {
  background: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.role-badge--user {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

.profile-details-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-box {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  padding: 0.85rem 1.15rem;
  border-radius: var(--radius-md);
}

.detail-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.2rem;
}

.detail-value {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
}

.text-capitalize {
  text-transform: capitalize;
}

@media (max-width: 520px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
