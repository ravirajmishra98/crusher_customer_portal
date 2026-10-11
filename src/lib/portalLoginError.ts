import { ApiError } from '@/api/client'

/** Map API errors to messages customers can act on (frontend-only; server must expose /portal/login). */
export function portalLoginErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) {
    return 'Sign-in failed.'
  }
  const msg = err.message.trim()
  if (
    err.status === 401 &&
    msg.toLowerCase() === 'authentication required'
  ) {
    return (
      'Portal sign-in is not available on the server yet (POST /portal/login is protected). ' +
      'Contact your supplier to enable customer portal login on the API.'
    )
  }
  return msg || 'Sign-in failed.'
}
