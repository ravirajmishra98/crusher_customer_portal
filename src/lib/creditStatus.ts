import type { CreditStatusLevel } from '@/types/portal'

export function creditStatusLabel(status: CreditStatusLevel | string | undefined): string {
  switch (status) {
    case 'OK':
      return 'Good standing'
    case 'WARNING':
      return 'Credit warning'
    case 'SOFT_BLOCK':
      return 'Soft block'
    case 'HARD_BLOCK':
      return 'Hard block'
    default:
      return status ?? '—'
  }
}

export function creditStatusBadgeClass(status: CreditStatusLevel | string | undefined): string {
  switch (status) {
    case 'OK':
      return 'badge-status badge-completed'
    case 'WARNING':
      return 'badge-status badge-pending'
    case 'SOFT_BLOCK':
    case 'HARD_BLOCK':
      return 'badge-status badge-cancelled'
    default:
      return 'badge-status badge-default'
  }
}
