import type { InvoiceLineItem, PortalInvoiceDetail } from '@/types/portal'

const qtyDecimal = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3 })

/** Prefer billed quantity + unit; fall back to net weight (kg → MT when large). */
export function formatInvoiceLineQuantity(item: InvoiceLineItem): string {
  if (item.quantity != null && item.unit?.trim()) {
    return `${qtyDecimal.format(item.quantity)} ${item.unit.trim()}`
  }
  if (item.netWt == null) return '—'
  if (item.netWt >= 1000) {
    return `${qtyDecimal.format(item.netWt / 1000)} MT`
  }
  return `${qtyDecimal.format(item.netWt)} MT`
}

export function invoiceTotalQuantityLabel(invoice: PortalInvoiceDetail): string {
  const items = invoice.items ?? []
  let mt = 0
  for (const item of items) {
    if (item.quantity != null && (item.unit === 'MT' || !item.unit)) {
      mt += item.quantity
    } else if (item.netWt != null) {
      mt += item.netWt >= 1000 ? item.netWt / 1000 : item.netWt
    }
  }
  if (mt > 0) return `${qtyDecimal.format(mt)} MT`
  if (invoice.totalNetWt != null) {
    const w = invoice.totalNetWt
    return w >= 1000 ? `${qtyDecimal.format(w / 1000)} MT` : `${qtyDecimal.format(w)} MT`
  }
  return '—'
}

export function transportModeLabel(mode: string | null | undefined): string {
  if (!mode) return '—'
  return mode.replace(/_/g, ' ')
}

export function documentTypeLabel(type: string | null | undefined): string {
  if (type === 'material') return 'Material invoice'
  if (type === 'transport') return 'Transport invoice'
  if (type === 'combined') return 'Combined GST invoice'
  return 'Tax invoice'
}
