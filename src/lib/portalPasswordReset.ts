import { ApiError } from '@/api/client'

const RESET_PREFIX = 'PORTAL_PASSWORD_RESET_REQUIRED'

export function isPortalPasswordResetMessage(message: string): boolean {
  return message.toUpperCase().includes(RESET_PREFIX)
}

export function isPortalPasswordResetError(err: unknown): boolean {
  return err instanceof ApiError && isPortalPasswordResetMessage(err.message)
}

export function portalPasswordResetUserMessage(): string {
  return 'You must set a new password before using the portal.'
}
