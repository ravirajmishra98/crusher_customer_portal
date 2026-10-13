import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError } from '@/api/client'
import { setPortalMustChangePassword } from '@/api/session'
import { isPortalPasswordResetError } from '@/lib/portalPasswordReset'

export function usePortalLoadErrorHandler() {
  const navigate = useNavigate()

  return useCallback(
    (err: unknown, fallbackMessage: string): string | null => {
      if (isPortalPasswordResetError(err)) {
        setPortalMustChangePassword(true)
        toast.message('Set a new password to continue.')
        navigate('/change-password', { replace: true })
        return null
      }
      return err instanceof ApiError ? err.message : fallbackMessage
    },
    [navigate],
  )
}
