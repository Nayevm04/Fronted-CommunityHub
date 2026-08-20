// URL del backend Express (mismo origen que usa useApi/getImageUrl). Se resuelve en build-time
// para poder armar las reglas de cache del Service Worker apuntando al backend correcto.
const apiBase = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'
const backendOrigin = apiBase.replace(/\/api\/?$/, '')

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      // @vite-pwa/nuxt no inyecta el link del manifest ni el theme-color automaticamente
      // en esta version: hace falta agregarlos a mano para que el navegador reconozca la PWA.
      link: [
        { rel: 'icon', type: 'image/png', href: '/icons/icon-192.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      meta: [{ name: 'theme-color', content: '#2563eb' }],
    },
  },
  // Evita "composable called outside of a plugin..." cuando el store de Pinia
  // llama a useCookie() despues de un await (ej. en fetchCurrentUser/clearSession).
  experimental: {
    asyncContext: true,
  },
  runtimeConfig: {
    public: {
      // URL base del backend Express. Se centraliza aca para no repetirla en cada archivo.
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    },
  },
  pwa: {
    // Activa la nueva version del Service Worker sola, sin pedirle al usuario que confirme
    // un reload manual (estrategia mas simple para este primer avance).
    registerType: 'autoUpdate',
    devOptions: {
      enabled: true,
    },
    manifest: {
      name: 'CommunityHub',
      short_name: 'CommunityHub',
      description: 'Plataforma comunitaria de actividades y eventos.',
      lang: 'es',
      start_url: '/',
      display: 'standalone',
      // Mismos colores que ya usa la app (.btn y body en assets/css/main.css)
      theme_color: '#2563eb',
      background_color: '#f4f5f7',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // Precachea el build (JS/CSS/iconos) generado por Nuxt
      globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
      // Solo se cachean respuestas publicas y no sensibles: consulta de actividades e imagenes
      // subidas. Nunca /api/auth, /api/users, /api/notifications, ni categorias/uploads (mutaciones).
      runtimeCaching: [
        {
          // GET /api/events y GET /api/events/:id (publicos, sin JWT)
          urlPattern: ({ url, request }) =>
            request.method === 'GET' && url.origin === backendOrigin && /^\/api\/events(\/[^/]+)?$/.test(url.pathname),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'communityhub-events-api',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Imagenes de actividades subidas al backend
          urlPattern: ({ url, request }) =>
            request.method === 'GET' && url.origin === backendOrigin && url.pathname.startsWith('/uploads/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'communityhub-uploaded-images',
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
  },
})
