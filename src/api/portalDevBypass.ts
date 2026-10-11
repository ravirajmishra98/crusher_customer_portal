import type {
  PortalDashboard,
  PortalLoginRequest,
  PortalLoginResponse,
  PortalPayment,
  PortalWeighmentSummary,
  PortalInvoice,
} from '@/types/portal'
import type { PortalProfile } from './session'

/** Token stored when bypass is on — never sent to a real API while bypass remains enabled. */
export const PORTAL_BYPASS_TOKEN = 'dev-bypass-portal-token'

const MATERIALS = ['20mm Metal', '10mm Metal', 'Crush Sand', 'Dust', 'Rubber metal'] as const
const STATUSES: PortalWeighmentSummary['status'][] = [
  'COMPLETED',
  'PENDING_GROSS',
  'PENDING_LOAD',
  'CANCELLED_NO_LOAD',
]
const PAYMENT_MODES: PortalPayment['mode'][] = ['NEFT', 'RTGS', 'UPI', 'Cheque', 'Cash']

export function mockPortalLogin(body: PortalLoginRequest): PortalLoginResponse {
  const code = body.code.trim()
  return {
    token: PORTAL_BYPASS_TOKEN,
    customerId: 0,
    customerName: code || 'Demo customer',
  }
}

function mockTrips(count: number): PortalWeighmentSummary[] {
  return Array.from({ length: count }, (_, i) => {
    const id = 1000 + i
    const status = STATUSES[i % STATUSES.length]
    const completed = status === 'COMPLETED'
    const daysAgo = i * 0.35
    const tare = new Date(Date.now() - 86400000 * daysAgo)

    return {
      id,
      challanNo: `DEMO/2026/${String(id).padStart(5, '0')}`,
      vehicleNo: `MH-12-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(66 + (i % 20))}-${1000 + i}`,
      materialName: MATERIALS[i % MATERIALS.length],
      companyName: i % 3 === 0 ? 'North Plant' : 'Demo Plant',
      netWt: completed ? 12 + (i % 15) + (i % 10) / 10 : null,
      rate: completed ? 780 + (i % 5) * 20 : null,
      amount: completed ? 14000 + i * 120 : null,
      totalAmt: completed ? 14700 + i * 125 : null,
      status,
      tareTime: tare.toISOString(),
      grossTime: completed ? new Date(tare.getTime() + 3600000).toISOString() : null,
    }
  })
}

function mockPayments(count: number): PortalPayment[] {
  return Array.from({ length: count }, (_, i) => {
    const id = 500 + i
    const d = new Date()
    d.setDate(d.getDate() - i * 4)
    return {
      id,
      paymentNo: `PAY-DEMO-${String(id).padStart(4, '0')}`,
      amount: 25_000 + (i % 7) * 10_000,
      mode: PAYMENT_MODES[i % PAYMENT_MODES.length],
      reference: i % 2 === 0 ? `REF-${id}` : null,
      paymentDate: d.toISOString().slice(0, 10),
    }
  })
}

function mockInvoices(count: number): PortalInvoice[] {
  return Array.from({ length: count }, (_, i) => {
    const id = 800 + i
    const d = new Date()
    d.setDate(d.getDate() - i * 6)
    return {
      id,
      invoiceNo: `INV/2026/${String(id).padStart(4, '0')}`,
      amount: 85_000 + i * 4500,
      invoiceDate: d.toISOString().slice(0, 10),
      status: i % 4 === 0 ? 'paid' : i % 3 === 0 ? 'partial' : 'open',
    }
  })
}

export function mockPortalDashboard(profile: PortalProfile | null): PortalDashboard {
  const name = profile?.customerName ?? 'Demo customer'
  const code =
    profile?.customerName && profile.customerName.length <= 12
      ? profile.customerName.toUpperCase().replace(/\s+/g, '-')
      : 'DEMO-001'

  return {
    customer: {
      id: profile?.customerId ?? 0,
      code,
      name,
      creditLimit: 1_000_000,
      blocked: false,
      status: 'Active',
    },
    outstandingBalance: 125_430.5,
    recentTrips: mockTrips(28),
    recentPayments: mockPayments(18),
    recentInvoices: mockInvoices(14),
  }
}
