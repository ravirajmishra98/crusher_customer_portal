export type PortalLoginRequest = {
  email?: string
  code?: string
  password: string
}

export type PortalLoginResponse = {
  token: string
  expiresIn?: number
  customerId: number
  customerName: string
  refreshToken?: string
  mustChangePassword?: boolean
  passwordResetRequired?: boolean
}

export type PortalChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export type PortalRefreshRequest = {
  refreshToken: string
}

export type PortalProfile = {
  customerId: number
  name: string
  code?: string
  gstNo?: string | null
  phone?: string | null
  address?: string | null
  email?: string | null
  creditLimit?: number | null
  status?: string | null
}

export type CreditStatusLevel = 'OK' | 'WARNING' | 'SOFT_BLOCK' | 'HARD_BLOCK'

export type CreditStatus = {
  status: CreditStatusLevel
  outstanding: number
  creditLimit: number
  usedPct: number
  openTrips?: number
}

export type PortalAging = {
  current?: number
  days31_60?: number
  days61_90?: number
  days90plus?: number
  total?: number
}

export type PortalOutstanding = {
  outstanding: number
  creditLimit?: number | null
  available?: number | null
  aging?: PortalAging
}

export type PortalWeighmentSummary = {
  id: number
  challanNo?: string | null
  vehicleNo: string
  materialName: string
  companyName: string
  netWt?: number | null
  rate?: number | null
  amount?: number | null
  totalAmt?: number | null
  status:
    | 'PENDING_APPROVAL'
    | 'PENDING_LOAD'
    | 'PENDING_GROSS'
    | 'COMPLETED'
    | 'CANCELLED_NO_LOAD'
    | 'CANCELLED_CREDIT_REJECTED'
  tareTime: string
  grossTime?: string | null
}

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED'

export type PortalInvoice = {
  id: number
  invoiceNo: string
  invoiceDate: string
  status?: InvoiceStatus | string | null
  totalAmt?: number | null
  subtotal?: number | null
  gstAmt?: number | null
  companyName?: string | null
  customerName?: string | null
  totalNetWt?: number | null
}

export type InvoiceLineItem = {
  id?: number
  challanNo?: string | null
  vehicleNo?: string | null
  materialName?: string | null
  netWt?: number | null
  rate?: number | null
  amount?: number | null
  totalAmt?: number | null
  description?: string | null
}

export type PortalInvoiceDetail = PortalInvoice & {
  customerAddress?: string | null
  customerGstNo?: string | null
  companyAddress?: string | null
  companyGstNo?: string | null
  billingPeriodFrom?: string | null
  billingPeriodTo?: string | null
  notes?: string | null
  items?: InvoiceLineItem[]
}

export type LedgerEntry = {
  date: string
  type: 'SALE' | 'PAYMENT'
  ref?: string | null
  weighmentId?: number | null
  invoiceId?: number | null
  invoiceNo?: string | null
  vehicleNo?: string | null
  debit?: number | null
  credit?: number | null
  netWt?: number | null
  balance?: number | null
}

export type PortalLedger = {
  view?: 'dispatch' | 'invoice'
  openingBalance?: number
  closingBalance?: number
  entries: LedgerEntry[]
}

export type PortalDashboard = {
  profile: PortalProfile
  creditStatus?: CreditStatus | null
  outstanding: number
  aging?: PortalAging | null
  totalDispatches?: number
  openInvoices?: number
  recentDispatches: PortalWeighmentSummary[]
  recentInvoices: PortalInvoice[]
}
