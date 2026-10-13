import { broadcastPortalLogout } from '@/lib/session-sync'

const TOKEN_KEY = 'portal_access_token'
const PROFILE_KEY = 'portal_customer_profile'
const MUST_CHANGE_PASSWORD_KEY = 'portal_must_change_password'
const REFRESH_TOKEN_KEY = 'portal_refresh_token'

export type PortalProfile = {
  customerId: number
  customerName: string
}

export function getPortalToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setPortalSession(token: string, profile: PortalProfile): void {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function readPortalProfile(): PortalProfile | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PortalProfile
  } catch {
    return null
  }
}

export function setPortalMustChangePassword(required: boolean): void {
  if (required) {
    sessionStorage.setItem(MUST_CHANGE_PASSWORD_KEY, '1')
  } else {
    sessionStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
  }
}

export function mustChangePortalPassword(): boolean {
  try {
    return sessionStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === '1'
  } catch {
    return false
  }
}

export function setPortalRefreshToken(token: string): void {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function getPortalRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearPortalSession(options?: { broadcast?: boolean }): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(PROFILE_KEY)
  sessionStorage.removeItem(MUST_CHANGE_PASSWORD_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  if (options?.broadcast !== false) {
    broadcastPortalLogout()
  }
}

export function hasPortalSession(): boolean {
  return Boolean(getPortalToken())
}
