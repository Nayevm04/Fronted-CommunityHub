const STATUS_LABELS: Record<string, string> = {
  active: 'activa',
  completed: 'finalizada',
  cancelled: 'cancelada',
}

export const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status
