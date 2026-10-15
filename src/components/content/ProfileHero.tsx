import { Building2 } from 'lucide-react'
import type { PortalProfile } from '@/types/portal'
import { formatInrAmount } from '@/lib/format'
import { cn } from '@/lib/utils'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function statusClass(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase()
  if (s.includes('active') || s === 'ok') return 'badge-status badge-completed'
  if (s.includes('block') || s.includes('inactive')) return 'badge-status badge-cancelled'
  return 'badge-status badge-default'
}

type ProfileHeroProps = {
  profile: PortalProfile
  className?: string
}

export function ProfileHero({ profile, className }: ProfileHeroProps) {
  return (
    <div className={cn('profile-hero', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="profile-hero-avatar" aria-hidden>
            {initials(profile.name)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">Customer</p>
            <h2 className="font-display truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
              {profile.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {profile.code ? (
                <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-xs font-semibold text-white">
                  {profile.code}
                </span>
              ) : null}
              {profile.status ? (
                <span className={statusClass(profile.status)}>{profile.status}</span>
              ) : null}
            </div>
          </div>
        </div>
        {profile.creditLimit != null && Number.isFinite(profile.creditLimit) ? (
          <div className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              Credit limit
            </p>
            <p className="font-display mt-0.5 text-lg font-bold tabular-nums text-white">
              {formatInrAmount(profile.creditLimit)}
            </p>
          </div>
        ) : null}
      </div>
      <Building2
        className="pointer-events-none absolute -right-2 -top-2 size-24 text-white/[0.06]"
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  )
}
