import { useState, type FormEvent } from 'react'
import { KeyRound, Lock, LogIn, Mountain } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { portalLogin } from '@/api/portal'
import { mustChangePortalPassword } from '@/api/session'
import { portalLoginErrorMessage } from '@/lib/portalLoginError'
import { getPortalOperatorName, getPortalTitle, isPortalLoginBypassEnabled } from '@/config/env'
import { usePortalAuth } from '@/context/PortalAuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, refreshFromStorage } = usePortalAuth()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from.startsWith('/login') ? '/' : from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      toast.error('Enter your email and password.')
      return
    }
    setSubmitting(true)
    try {
      await portalLogin({ email: trimmedEmail, password })
      refreshFromStorage()
      toast.success('Signed in.')
      if (mustChangePortalPassword()) {
        navigate('/change-password', { replace: true })
        return
      }
      navigate(from.startsWith('/login') ? '/' : from, { replace: true })
    } catch (err) {
      toast.error(portalLoginErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mesh-bg flex min-h-dvh flex-col lg:flex-row">
      <div className="relative hidden flex-1 flex-col justify-between p-10 lg:flex xl:p-14">
        <div className="brand-mark flex size-12 items-center justify-center rounded-2xl text-white">
          <Mountain className="size-6" strokeWidth={2.25} aria-hidden />
        </div>
        <div className="max-w-md animate-fade-in-up">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/90">
            Customer portal
          </p>
          <h1 className="font-display mt-3 text-4xl font-extrabold leading-tight tracking-tight text-foreground xl:text-[2.75rem]">
            {getPortalOperatorName()}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            View dispatches, invoices, outstanding balances, and your full ledger — anytime, from
            any device.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Real-time credit & aging
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Secure, separate from staff ERP
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground/80">{getPortalTitle()}</p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-10 pb-[max(2rem,env(safe-area-inset-bottom))] lg:max-w-md lg:px-10 xl:max-w-lg">
        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <div className="animate-fade-in-up mb-8 text-center lg:text-left">
            <div className="brand-mark mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl lg:hidden">
              <Mountain className="size-7 text-white" aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sign in with the portal email and password from your supplier.
            </p>
          </div>

          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="surface-card animate-scale-in space-y-4 p-6 sm:p-7"
            style={{ animationDelay: '0.08s' }}
          >
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="input-icon-wrap">
                <span className="input-field-icon" aria-hidden>
                  <KeyRound className="size-[1.125rem] stroke-[2]" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username email"
                  className="input-field"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="input-icon-wrap">
                <span className="input-field-icon" aria-hidden>
                  <Lock className="size-[1.125rem] stroke-[2]" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary gap-2">
              {submitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="size-4" aria-hidden />
                  Sign in
                </>
              )}
            </button>
          </form>

          {isPortalLoginBypassEnabled() ? (
            <p className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-center text-xs text-amber-950">
              Demo mode: sign-in uses sample data, not the live API. Turn off{' '}
              <span className="font-mono font-medium">VITE_PORTAL_LOGIN_BYPASS</span> when the
              backend is ready.
            </p>
          ) : null}

          <p
            className="animate-fade-in mt-6 text-center text-xs leading-relaxed text-muted-foreground lg:text-left"
            style={{ animationDelay: '0.2s' }}
          >
            This portal is separate from staff ERP login. Contact your plant office if you need
            access reset.
          </p>
        </div>
      </div>
    </div>
  )
}
