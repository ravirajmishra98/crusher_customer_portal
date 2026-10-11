import { useMemo, useState } from 'react'
import { CreditCard } from 'lucide-react'
import type { PortalPayment } from '@/types/portal'
import { formatDate, formatInrAmount } from '@/lib/format'
import { usePagination } from '@/hooks/usePagination'
import { PaginationBar } from './PaginationBar'
import { SectionToolbar } from './SectionToolbar'

type PaymentsTableProps = {
  payments: PortalPayment[]
  emptyLabel?: string
}

function matchesPayment(p: PortalPayment, query: string): boolean {
  const q = query.toLowerCase()
  return [p.paymentNo, p.mode, p.reference, p.paymentDate, String(p.amount)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(q)
}

export function PaymentsTable({ payments, emptyLabel = 'No payments recorded yet.' }: PaymentsTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim()
    const list = q ? payments.filter((p) => matchesPayment(p, q)) : [...payments]
    return list.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
  }, [payments, search])

  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, resetPage } =
    usePagination(filtered, 10)

  const onSearchChange = (value: string) => {
    setSearch(value)
    resetPage()
  }

  if (payments.length === 0) {
    return (
      <div className="data-panel flex flex-col items-center gap-3 p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <CreditCard className="size-7 text-muted-foreground/60" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="data-panel overflow-hidden">
      <SectionToolbar
        search={search}
        onSearchChange={onSearchChange}
        placeholder="Search payment no., mode, reference…"
        totalCount={payments.length}
        filteredCount={filtered.length}
      />

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Payment no.</th>
              <th>Mode</th>
              <th className="hidden md:table-cell">Reference</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No payments match your search.
                </td>
              </tr>
            ) : (
              pageItems.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap text-sm">{formatDate(p.paymentDate)}</td>
                  <td className="font-mono text-xs sm:text-sm">{p.paymentNo}</td>
                  <td>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                      {p.mode}
                    </span>
                  </td>
                  <td className="hidden max-w-[10rem] truncate text-muted-foreground md:table-cell">
                    {p.reference ?? '—'}
                  </td>
                  <td className="text-right tabular-nums font-semibold">
                    {formatInrAmount(p.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          resetPage()
        }}
      />
    </div>
  )
}
