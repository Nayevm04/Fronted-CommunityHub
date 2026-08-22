// URL del backend Express (mismo origen que usa useApi/getImageUrl). Se resuelve en build-time
// para poder armar las reglas de cache del Service Worker apuntando al backend correcto.
const apiBase = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'
const backendOrigin = apiBase.replace(/\/api\/?$/, '')
const isDev = process.env.NODE_ENV === 'development'
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    ...(!isDev ? ['@vite-pwa/nuxt'] : []),
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      // @vite-pwa/nuxt no inyecta el link del manifest ni el theme-color automaticamente
      // en esta version: hace falta agregarlos a mano para que el navegador reconozca la PWA.
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        // Solo se agrega fuera de dev: con devOptions.enabled en false, el service worker
        // y el manifest no existen en dev, y este link causaba warnings de Vue Router.
        ...(!isDev
          ? [{ rel: 'manifest', href: '/manifest.webmanifest' } as const]
          : []),
      ],
      meta: [{ name: 'theme-color', content: '#4f46e5' }],
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
  ...(!isDev
    ? {
        pwa: {
          // Activa la nueva version del Service Worker sola, sin pedirle al usuario que confirme
          // un reload manual (estrategia mas simple para este primer avance).
          registerType: 'autoUpdate',
          manifest: {
            name: 'CommunityHub',
            short_name: 'CommunityHub',
            description: 'Plataforma comunitaria de actividades y eventos.',
            lang: 'es',
            start_url: '/',
            display: 'standalone',
            // Mismos colores que usa la app (.btn y body en assets/css/main.css)
            theme_color: '#4f46e5',
            background_color: '#f8fafc',
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
                urlPattern: new RegExp(`^${escapeRegExp(backendOrigin)}/api/events(/[^/]+)?$`),
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
                urlPattern: new RegExp(`^${escapeRegExp(backendOrigin)}/uploads/`),
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
      }
    : {}),
})
