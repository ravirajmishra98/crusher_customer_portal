import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearPortalSession,
  getPortalToken,
  hasPortalSession,
  readPortalProfile,
  type PortalProfile,
} from '@/api/session'
import { subscribePortalSessionSignals } from '@/lib/session-sync'

type PortalAuthContextValue = {
  token: string | null
  profile: PortalProfile | null
  isAuthenticated: boolean
  signOut: (options?: { redirect?: boolean }) => void
  refreshFromStorage: () => void
}

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null)

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getPortalToken())
  const [profile, setProfile] = useState<PortalProfile | null>(() => readPortalProfile())

  const syncFromStorage = useCallback(() => {
    setToken(getPortalToken())
    setProfile(readPortalProfile())
  }, [])

  const signOut = useCallback((options?: { redirect?: boolean }) => {
    clearPortalSession({ broadcast: true })
    setToken(null)
    setProfile(null)
    if (options?.redirect !== false && typeof window !== 'undefined') {
      window.location.assign('/login')
    }
  }, [])

  useEffect(() => {
    return subscribePortalSessionSignals(() => {
      clearPortalSession({ broadcast: false })
      setToken(null)
      setProfile(null)
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.assign('/login')
      }
    })
  }, [])

  /** Re-check session when user returns to a background tab (e.g. after logout elsewhere). */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (!hasPortalSession()) {
        setToken(null)
        setProfile(null)
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign('/login')
        }
      } else {
        syncFromStorage()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [syncFromStorage])

  const value = useMemo(
    () => ({
      token,
      profile,
      isAuthenticated: Boolean(token),
      signOut,
      refreshFromStorage: syncFromStorage,
    }),
    [token, profile, signOut, syncFromStorage],
  )

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>
}

export function usePortalAuth(): PortalAuthContextValue {
  const ctx = useContext(PortalAuthContext)
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider')
  return ctx
}
