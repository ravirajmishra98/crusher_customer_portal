import {
  AlertCircle,
  CreditCard,
  FileText,
  IndianRupee,
  RefreshCw,
  Truck,
  Wallet,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/api/client'
import { fetchPortalDashboard } from '@/api/portal'
import { InvoicesTable } from '@/components/dashboard/InvoicesTable'
import { PaymentsTable } from '@/components/dashboard/PaymentsTable'
import { TripsTable } from '@/components/dashboard/TripsTable'
import type { PortalDashboard } from '@/types/portal'
import { formatInrAmount } from '@/lib/format'
import { cn } from '@/lib/utils'

type DashboardTab = 'trips' | 'payments' | 'invoices'

function DashboardSkeleton() {
  return (
    <div className="page-stack-wide stagger-children">
      <div className="skeleton-shimmer h-20 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="skeleton-shimmer h-24 rounded-xl" />
        <div className="skeleton-shimmer h-24 rounded-xl" />
        <div className="skeleton-shimmer h-24 rounded-xl" />
      </div>
      <div className="skeleton-shimmer h-96 rounded-xl" />
    </div>
  )
}

function creditUsedPct(outstanding: number, limit: number | null | undefined): number | null {
  if (limit == null || !Number.isFinite(limit) || limit <= 0) return null
  return Math.min(100, Math.round((outstanding / limit) * 100))
}

export function DashboardPage() {
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
        const msg = err instanceof ApiError ? err.message : 'Could not load dashboard.'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [])

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

  const { customer, recentTrips, outstandingBalance, recentPayments, recentInvoices = [] } =
    data
  const usedPct = creditUsedPct(outstandingBalance, customer.creditLimit)

  const tabs: { id: DashboardTab; label: string; icon: typeof Truck; count: number }[] = [
    { id: 'trips', label: 'Trips', icon: Truck, count: recentTrips.length },
    { id: 'payments', label: 'Payments', icon: CreditCard, count: recentPayments.length },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: recentInvoices.length },
  ]

  return (
    <div className="page-stack-wide stagger-children">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Account overview
          </p>
          <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground">
            {customer.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {customer.code ? (
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium">
                {customer.code}
              </span>
            ) : null}
            {customer.status ? (
              <span className="rounded-md border border-border/80 px-2 py-0.5 text-xs text-muted-foreground">
                {customer.status}
              </span>
            ) : null}
            {refreshedAt ? (
              <span className="text-xs text-muted-foreground">
                Updated {refreshedAt.toLocaleTimeString('en-IN', { timeStyle: 'short' })}
              </span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="btn-ghost h-10 shrink-0 self-start px-4"
          aria-label="Refresh dashboard"
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="balance-hero relative min-h-[8.5rem]">
          <div className="relative z-[1]">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/80">
              <Wallet className="size-3.5" aria-hidden />
              Outstanding balance
            </p>
            <p className="mt-2 flex items-baseline gap-1 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              <IndianRupee className="size-7 opacity-90" aria-hidden />
              {formatInrAmount(outstandingBalance).replace(/^₹\s?/, '')}
            </p>
            {customer.creditLimit != null && Number.isFinite(customer.creditLimit) ? (
              <p className="mt-2 text-xs text-white/75">
                Credit limit {formatInrAmount(customer.creditLimit)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <div className="stat-tile">
            <p className="text-xs font-medium text-muted-foreground">Trips on record</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{recentTrips.length}</p>
          </div>
          <div className="stat-tile">
            <p className="text-xs font-medium text-muted-foreground">Payments</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{recentPayments.length}</p>
          </div>
          <div className="stat-tile">
            <p className="text-xs font-medium text-muted-foreground">Invoices</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{recentInvoices.length}</p>
          </div>
        </div>
      </div>

      {usedPct != null ? (
        <div className="stat-tile">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-muted-foreground">Credit utilisation</span>
            <span className="tabular-nums font-semibold">{usedPct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                usedPct >= 90 ? 'bg-rose-500' : usedPct >= 75 ? 'bg-amber-500' : 'bg-primary',
              )}
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold tracking-tight">Activity</h2>
          <div
            className="flex flex-wrap gap-1 rounded-xl border border-border/80 bg-muted/40 p-1"
            role="tablist"
            aria-label="Dashboard sections"
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
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {tab === 'trips' ? <TripsTable trips={recentTrips} /> : null}
        {tab === 'payments' ? <PaymentsTable payments={recentPayments} /> : null}
        {tab === 'invoices' ? <InvoicesTable invoices={recentInvoices} /> : null}
      </section>
    </div>
  )
}
