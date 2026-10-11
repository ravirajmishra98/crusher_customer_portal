import { LogOut, Mountain } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { usePortalAuth } from '@/context/PortalAuthContext'
import { getBrandName } from '@/config/env'

export function PortalLayout() {
  const { profile, signOut } = usePortalAuth()

  return (
    <div className="min-h-dvh flex flex-col bg-[linear-gradient(180deg,#eef2ff_0%,var(--background)_12rem)]">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-card/75 px-4 py-3 shadow-sm shadow-slate-200/40 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 animate-fade-in px-0 sm:px-2">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25"
              aria-hidden
            >
              <Mountain className="size-4" />
            </div>
            <div className="min-w-0">
              <Link
                to="/"
                className="text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
              >
                {getBrandName()}
              </Link>
              {profile ? (
                <p className="truncate text-xs text-muted-foreground">{profile.customerName}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="btn-ghost shrink-0"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
