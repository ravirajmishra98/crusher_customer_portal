import { useState, type FormEvent } from 'react'
import { KeyRound, Lock, Mountain, ShieldCheck } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ApiError } from '@/api/client'
import { portalChangePassword } from '@/api/portal'
import { mustChangePortalPassword } from '@/api/session'
import { getPortalOperatorName, getPortalTitle } from '@/config/env'
import { usePortalAuth } from '@/context/PortalAuthContext'
import { portalPasswordResetUserMessage } from '@/lib/portalPasswordReset'

const MIN_PASSWORD_LENGTH = 8

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { isAuthenticated, profile, signOut } = usePortalAuth()
  const required = mustChangePortalPassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      toast.error('Enter your current and new password.')
      return
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    if (newPassword === currentPassword) {
      toast.error('Choose a new password different from your current one.')
      return
    }

    setSubmitting(true)
    try {
      await portalChangePassword({ currentPassword, newPassword })
      toast.success('Password updated. You can use the portal now.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mesh-bg flex min-h-dvh flex-col justify-center px-4 py-8">
      <div className="mx-auto w-full max-w-md animate-fade-in-up">
        <div className="mb-6 text-center">
          <div className="brand-mark mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
            <ShieldCheck className="size-7 text-white" aria-hidden />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            {required ? 'Set your password' : 'Change password'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {required
              ? portalPasswordResetUserMessage()
              : 'Update your portal sign-in password.'}
          </p>
          {profile ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{profile.customerName}</span>
            </p>
          ) : null}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="surface-card animate-scale-in space-y-4 p-6 sm:p-7">
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              {required ? 'One-time password' : 'Current password'}
            </label>
            <div className="input-icon-wrap">
              <span className="input-field-icon" aria-hidden>
                <Lock className="size-[1.125rem] stroke-[2]" />
              </span>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                className="input-field"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-sm font-medium">
              New password
            </label>
            <div className="input-icon-wrap">
              <span className="input-field-icon" aria-hidden>
                <KeyRound className="size-[1.125rem] stroke-[2]" />
              </span>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                className="input-field"
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm new password
            </label>
            <div className="input-icon-wrap">
              <span className="input-field-icon" aria-hidden>
                <KeyRound className="size-[1.125rem] stroke-[2]" />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving…' : 'Save new password'}
          </button>

          {!required ? (
            <button
              type="button"
              className="btn-ghost w-full"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              className="btn-ghost w-full text-muted-foreground"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          )}
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Mountain className="size-3.5 opacity-50" aria-hidden />
          {getPortalTitle()}
        </p>
        <p className="sr-only">{getPortalOperatorName()}</p>
      </div>
    </div>
  )
}
