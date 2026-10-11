export function formatInrAmount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = value.slice(0, 10)
  return d
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return value
  }
}
