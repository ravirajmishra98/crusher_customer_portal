import { isPortalLoginBypassEnabled } from '@/config/env'
import type {
  PortalDashboard,
  PortalLoginRequest,
  PortalLoginResponse,
} from '@/types/portal'
import { portalRequest } from './client'
import { mockPortalDashboard, mockPortalLogin } from './portalDevBypass'
import { readPortalProfile, setPortalSession } from './session'

function applyLoginResponse(data: PortalLoginResponse): PortalLoginResponse {
  setPortalSession(data.token, {
    customerId: data.customerId,
    customerName: data.customerName,
  })
  return data
}

export function portalLogin(body: PortalLoginRequest): Promise<PortalLoginResponse> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(applyLoginResponse(mockPortalLogin(body)))
  }

  return portalRequest<PortalLoginResponse>('/portal/login', {
    method: 'POST',
    body: JSON.stringify(body),
    anonymous: true,
  }).then(applyLoginResponse)
}

export function fetchPortalDashboard(): Promise<PortalDashboard> {
  if (isPortalLoginBypassEnabled()) {
    return Promise.resolve(mockPortalDashboard(readPortalProfile()))
  }

  return portalRequest<PortalDashboard>('/portal/dashboard')
}
