import {
  AlertCircle,
  BookOpen,
  FileText,
  IndianRupee,
  RefreshCw,
  Scale,
  Truck,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchPortalDashboard } from '@/api/portal'
import { setPortalMustChangePassword } from '@/api/session'
import { InvoicesTable } from '@/components/dashboard/InvoicesTable'
import { TripsTable } from '@/components/dashboard/TripsTable'
import { PageHeader } from '@/components/PageHeader'
import { QuickLinkCard } from '@/components/QuickLinkCard'
import { StatCard } from '@/components/StatCard'
import type { PortalAging, PortalDashboard } from '@/types/portal'
import { formatInrAmount } from '@/lib/format'
import { creditStatusBadgeClass, creditStatusLabel } from '@/lib/creditStatus'
import { isPortalPasswordResetError } from '@/lib/portalPasswordReset'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

type DashboardTab = 'trips' | 'invoices'

function DashboardSkeleton() {
  return (
    <div className="page-stack-wide stagger-children">
      <div className="skeleton-shimmer h-24 rounded-2xl" />
      <div className="skeleton-shimmer h-36 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="skeleton-shimmer h-28 rounded-2xl" />
        <div className="skeleton-shimmer h-28 rounded-2xl" />
        <div className="skeleton-shimmer h-28 rounded-2xl" />
      </div>
      <div className="skeleton-shimmer h-96 rounded-2xl" />
    </div>
  )
}

function creditUsedPct(outstanding: number, limit: number | null | undefined): number | null {
  if (limit == null || !Number.isFinite(limit) || limit <= 0) return null
  return Math.min(100, Math.round((outstanding / limit) * 100))
}

