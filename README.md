# Frontend CommunityHub

Este proyecto contiene el frontend de CommunityHub, una aplicación web para consultar, crear y administrar actividades comunitarias. Desde esta interfaz los usuarios pueden registrarse, iniciar sesión, ver actividades, inscribirse, marcar favoritos, consultar notificaciones y acceder a opciones diferentes según su rol.

Para que funcione correctamente, el backend de CommunityHub debe estar ejecutándose y la URL de la API debe estar configurada en el archivo `.env`. El frontend no guarda los datos por sí solo; consume la API del backend para obtener y enviar la información.

## Tecnologías principales

- Nuxt: framework principal para construir la aplicación.
- Vue: creación de vistas y componentes.
- TypeScript: tipado del código del frontend.
- Pinia: manejo del estado de autenticación, favoritos, inscripciones y notificaciones.
- @pinia/nuxt: integración de Pinia con Nuxt.
- Vite PWA: configuración de aplicación progresiva para producción.

## Requisitos

- Node.js
- npm
- Backend de CommunityHub en ejecución
- Archivo `.env` configurado

## Instalación

Desde la carpeta del frontend:

```bash
npm install
```

## Configuración

Crear un archivo `.env` en la raíz del proyecto con la URL base del backend:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

Esta URL debe coincidir con el puerto donde se está ejecutando el backend.

## Ejecución local

Para ejecutar el frontend en modo desarrollo, usar:

```bash
npm run dev
```

El proyecto se ejecuta localmente en el puerto `3001`, según el script configurado.

## Otros comandos disponibles

```bash
npm run build
```

Genera la versión de producción de la aplicación.

```bash
npm run preview
```

Permite previsualizar la versión generada, usando el puerto `3001`.

```bash
npm run generate
```

Genera una versión estática del proyecto.

```bash
npm run typecheck
```

Ejecuta la revisión de tipos del proyecto.

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Navegación por actividades comunitarias.
- Filtros de actividades por búsqueda, fecha, ubicación y cupo disponible.
- Vista de detalle de actividad.
- Inscripción y cancelación de inscripción en actividades.
- Marcado de actividades como favoritas.
- Perfil de usuario con imagen.
- Dashboard para usuarios autenticados.
- Gestión de actividades propias para organizadores.
- Administración de usuarios, actividades y categorías para administradores.
- Consulta y marcado de notificaciones como leídas.
- Indicador de conexión y manejo básico de acciones sin conexión.

## Pantallas principales

- `/`: página inicial de la aplicación.
- `/events`: listado de actividades comunitarias.
- `/events/create`: creación de actividades.
- `/events/[id]`: detalle de una actividad.
- `/events/[id]/edit`: edición de una actividad.
- `/login` y `/register`: acceso y registro de usuarios.
- `/dashboard`: resumen para usuarios autenticados.
- `/my-events`: actividades creadas por el organizador.
- `/my-registrations`: inscripciones del usuario.
- `/my-favorites`: actividades favoritas.
- `/notifications`: notificaciones del usuario.
- `/profile`: información del perfil.
- `/admin/users`: administración de usuarios.
- `/admin/events`: administración de actividades.
- `/admin/categories`: administración de categorías.

## Estructura principal

- `app/app.vue`: componente principal de la aplicación.
- `app/pages`: pantallas principales de la aplicación.
- `app/components`: componentes reutilizables.
- `app/stores`: estado global con Pinia.
- `app/composables/useApi.ts`: conexión centralizada con la API del backend.
- `app/middleware`: validaciones de acceso por sesión y rol.
- `app/utils`: funciones auxiliares para fechas, errores, imágenes y estados.
- `app/assets/css`: estilos principales.
- `public`: íconos y archivos públicos de la aplicación.

## Acceso por roles

El frontend muestra diferentes opciones según el rol recibido desde el backend:

- `user`: puede ver actividades, inscribirse y guardar favoritos.
- `organizer`: puede administrar sus propias actividades.
- `admin`: puede administrar usuarios, actividades y categorías.

Las rutas protegidas utilizan middleware para validar sesión y rol antes de permitir el acceso.

## Configuración PWA y modo offline

El proyecto incluye configuración PWA para producción. El módulo PWA se activa fuera del modo desarrollo, por lo que para probar el Service Worker y la caché se debe generar y previsualizar la aplicación:

```bash
npm run build
npm run preview
```

La funcionalidad offline principal permite consultar actividades previamente cargadas. Si el usuario pierde conexión, la aplicación muestra un aviso visible indicando que está sin Internet.

Las demás secciones que dependen de información privada del usuario, como dashboard, inscripciones, favoritos o actividades propias, muestran un mensaje indicando que la sección no está disponible sin conexión. Cuando la conexión vuelve, la aplicación intenta cargar nuevamente la información.

## Relación con el backend

El frontend consume la API REST del backend mediante `NUXT_PUBLIC_API_BASE_URL`. Para usar la aplicación completa de forma local, se recomienda ejecutar ambos proyectos al mismo tiempo:

- Backend: `npm run dev` en el puerto `3000`.
- Frontend: `npm run dev` en el puerto `3001`.
