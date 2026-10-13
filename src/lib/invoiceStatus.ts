import type { InvoiceStatus } from '@/types/portal'

export function invoiceStatusLabel(status: InvoiceStatus | string | null | undefined): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed'
    case 'DRAFT':
      return 'Draft'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status ?? '—'
  }
}

export function invoiceStatusBadgeClass(status: InvoiceStatus | string | null | undefined): string {
  switch (status) {
    case 'CONFIRMED':
      return 'badge-status badge-completed'
    case 'DRAFT':
      return 'badge-status badge-pending'
    case 'CANCELLED':
      return 'badge-status badge-cancelled'
    default:
      return 'badge-status badge-default'
  }
}