function AgingBars({ aging }: { aging: PortalAging }) {
  const buckets = [
    { label: '0–30 days', value: aging.current, tone: 'bg-emerald-500' },
    { label: '31–60', value: aging.days31_60, tone: 'bg-amber-500' },
    { label: '61–90', value: aging.days61_90, tone: 'bg-orange-500' },
    { label: '90+', value: aging.days90plus, tone: 'bg-rose-500' },
  ]
  const total = aging.total ?? buckets.reduce((s, b) => s + (b.value ?? 0), 0)
  const max = Math.max(...buckets.map((b) => b.value ?? 0), 1)

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-sm font-semibold">Aging snapshot</p>
        <Link to="/outstanding" className="text-xs font-medium text-primary hover:underline">
          Full breakdown
        </Link>
      </div>
      <div className="mt-4 space-y-3">
        {buckets.map(({ label, value, tone }) => {
          const v = value ?? 0
          const pct = total > 0 ? Math.round((v / total) * 100) : 0
          return (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="tabular-nums font-medium">
                  {formatInrAmount(v)}
                  {total > 0 ? <span className="text-muted-foreground"> · {pct}%</span> : null}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', tone)}
                  style={{ width: `${Math.max(4, (v / max) * 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PortalDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<DashboardTab>('trips')
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchPortalDashboard()
      .then((dashboard) => {
        setData(dashboard)
        setRefreshedAt(new Date())
      })
      .catch((err: unknown) => {
        if (isPortalPasswordResetError(err)) {
          setPortalMustChangePassword(true)
          toast.message('Set a new password to continue.')
          navigate('/change-password', { replace: true })
          return
        }
        const msg = err instanceof Error ? err.message : 'Could not load dashboard.'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !data) {
    return <DashboardSkeleton />
  }

  if (error && !data) {
    return (
      <div className="page-stack-wide animate-fade-in-up">
        <div className="surface-card flex gap-3 border-destructive/30 p-4 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
        <button type="button" onClick={load} className="btn-ghost h-10 w-fit px-5">
          <RefreshCw className="size-4" aria-hidden />
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  const { profile, creditStatus, outstanding, recentDispatches, recentInvoices, aging } = data
  const usedPct =
    creditStatus?.usedPct ??
    creditUsedPct(outstanding, profile.creditLimit ?? creditStatus?.creditLimit)

  const tabs: { id: DashboardTab; label: string; icon: typeof Truck; count: number }[] = [
    { id: 'trips', label: 'Recent dispatches', icon: Truck, count: recentDispatches.length },
    { id: 'invoices', label: 'Recent invoices', icon: FileText, count: recentInvoices.length },
  ]

  return (
    <div className="page-stack-wide stagger-children">
      <PageHeader
        eyebrow="Dashboard"
        title={profile.name}
        description="Live balances, credit headroom, and your latest dispatches and invoices."
        actions={
          <>
            {profile.code ? (
              <span className="hidden rounded-lg bg-muted px-2.5 py-1 font-mono text-xs font-semibold sm:inline">
                {profile.code}
              </span>
            ) : null}
            {creditStatus ? (
              <span className={creditStatusBadgeClass(creditStatus.status)}>
                {creditStatusLabel(creditStatus.status)}
              </span>
            ) : null}
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="btn-ghost h-10 shrink-0 px-4"
              aria-label="Refresh dashboard"
            >
              <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </>
        }
      />
      {refreshedAt ? (
        <p className="-mt-2 text-xs text-muted-foreground">
          Last updated {refreshedAt.toLocaleTimeString('en-IN', { timeStyle: 'short' })}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLinkCard
          to="/dispatches"
          title="Dispatches"
          description="Track trips & challans"
          icon={Truck}
        />
        <QuickLinkCard
          to="/invoices"
          title="Invoices"
          description="Open bills & PDFs"
          icon={FileText}
        />
        <QuickLinkCard
          to="/outstanding"
          title="Outstanding"
          description="Due & credit limits"
          icon={Scale}
        />
        <QuickLinkCard
          to="/ledger"
          title="Ledger"
          description="Statement & payments"
          icon={BookOpen}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="balance-hero relative min-h-[9rem]">
          <div className="relative z-[1]">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">
              <Wallet className="size-3.5" aria-hidden />
              Outstanding balance
            </p>
            <p className="font-display mt-2 flex items-baseline gap-1 text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl">
              <IndianRupee className="size-7 opacity-90" aria-hidden />
              {formatInrAmount(outstanding).replace(/^₹\s?/, '')}
            </p>
            {profile.creditLimit != null && Number.isFinite(profile.creditLimit) ? (
              <p className="mt-2 text-xs text-white/80">
                Credit limit {formatInrAmount(profile.creditLimit)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <StatCard
            label="Total dispatches"
            value={data.totalDispatches ?? '—'}
            icon={Truck}
            tone="primary"
          />
          <StatCard
            label="Open invoices"
            value={data.openInvoices ?? '—'}
            icon={FileText}
            tone="warning"
          />
          <StatCard
            label="Open trips"
            value={creditStatus?.openTrips ?? '—'}
            icon={Truck}
            tone="default"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {usedPct != null ? (
          <div className="stat-card">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-display font-semibold text-foreground">Credit utilisation</span>
              <Link to="/outstanding" className="font-medium text-primary hover:underline">
                View outstanding
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    usedPct >= 90 ? 'bg-rose-500' : usedPct >= 75 ? 'bg-amber-500' : 'bg-primary',
                  )}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              <span className="font-display tabular-nums text-lg font-bold">{usedPct}%</span>
            </div>
          </div>
        ) : null}
        {aging ? <AgingBars aging={aging} /> : null}
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-base font-bold tracking-tight">Recent activity</h2>
          <div
            className="flex flex-wrap gap-1 rounded-2xl border border-border/80 bg-muted/50 p-1 shadow-inner shadow-slate-900/[0.03]"
            role="tablist"
          >
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn('dashboard-tab', tab === id && 'dashboard-tab-active')}
              >
                <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                {label}
                <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground ring-1 ring-border/60">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {tab === 'trips' ? (
          <>
            <TripsTable trips={recentDispatches} detailBasePath="/dispatches" />
            <Link
              to="/dispatches"
              className="inline-flex text-sm font-semibold text-primary hover:underline"
            >
              View all dispatches →
            </Link>
          </>
        ) : null}
        {tab === 'invoices' ? (
          <>
            <InvoicesTable invoices={recentInvoices} detailBasePath="/invoices" />
            <Link
              to="/invoices"
              className="inline-flex text-sm font-semibold text-primary hover:underline"
            >
              View all invoices →
            </Link>
          </>
        ) : null}
      </section>
    </div>
  )
}
