import type { PortalWeighmentSummary } from '@/types/portal'

export function tripStatusLabel(status: PortalWeighmentSummary['status']): string {
  switch (status) {
    case 'COMPLETED':
      return 'Completed'
    case 'PENDING_GROSS':
      return 'At plant'
    case 'PENDING_LOAD':
      return 'Pending load'
    case 'PENDING_APPROVAL':
      return 'Pending approval'
    case 'CANCELLED_NO_LOAD':
      return 'Cancelled'
    case 'CANCELLED_CREDIT_REJECTED':
      return 'Credit rejected'
    default:
      return status
  }
}

export function tripStatusBadgeClass(status: PortalWeighmentSummary['status']): string {
  switch (status) {
    case 'COMPLETED':
      return 'badge-status badge-completed'
    case 'PENDING_GROSS':
    case 'PENDING_LOAD':
    case 'PENDING_APPROVAL':
      return 'badge-status badge-pending'
    case 'CANCELLED_NO_LOAD':
    case 'CANCELLED_CREDIT_REJECTED':
      return 'badge-status badge-cancelled'
    default:
      return 'badge-status badge-default'
  }
}
