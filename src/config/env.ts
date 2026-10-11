const DEFAULT_API_BASE_URL = 'http://72.61.17.82:3000/api/v1'

export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim()
  const base = fromEnv || DEFAULT_API_BASE_URL
  return base.replace(/\/$/, '')
}

const DEFAULT_PORTAL_OPERATOR_NAME = 'SuperCrusher'
const PORTAL_PRODUCT_SUFFIX = 'Customer Portal'

/** Plant / operator name (e.g. SuperCrusher). Override with VITE_PORTAL_OPERATOR_NAME. */
export function getPortalOperatorName(): string {
  const legacyFull = import.meta.env.VITE_PORTAL_BRAND_NAME?.trim()
  if (legacyFull) {
    const suffix = ` ${PORTAL_PRODUCT_SUFFIX}`
    if (legacyFull.endsWith(suffix)) {
      return legacyFull.slice(0, -suffix.length).trim()
    }
  }
  return import.meta.env.VITE_PORTAL_OPERATOR_NAME?.trim() || DEFAULT_PORTAL_OPERATOR_NAME
}

/** Full portal title shown in header and login, e.g. "SuperCrusher Customer Portal". */
export function getPortalTitle(): string {
  const legacyFull = import.meta.env.VITE_PORTAL_BRAND_NAME?.trim()
  if (legacyFull) return legacyFull

  const operator = getPortalOperatorName()
  return operator ? `${operator} ${PORTAL_PRODUCT_SUFFIX}` : PORTAL_PRODUCT_SUFFIX
}

/** @deprecated Use getPortalTitle() */
export function getBrandName(): string {
  return getPortalTitle()
}

/** When true, login/dashboard use local mocks instead of the API. Set to false once backend portal routes work. */
export function isPortalLoginBypassEnabled(): boolean {
  return import.meta.env.VITE_PORTAL_LOGIN_BYPASS === 'true'
}
