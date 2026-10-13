import type { PortalDashboard, PortalProfile } from '@/types/portal'
import type { PortalProfile as SessionProfile } from './session'

function asNumber(value: unknown): number | null {
  if (value == null) return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function profileFromRaw(
  body: Record<string, unknown>,
  session: SessionProfile | null,
): PortalProfile {
  const profileRaw =
    body.profile && typeof body.profile === 'object'
      ? (body.profile as Record<string, unknown>)
      : null
  const customerRaw =
    body.customer && typeof body.customer === 'object'
      ? (body.customer as Record<string, unknown>)
      : null
  const src = profileRaw ?? customerRaw

  return {
    customerId:
      asNumber(profileRaw?.customerId ?? customerRaw?.id) ?? session?.customerId ?? 0,
    name:
      (typeof profileRaw?.name === 'string' && profileRaw.name) ||
      (typeof customerRaw?.name === 'string' && customerRaw.name) ||
      (typeof body.customerName === 'string' && body.customerName) ||
      session?.customerName ||
      'Customer',
    code:
      typeof src?.code === 'string'
        ? src.code
        : typeof body.customerCode === 'string'
          ? body.customerCode
          : undefined,
    gstNo: typeof src?.gstNo === 'string' ? src.gstNo : null,
    phone: typeof src?.phone === 'string' ? src.phone : null,
    address: typeof src?.address === 'string' ? src.address : null,
    email: typeof src?.email === 'string' ? src.email : null,
    creditLimit: asNumber(src?.creditLimit ?? body.creditLimit),
    status: typeof src?.status === 'string' ? src.status : null,
  }
}

/** Map GET /portal/dashboard to UI model (supports legacy field names). */
export function normalizePortalDashboard(
  raw: unknown,
  session: SessionProfile | null,
): PortalDashboard {
  const body = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const profile = profileFromRaw(body, session)

  const outstanding =
    asNumber(body.outstanding) ??
    asNumber(body.outstandingBalance) ??
    asNumber(body.creditStatus && typeof body.creditStatus === 'object'
      ? (body.creditStatus as Record<string, unknown>).outstanding
      : null) ??
    0

  return {
    profile,
    creditStatus:
      body.creditStatus && typeof body.creditStatus === 'object'
        ? (body.creditStatus as PortalDashboard['creditStatus'])
        : null,
    outstanding,
    aging:
      body.aging && typeof body.aging === 'object'
        ? (body.aging as PortalDashboard['aging'])
        : null,
    totalDispatches: asNumber(body.totalDispatches) ?? undefined,
    openInvoices: asNumber(body.openInvoices) ?? undefined,
    recentDispatches: asArray(
      body.recentDispatches ?? body.recentTrips,
    ),
    recentInvoices: asArray(body.recentInvoices),
  }
}
