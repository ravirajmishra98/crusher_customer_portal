import type {
  PortalDashboard,
  PortalInvoice,
  PortalInvoiceDetail,
  PortalLedger,
  PortalLoginRequest,
  PortalLoginResponse,
  PortalOutstanding,
  PortalProfile,
  PortalWeighmentSummary,
} from '@/types/portal'
import type { PortalProfile as SessionProfile } from './session'

export const PORTAL_BYPASS_TOKEN = 'dev-bypass-portal-token'

const MATERIALS = ['20mm Metal', '10mm Metal', 'Crush Sand', 'Dust', 'Rubber metal'] as const
const STATUSES: PortalWeighmentSummary['status'][] = [
  'COMPLETED',
  'PENDING_GROSS',
  'PENDING_LOAD',
  'PENDING_APPROVAL',
  'CANCELLED_NO_LOAD',
]

export function mockPortalLogin(body: PortalLoginRequest): PortalLoginResponse {
  const id = (body.email ?? body.code ?? 'demo').trim()
  return {
    token: PORTAL_BYPASS_TOKEN,
    customerId: 0,
    customerName: id.includes('@') ? id.split('@')[0] : id || 'Demo customer',
    refreshToken: 'dev-refresh-token',
  }
}

function mockDispatches(count: number): PortalWeighmentSummary[] {
  return Array.from({ length: count }, (_, i) => {
    const id = 1000 + i
    const status = STATUSES[i % STATUSES.length]
    const completed = status === 'COMPLETED'
    const tare = new Date(Date.now() - 86400000 * (i * 0.35))

    return {
      id,
      challanNo: `DEMO/2026/${String(id).padStart(5, '0')}`,
      vehicleNo: `MH-12-AB-${1000 + i}`,
      materialName: MATERIALS[i % MATERIALS.length],
      companyName: 'Demo Plant',
      netWt: completed ? 12 + (i % 15) : null,
      rate: completed ? 850 : null,
      amount: completed ? 14000 + i * 100 : null,
      totalAmt: completed ? 14700 + i * 105 : null,
      status,
      tareTime: tare.toISOString(),
      grossTime: completed ? new Date(tare.getTime() + 3600000).toISOString() : null,
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
      totalAmt: 85_000 + i * 4500,
      invoiceDate: d.toISOString().slice(0, 10),
      status: i % 3 === 0 ? 'CONFIRMED' : 'DRAFT',
      companyName: 'Demo Plant',
    }
  })
}

export function mockPortalMe(session: SessionProfile | null): PortalProfile {
  const name = session?.customerName ?? 'Demo customer'
  return {
    customerId: session?.customerId ?? 0,
    name,
    code: 'DEMO-001',
    email: 'demo@example.com',
    phone: '9876543210',
    address: 'Solapur, Maharashtra',
    gstNo: '27AAAAA0000A1Z5',
    creditLimit: 1_000_000,
    status: 'Active',
  }
}

export function mockPortalOutstanding(_session: SessionProfile | null): PortalOutstanding {
  return {
    outstanding: 125_430.5,
    creditLimit: 1_000_000,
    available: 874_569.5,
    aging: {
      current: 80_000,
      days31_60: 25_000,
      days61_90: 12_430.5,
      days90plus: 8_000,
      total: 125_430.5,
    },
  }
}

export function mockPortalLedger(): PortalLedger {
  return {
    openingBalance: 100_000,
    closingBalance: 125_430.5,
    entries: [
      {
        date: '2026-03-01',
        type: 'SALE',
        ref: 'INV/2026/0801',
        invoiceNo: 'INV/2026/0801',
        debit: 45_000,
        balance: 145_000,
      },
      {
        date: '2026-03-05',
        type: 'PAYMENT',
        ref: 'NEFT-001',
        credit: 50_000,
        balance: 95_000,
      },
      {
        date: '2026-03-10',
        type: 'SALE',
        ref: 'INV/2026/0802',
        invoiceNo: 'INV/2026/0802',
        debit: 30_430.5,
        balance: 125_430.5,
      },
    ],
  }
}

export function mockPortalDashboard(session: SessionProfile | null): PortalDashboard {
  const profile = mockPortalMe(session)
  const recentDispatches = mockDispatches(12)
  const recentInvoices = mockInvoices(8)

  return {
    profile,
    creditStatus: {
      status: 'WARNING',
      outstanding: 125_430.5,
      creditLimit: 1_000_000,
      usedPct: 13,
      openTrips: 2,
    },
    outstanding: 125_430.5,
    aging: mockPortalOutstanding(session).aging,
    totalDispatches: 28,
    openInvoices: 3,
    recentDispatches,
    recentInvoices,
  }
}

export function mockPortalDispatches(): PortalWeighmentSummary[] {
  return mockDispatches(28)
}

export function mockPortalDispatch(id: number): PortalWeighmentSummary {
  return mockDispatches(28).find((d) => d.id === id) ?? mockDispatches(1)[0]
}

export function mockPortalInvoices(): PortalInvoice[] {
  return mockInvoices(18)
}

export function mockPortalInvoice(id: number): PortalInvoiceDetail {
  const base = mockInvoices(18).find((i) => i.id === id) ?? mockInvoices(1)[0]
  const materialAmt = 8470
  const transportAmt = 100
  const subtotal = materialAmt + transportAmt
  const gstAmt = 428.5
  return {
    ...base,
    status: 'CONFIRMED',
    documentType: 'combined',
    transportInvoiceMode: 'integrated',
    subtotal,
    gstAmt,
    totalAmt: subtotal + gstAmt,
    totalNetWt: 10_000,
    customerName: 'RK works',
    customerAddress: 'Plot 12, Industrial Area, Solapur, Maharashtra 413001',
    customerGstNo: '27AABCR1234F1Z5',
    companyAddress: 'SuperCrusher Unit 1, MIDC Kurduwadi, Maharashtra',
    companyGstNo: '27AAECS1234G1Z2',
    billingPeriodFrom: '2026-03-01',
    billingPeriodTo: '2026-03-15',
    einvoicingRequired: false,
    createdAt: new Date().toISOString(),
    notes: 'Thank you for your business. Please quote invoice number on remittance.',
    items: [
      {
        id: 5577,
        weighmentId: 1000,
        challanNo: 'DEMO/2026/01001',
        grossTime: new Date().toISOString(),
        vehicleNo: 'MH-12-AB-1000',
        materialName: '20mm Metal',
        netWt: 10_000,
        quantity: 10,
        unit: 'MT',
        rate: 847,
        amount: materialAmt,
        itemType: 'integrated',
        gstRate: 5,
        taxableAmt: subtotal,
        gstAmt,
        transportApplicable: true,
        transportRate: 10,
        transportAmt,
        totalAmt: subtotal + gstAmt,
      },
    ],
  }
}
