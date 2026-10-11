const DEFAULT_API_BASE_URL = 'http://72.61.17.82:3000/api/v1'

export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  const base = fromEnv || DEFAULT_API_BASE_URL
  return base.replace(/\/$/, '')
}

export function getBrandName(): string {
  return import.meta.env.VITE_PORTAL_BRAND_NAME?.trim() || 'Customer portal'
}

/** When true, login/dashboard use local mocks instead of the API. Set to false once backend portal routes work. */
export function isPortalLoginBypassEnabled(): boolean {
  return import.meta.env.VITE_PORTAL_LOGIN_BYPASS === 'true'
}
