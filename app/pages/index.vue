<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <div class="home-page">
    <section class="hero-card">
      <div class="hero-content">
        <span class="hero-badge">Plataforma Comunitaria</span>
        <h1 class="hero-title">Bienvenido a CommunityHub</h1>
        <p class="hero-subtitle">
          El punto de encuentro para descubrir, organizar y participar en eventos y actividades comunitarias.
        </p>

        <div v-if="authStore.isAuthenticated" class="user-greeting-banner">
          <div class="user-avatar-small">
            {{ authStore.user?.firstName?.charAt(0) || 'U' }}
          </div>
          <div>
            <p class="greeting-text">
              ¡Hola de nuevo, <strong>{{ authStore.user?.firstName }}</strong>!
            </p>
            <p class="greeting-role">
              Tu rol actual es <span class="badge badge-primary">{{ authStore.role }}</span>
            </p>
          </div>
        </div>
        <p v-else class="hero-desc">
          Consulta las actividades disponibles en tu comunidad o crea una cuenta para participar de inmediato.
        </p>

        <div class="hero-actions">
          <NuxtLink class="btn btn-lg" to="/events">Ver actividades</NuxtLink>
          <NuxtLink v-if="!authStore.isAuthenticated" class="btn btn-secondary btn-lg" to="/register">
            Crear cuenta
          </NuxtLink>
          <NuxtLink v-else-if="authStore.isOrganizer" class="btn btn-secondary btn-lg" to="/my-events">
            Mis actividades
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="features-grid">
      <div class="feature-card">
        <div class="feature-icon feature-icon--teal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3>Descubrí eventos</h3>
        <p>Encontrá actividades culturales, deportivas, talleres y reuniones locales organizadas cerca tuyo.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon feature-icon--indigo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3>Organizá comunidad</h3>
        <p>Publicá tus propios eventos, gestioná inscripciones y conectá directamente con participantes.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon feature-icon--rose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3>Notificaciones activas</h3>
        <p>Mantenete al día sobre actualizaciones de tus actividades favoritas y cambios importantes.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 3rem 2rem;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
}

.hero-content {
  max-width: 680px;
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-full);
  background: var(--primary-light);
  color: var(--primary-dark);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-main);
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.user-greeting-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #ffffff;
  border: 1px solid #c7d2fe;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.75rem;
  box-shadow: var(--shadow-sm);
}

.user-avatar-small {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.greeting-text {
  margin: 0;
  font-size: 1rem;
  color: var(--text-main);
}

.greeting-role {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.15rem;
}

.hero-desc {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 1.75rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 0.8rem 1.75rem;
  font-size: 1rem;
  border-radius: var(--radius-md);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.feature-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.feature-icon svg {
  width: 24px;
  height: 24px;
}

.feature-icon--teal {
  background: #cffafe;
  color: #0891b2;
}

.feature-icon--indigo {
  background: #e0e7ff;
  color: #4338ca;
}

.feature-icon--rose {
  background: #ffe4e6;
  color: #e11d48;
}

.feature-card h3 {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .hero-card {
    padding: 2rem 1.25rem;
  }
  .hero-title {
    font-size: 1.85rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
