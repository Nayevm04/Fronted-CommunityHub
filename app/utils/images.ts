// Una imagen puede ser una URL externa (http/https) o una ruta relativa devuelta por
// POST /api/uploads (ej. "/uploads/xxxx.jpg"). Esta funcion arma la URL final para mostrarla.
export const getImageUrl = (image?: string | null) => {
  if (!image) return null
  if (/^https?:\/\//i.test(image)) return image

  const config = useRuntimeConfig()
  const backendOrigin = config.public.apiBase.replace(/\/api\/?$/, '')
  return `${backendOrigin}${image}`
}
