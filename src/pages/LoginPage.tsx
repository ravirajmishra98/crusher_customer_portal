import { useState, type FormEvent } from 'react'
import { KeyRound, Lock, LogIn, Sparkles } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { portalLogin } from '@/api/portal'
import { portalLoginErrorMessage } from '@/lib/portalLoginError'
import { getBrandName, isPortalLoginBypassEnabled } from '@/config/env'
import { usePortalAuth } from '@/context/PortalAuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, refreshFromStorage } = usePortalAuth()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from.startsWith('/login') ? '/' : from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedCode = code.trim()
    if (!trimmedCode || !password) {
      toast.error('Enter your customer code and password.')
      return
    }
    setSubmitting(true)
    try {
      await portalLogin({ code: trimmedCode, password })
      refreshFromStorage()
      toast.success('Signed in.')
      navigate(from.startsWith('/login') ? '/' : from, { replace: true })
    } catch (err) {
      toast.error(portalLoginErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mesh-bg flex min-h-dvh flex-col justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-sm">
        <div className="animate-fade-in-up mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="size-7" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{getBrandName()}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sign in with the customer code and password from your supplier.
          </p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="surface-card animate-scale-in space-y-4 p-6 backdrop-blur-sm"
          style={{ animationDelay: '0.08s' }}
        >
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Customer code
            </label>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="code"
                name="code"
                autoComplete="username"
                className="input-field pl-10"
                placeholder="e.g. CUST001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="input-field pl-10"
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
          <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-center text-xs text-amber-900">
            Demo mode: sign-in uses sample data, not the live API. Turn off{' '}
            <span className="font-mono">VITE_PORTAL_LOGIN_BYPASS</span> when the backend is ready.
          </p>
        ) : null}

        <p
          className="animate-fade-in mt-6 text-center text-xs leading-relaxed text-muted-foreground"
          style={{ animationDelay: '0.2s' }}
        >
          This portal is separate from staff ERP login. Contact your plant office if you need
          access reset.
        </p>
      </div>
    </div>
  )
}
