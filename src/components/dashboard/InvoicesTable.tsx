import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import type { PortalInvoice } from '@/types/portal'
import { formatDate, formatInrAmount } from '@/lib/format'
import { usePagination } from '@/hooks/usePagination'
import { ExportCsvButton } from '@/components/ExportCsvButton'
import { exportCsvFile } from '@/lib/exportCsv'
import { PaginationBar } from './PaginationBar'
import { SectionToolbar } from './SectionToolbar'

type InvoicesTableProps = {
  invoices: PortalInvoice[]
  detailBasePath?: string
}

function matchesInvoice(inv: PortalInvoice, query: string): boolean {
  const q = query.toLowerCase()
  return [inv.invoiceNo, inv.status, inv.invoiceDate, String(inv.totalAmt ?? '')]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(q)
}

export function InvoicesTable({ invoices, detailBasePath }: InvoicesTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim()
    const list = q ? invoices.filter((i) => matchesInvoice(i, q)) : [...invoices]
    return list.sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate))
  }, [invoices, search])

  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, resetPage } =
    usePagination(filtered, 10)

  const onSearchChange = (value: string) => {
    setSearch(value)
    resetPage()
  }

  if (invoices.length === 0) {
    return (
      <div className="data-panel flex flex-col items-center gap-3 p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <FileText className="size-7 text-muted-foreground/60" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">No invoices to show yet.</p>
      </div>
    )
  }

  return (
    <div className="data-panel overflow-hidden">
      <SectionToolbar
        search={search}
        onSearchChange={onSearchChange}
        placeholder="Search invoice no., status…"
        totalCount={invoices.length}
        filteredCount={filtered.length}
        actions={
          <ExportCsvButton
            disabled={filtered.length === 0}
            onExport={() =>
              exportCsvFile(
                'invoices',
                ['Date', 'Invoice no.', 'Status', 'Amount', 'Company'],
                filtered.map((inv) => [
                  inv.invoiceDate,
                  inv.invoiceNo,
                  inv.status,
                  inv.totalAmt,
                  inv.companyName,
                ]),
              )
            }
          />
        }
      />

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice no.</th>
              <th>Status</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No invoices match your search.
                </td>
              </tr>
            ) : (
              pageItems.map((inv) => (
                <tr key={inv.id}>
                  <td className="whitespace-nowrap text-sm">{formatDate(inv.invoiceDate)}</td>
                  <td className="font-mono text-xs sm:text-sm">
                    {detailBasePath ? (
                      <Link to={`${detailBasePath}/${inv.id}`} className="text-primary hover:underline">
                        {inv.invoiceNo}
                      </Link>
                    ) : (
                      inv.invoiceNo
                    )}
                  </td>
                  <td>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                      {inv.status ?? '—'}
                    </span>
                  </td>
                  <td className="text-right tabular-nums font-semibold">
                    {formatInrAmount(inv.totalAmt)}
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
