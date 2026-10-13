import type { MouseEvent, PointerEvent } from 'react'
import { KeyRound, LogOut, Mountain, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { mustChangePortalPassword } from '@/api/session'
import { portalNavLinks } from '@/components/portalNavLinks'
import { getPortalTitle } from '@/config/env'
import { usePortalAuth } from '@/context/PortalAuthContext'
import { cn } from '@/lib/utils'

type PortalSidebarProps = {
  /** Drawer open on viewports below md */
  mobileOpen: boolean
  /** Sidebar pinned on md+ */
  docked: boolean
  onMobileClose: () => void
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-0.5 p-2">
      {portalNavLinks.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end ?? false}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn('sidebar-link', isActive && 'sidebar-link-active')
            }
          >
            <Icon className="size-[1.125rem] shrink-0 opacity-90" strokeWidth={2} aria-hidden />
            <span>{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function PortalSidebar({ mobileOpen, docked, onMobileClose }: PortalSidebarProps) {
  const { profile, signOut } = usePortalAuth()
  const showDrawer = !docked && mobileOpen

  function handleClose(e: MouseEvent | PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    onMobileClose()
  }

  function handleSignOut() {
    onMobileClose()
    signOut()
  }

  const footer = (
    <div className="sidebar-section mt-auto border-t p-3">
      {!mustChangePortalPassword() ? (
        <Link
          to="/change-password"
          onClick={onMobileClose}
          className="sidebar-link mb-0.5 w-full"
        >
          <KeyRound className="size-[1.125rem] shrink-0" aria-hidden />
          Change password
        </Link>
      ) : null}
      <button type="button" onClick={handleSignOut} className="sidebar-link w-full text-left">
        <LogOut className="size-[1.125rem] shrink-0" aria-hidden />
        Sign out
      </button>
    </div>
  )

  const brand = (
    <div className="sidebar-section relative flex shrink-0 items-center gap-3 border-b p-4">
      <div className="brand-mark brand-mark-customer flex size-10 shrink-0 items-center justify-center rounded-xl text-white">
        <Mountain className="size-[1.125rem]" strokeWidth={2.25} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <Link
          to="/"
          onClick={onMobileClose}
          className="sidebar-brand-title font-display block truncate text-sm font-bold tracking-tight"
        >
          {getPortalTitle()}
        </Link>
        {profile ? (
          <p className="sidebar-brand-sub truncate text-xs">{profile.customerName}</p>
        ) : null}
      </div>
      {!docked ? (
        <button
          type="button"
          className="sidebar-close relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-colors active:scale-95"
          onPointerDown={handleClose}
          onClick={handleClose}
          aria-label="Close menu"
        >
          <X className="size-5" aria-hidden />
        </button>
      ) : null}
    </div>
  )

  return (
    <>
      {showDrawer ? (
        <div
          className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-[2px] md:hidden"
          aria-hidden={false}
          onPointerDown={handleClose}
          onClick={handleClose}
        />
      ) : null}

      <aside
        className={cn(
          'portal-sidebar fixed inset-y-0 left-0 z-[100] flex h-dvh w-64 max-w-[min(100vw-2rem,17.5rem)] flex-col overflow-hidden',
          'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
          docked
            ? 'translate-x-0 md:shadow-none'
            : cn(
                'transition-transform duration-300 ease-out',
                mobileOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none',
              ),
        )}
        aria-label="Portal navigation"
        aria-hidden={!docked && !mobileOpen}
      >
        {brand}
        <nav className="flex-1 overflow-y-auto overscroll-contain py-2">
          <SidebarNav onNavigate={onMobileClose} />
        </nav>
        {footer}
      </aside>
    </>
  )
}
