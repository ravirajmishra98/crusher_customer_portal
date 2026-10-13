import { isPortalLoginBypassEnabled } from '@/config/env'
import type {
  CreditStatus,
  PortalChangePasswordRequest,
  PortalDashboard,
  PortalInvoice,
  PortalInvoiceDetail,
  PortalLedger,
  PortalLoginRequest,
  PortalLoginResponse,
  PortalOutstanding,
  PortalProfile,
  PortalRefreshRequest,
  PortalWeighmentSummary,
} from '@/types/portal'
import { normalizePortalDashboard } from './normalizePortalDashboard'
import { portalQuery } from './portalQuery'
import { portalRequest } from './client'
import {
  mockPortalDashboard,
  mockPortalDispatch,
  mockPortalDispatches,
  mockPortalInvoice,
  mockPortalInvoices,
  mockPortalLedger,
  mockPortalLogin,
  mockPortalMe,
  mockPortalOutstanding,
} from './portalDevBypass'
import {
  readPortalProfile,
  setPortalMustChangePassword,
  setPortalRefreshToken,
  setPortalSession,
} from './session'

function loginRequiresPasswordChange(data: PortalLoginResponse): boolean {
  return Boolean(data.mustChangePassword || data.passwordResetRequired)
}

export function applyPortalLoginResponse(data: PortalLoginResponse): PortalLoginResponse {
  setPortalSession(data.token, {
    customerId: data.customerId,
    customerName: data.customerName,
  })
  if (data.refreshToken) setPortalRefreshToken(data.refreshToken)
  setPortalMustChangePassword(loginRequiresPasswordChange(data))
  return data
}

export function portalLogin(body: PortalLoginRequest): Promise<PortalLoginResponse> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(applyPortalLoginResponse(mockPortalLogin(body)))
  }

  return portalRequest<PortalLoginResponse>('/portal/login', {
    method: 'POST',
    body: JSON.stringify(body),
    anonymous: true,
  }).then(applyPortalLoginResponse)
}

export function portalRefresh(body: PortalRefreshRequest): Promise<PortalLoginResponse> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(
      applyPortalLoginResponse({
        token: 'dev-bypass-portal-token',
        customerId: readPortalProfile()?.customerId ?? 0,
        customerName: readPortalProfile()?.customerName ?? 'Demo',
      }),
    )
  }

  return portalRequest<PortalLoginResponse>('/portal/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
    anonymous: true,
  }).then(applyPortalLoginResponse)
}

export function fetchPortalDashboard(): Promise<PortalDashboard> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalDashboard(readPortalProfile()))
  }

  return portalRequest<unknown>('/portal/dashboard').then((raw) =>
    normalizePortalDashboard(raw, readPortalProfile()),
  )
}

export function fetchPortalMe(): Promise<PortalProfile> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalMe(readPortalProfile()))
  }
  return portalRequest<PortalProfile>('/portal/me')
}

export function fetchPortalCreditStatus(): Promise<CreditStatus> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalDashboard(readPortalProfile()).creditStatus!)
  }
  return portalRequest<CreditStatus>('/portal/credit-status')
}

export function fetchPortalOutstanding(): Promise<PortalOutstanding> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalOutstanding(readPortalProfile()))
  }
  return portalRequest<PortalOutstanding>('/portal/outstanding')
}

export function fetchPortalLedger(params?: {
  dateFrom?: string
  dateTo?: string
}): Promise<PortalLedger> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalLedger())
  }
  return portalRequest<PortalLedger>(`/portal/ledger${portalQuery(params ?? {})}`)
}

export function fetchPortalDispatches(params?: {
  dateFrom?: string
  dateTo?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<PortalWeighmentSummary[]> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalDispatches())
  }
  return portalRequest<PortalWeighmentSummary[]>(
    `/portal/dispatches${portalQuery(params ?? {})}`,
  )
}

export function fetchPortalDispatch(id: number): Promise<PortalWeighmentSummary> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalDispatch(id))
  }
  return portalRequest<PortalWeighmentSummary>(`/portal/dispatches/${id}`)
}

export function fetchPortalInvoices(params?: { status?: string }): Promise<PortalInvoice[]> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalInvoices())
  }
  return portalRequest<PortalInvoice[]>(`/portal/invoices${portalQuery(params ?? {})}`)
}

export function fetchPortalInvoice(id: number): Promise<PortalInvoiceDetail> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalInvoice(id))
  }
  return portalRequest<PortalInvoiceDetail>(`/portal/invoices/${id}`)
}

export function portalChangePassword(
  body: PortalChangePasswordRequest,
): Promise<PortalLoginResponse> {
  if (isPortalLoginBypassEnabled()) {
    setPortalMustChangePassword(false)
    return Promise.resolve(
      applyPortalLoginResponse({
        token: 'dev-bypass-portal-token',
        customerId: readPortalProfile()?.customerId ?? 0,
        customerName: readPortalProfile()?.customerName ?? 'Demo',
      }),
    )
  }

  return portalRequest<PortalLoginResponse>('/portal/change-password', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then(applyPortalLoginResponse)
}
