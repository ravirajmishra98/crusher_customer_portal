import { broadcastPortalLogout } from '@/lib/session-sync'

const TOKEN_KEY = 'portal_access_token'
const PROFILE_KEY = 'portal_customer_profile'

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

export function clearPortalSession(options?: { broadcast?: boolean }): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(PROFILE_KEY)
  if (options?.broadcast !== false) {
    broadcastPortalLogout()
  }
}

export function hasPortalSession(): boolean {
  return Boolean(getPortalToken())
}
