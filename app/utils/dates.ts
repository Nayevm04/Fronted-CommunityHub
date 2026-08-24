const pad = (n: number) => String(n).padStart(2, '0')

// Fecha de hoy en hora LOCAL, no UTC (toISOString() usa UTC y puede adelantar un dia)
export const getLocalDateString = (date: Date = new Date()) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Combina "YYYY-MM-DD" + "HH:mm" interpretandolos como hora LOCAL del navegador
export const combineLocalDateAndHour = (date: string, hour: string) => {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number)
  const [hours = 0, minutes = 0] = hour.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

// true si la fecha+hora seleccionadas ya pasaron (comparando hora local, no UTC)
export const isPastDateTime = (date: string, hour: string) => {
  if (!date || !hour) return false
  return combineLocalDateAndHour(date, hour).getTime() < Date.now()
}

// El backend guarda "date" como el dia calendario anclado a medianoche UTC (ver event.service.js).
// Formatear con toLocaleDateString() normal convierte esa medianoche UTC a hora local del navegador
// y en husos negativos (ej. Costa Rica, UTC-6) muestra el dia anterior. Forzamos timeZone: 'UTC'
// para leer el mismo dia calendario que se eligio al crear/editar la actividad.
export const formatEventDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString(undefined, { timeZone: 'UTC' })
}
