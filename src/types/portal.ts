export type PortalLoginRequest = {
  code: string
  password: string
}

export type PortalLoginResponse = {
  token: string
  customerId: number
  customerName: string
}

export type PortalCustomer = {
  id: number
  code?: string
  name: string
  phone?: string | null
  gstNo?: string | null
  creditLimit?: number | null
  outstandingBalance?: number | null
  blocked?: boolean | null
  status?: string | null
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
  status: 'PENDING_LOAD' | 'PENDING_GROSS' | 'COMPLETED' | 'CANCELLED_NO_LOAD'
  tareTime: string
  grossTime?: string | null
}

export type PortalPayment = {
  id: number
  paymentNo: string
  amount: number
  mode: 'Cash' | 'Cheque' | 'NEFT' | 'RTGS' | 'UPI'
  reference?: string | null
  paymentDate: string
}

export type PortalInvoice = {
  id: number
  invoiceNo: string
  amount: number
  invoiceDate: string
  status?: string | null
}

export type PortalDashboard = {
  customer: PortalCustomer
  recentTrips: PortalWeighmentSummary[]
  outstandingBalance: number
  recentPayments: PortalPayment[]
  /** When the API provides invoice history */
  recentInvoices?: PortalInvoice[]
}
