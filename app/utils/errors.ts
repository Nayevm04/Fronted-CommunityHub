// Extrae un mensaje entendible de un error de $fetch. El backend siempre responde
// { success:false, message } en errores, asi que se prioriza ese mensaje.
export const getErrorMessage = (error: unknown, fallback = 'Ocurrio un error, intenta nuevamente') => {
  const message = (error as any)?.data?.message
  return typeof message === 'string' && message ? message : fallback
}
