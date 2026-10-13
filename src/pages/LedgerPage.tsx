import { useCallback, useEffect, useState } from 'react'
import { fetchPortalLedger } from '@/api/portal'
import { PageHeader } from '@/components/PageHeader'
import { PageState } from '@/components/PageState'
import { StatCard } from '@/components/StatCard'
import { Wallet } from 'lucide-react'
import type { PortalLedger } from '@/types/portal'
import { formatDate, formatInrAmount } from '@/lib/format'
import { ExportCsvButton } from '@/components/ExportCsvButton'
import { exportCsvFile } from '@/lib/exportCsv'
import { usePortalLoadErrorHandler } from '@/hooks/usePortalLoad'

export function LedgerPage() {
  const handleLoadError = usePortalLoadErrorHandler()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ledger, setLedger] = useState<PortalLedger | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchPortalLedger({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
      .then(setLedger)
      .catch((err) => {
        const msg = handleLoadError(err, 'Could not load ledger.')
        if (msg) setError(msg)
      })
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo, handleLoadError])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PageState
      loading={loading && !ledger}
      error={error}
      onRetry={load}
      skeleton={<div className="page-stack-wide skeleton-shimmer h-96 rounded-xl" />}
    >
      <div className="page-stack-wide stagger-children">
        <PageHeader
          eyebrow="Finance"
          title="Ledger"
          description="Running account statement including invoices and payments."
        />

        <div className="surface-card flex flex-wrap items-end gap-3 p-4">
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted-foreground">From</span>
            <input
              type="date"
              className="input-field h-9 w-auto"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted-foreground">To</span>
            <input
              type="date"
              className="input-field h-9 w-auto"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>
          <button type="button" className="btn-ghost h-9" onClick={load}>
            Apply range
          </button>
        </div>

        {ledger ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard
                label="Opening balance"
                value={formatInrAmount(ledger.openingBalance)}
                icon={Wallet}
              />
              <StatCard
                label="Closing balance"
                value={formatInrAmount(ledger.closingBalance)}
                icon={Wallet}
                tone="primary"
              />
            </div>

            <div className="data-panel overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-muted/25 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{ledger.entries.length}</span>{' '}
                  entries
                </p>
                <ExportCsvButton
                  disabled={ledger.entries.length === 0}
                  onExport={() =>
                    exportCsvFile(
                      `ledger_${dateFrom || 'all'}_${dateTo || 'all'}`,
                      ['Date', 'Type', 'Reference', 'Debit', 'Credit', 'Balance'],
                      ledger.entries.map((e) => [
                        e.date,
                        e.type,
                        e.invoiceNo ?? e.ref,
                        e.debit,
                        e.credit,
                        e.balance,
                      ]),
                    )
                  }
                />
              </div>
              <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th className="text-right">Debit</th>
                    <th className="text-right">Credit</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No entries in this period.
                      </td>
                    </tr>
                  ) : (
                    ledger.entries.map((e, i) => (
                      <tr key={`${e.date}-${e.ref}-${i}`}>
                        <td>{formatDate(e.date)}</td>
                        <td>{e.type}</td>
                        <td className="max-w-[12rem] truncate">{e.invoiceNo ?? e.ref ?? '—'}</td>
                        <td className="text-right tabular-nums">
                          {e.debit != null ? formatInrAmount(e.debit) : '—'}
                        </td>
                        <td className="text-right tabular-nums">
                          {e.credit != null ? formatInrAmount(e.credit) : '—'}
                        </td>
                        <td className="text-right tabular-nums font-medium">
                          {formatInrAmount(e.balance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </PageState>
  )
}
