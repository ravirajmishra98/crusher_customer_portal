import { LogOut, Menu } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { PortalSidebar } from '@/components/PortalSidebar'
import { Outlet, useLocation } from 'react-router-dom'
import { usePortalAuth } from '@/context/PortalAuthContext'
import { getPortalTitle } from '@/config/env'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

export function PortalLayout() {
  const { signOut } = usePortalAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isDesktopNav = useMediaQuery('(min-width: 768px)')
  const location = useLocation()

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  useEffect(() => {
    closeMobileNav()
  }, [location.pathname, closeMobileNav])

  useEffect(() => {
    if (isDesktopNav) closeMobileNav()
  }, [isDesktopNav, closeMobileNav])

  useEffect(() => {
    if (!mobileNavOpen || isDesktopNav) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileNav()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen, isDesktopNav, closeMobileNav])

  const drawerOpen = mobileNavOpen && !isDesktopNav

  return (
    <div className="portal-shell min-h-dvh">
      <PortalSidebar
        mobileOpen={drawerOpen}
        docked={isDesktopNav}
        onMobileClose={closeMobileNav}
      />

      <div
        className={cn('flex min-h-dvh min-w-0 flex-col md:pl-64')}
        {...(drawerOpen ? { inert: true } : {})}
      >
        <header
          className={cn(
            'sticky top-0 z-20 flex items-center gap-3 border-b border-border/70 bg-card/80 px-4 py-3 shadow-sm shadow-slate-900/[0.04] backdrop-blur-xl md:hidden pt-[max(0.75rem,env(safe-area-inset-top))]',
            drawerOpen && 'pointer-events-none invisible',
          )}
        >
          <button
            type="button"
            className="btn-ghost size-10 shrink-0 p-0"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <Menu className="size-5" />
          </button>
          <p className="font-display min-w-0 flex-1 truncate text-sm font-bold">{getPortalTitle()}</p>
          <button
            type="button"
            className="btn-ghost size-10 shrink-0 p-0"
            onClick={() => signOut()}
            aria-label="Sign out"
          >
            <LogOut className="size-5" />
          </button>
        </header>

        <main className="flex-1 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
