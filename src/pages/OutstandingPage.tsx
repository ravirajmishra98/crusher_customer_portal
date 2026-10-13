import { useCallback, useEffect, useState } from 'react'
import { fetchPortalCreditStatus, fetchPortalOutstanding } from '@/api/portal'
import { PageHeader } from '@/components/PageHeader'
import { PageState } from '@/components/PageState'
import { StatCard } from '@/components/StatCard'
import { IndianRupee, ShieldCheck } from 'lucide-react'
import type { CreditStatus, PortalOutstanding } from '@/types/portal'
import { formatInrAmount } from '@/lib/format'
import { creditStatusBadgeClass, creditStatusLabel } from '@/lib/creditStatus'
import { ExportCsvButton } from '@/components/ExportCsvButton'
import { exportCsvFile } from '@/lib/exportCsv'
import { usePortalLoadErrorHandler } from '@/hooks/usePortalLoad'

export function OutstandingPage() {
  const handleLoadError = usePortalLoadErrorHandler()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [outstanding, setOutstanding] = useState<PortalOutstanding | null>(null)
  const [credit, setCredit] = useState<CreditStatus | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchPortalOutstanding(), fetchPortalCreditStatus()])
      .then(([o, c]) => {
        setOutstanding(o)
        setCredit(c)
      })
      .catch((err) => {
        const msg = handleLoadError(err, 'Could not load outstanding.')
        if (msg) setError(msg)
      })
      .finally(() => setLoading(false))
  }, [handleLoadError])

  useEffect(() => {
    load()
  }, [load])

  const aging = outstanding?.aging

  return (
    <PageState
      loading={loading && !outstanding}
      error={error}
      onRetry={load}
      skeleton={<div className="page-stack-wide skeleton-shimmer h-72 rounded-xl" />}
    >
      {outstanding ? (
        <div className="page-stack-wide stagger-children">
          <PageHeader
            eyebrow="Finance"
            title="Outstanding"
            description="Balance, credit headroom, and FIFO aging buckets."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Outstanding"
              value={formatInrAmount(outstanding.outstanding)}
              icon={IndianRupee}
              tone="warning"
            />
            <StatCard
              label="Available credit"
              value={
                outstanding.available != null ? formatInrAmount(outstanding.available) : '—'
              }
              icon={ShieldCheck}
              tone="success"
            />
          </div>

          {credit ? (
            <div className="stat-card flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Credit status</p>
                <p className="mt-1 font-semibold">{creditStatusLabel(credit.status)}</p>
                <p className="text-xs text-muted-foreground">
                  {credit.usedPct}% used · limit {formatInrAmount(credit.creditLimit)}
                </p>
              </div>
              <span className={creditStatusBadgeClass(credit.status)}>{credit.status}</span>
            </div>
          ) : null}

          {aging ? (
            <div className="data-panel overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-muted/25 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Aging buckets</p>
                <ExportCsvButton
                  onExport={() =>
                    exportCsvFile(
                      'outstanding_aging',
                      ['Bucket', 'Amount'],
                      [
                        ['Current (0–30 days)', aging.current],
                        ['31–60 days', aging.days31_60],
                        ['61–90 days', aging.days61_90],
                        ['90+ days', aging.days90plus],
                        ['Total', aging.total],
                      ],
                    )
                  }
                />
              </div>
              <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Current (0–30 days)', aging.current],
                    ['31–60 days', aging.days31_60],
                    ['61–90 days', aging.days61_90],
                    ['90+ days', aging.days90plus],
                    ['Total', aging.total],
                  ].map(([label, amt]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td className="text-right tabular-nums font-medium">
                        {formatInrAmount(amt as number | null | undefined)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageState>
  )
}
