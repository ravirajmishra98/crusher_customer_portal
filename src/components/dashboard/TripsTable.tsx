import { useMemo, useState } from 'react'
import { Truck } from 'lucide-react'
import type { PortalWeighmentSummary } from '@/types/portal'
import { formatDateTime, formatInrAmount } from '@/lib/format'
import { tripStatusBadgeClass, tripStatusLabel } from '@/lib/tripStatus'
import { usePagination } from '@/hooks/usePagination'
import { PaginationBar } from './PaginationBar'
import { SectionToolbar } from './SectionToolbar'

type TripsTableProps = {
  trips: PortalWeighmentSummary[]
}

function matchesTrip(trip: PortalWeighmentSummary, query: string): boolean {
  const q = query.toLowerCase()
  const haystack = [
    trip.challanNo,
    trip.vehicleNo,
    trip.materialName,
    trip.companyName,
    tripStatusLabel(trip.status),
    String(trip.id),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function TripsTable({ trips }: TripsTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim()
    const list = q ? trips.filter((t) => matchesTrip(t, q)) : [...trips]
    return list.sort(
      (a, b) => new Date(b.tareTime).getTime() - new Date(a.tareTime).getTime(),
    )
  }, [trips, search])

  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, resetPage } =
    usePagination(filtered, 10)

  const onSearchChange = (value: string) => {
    setSearch(value)
    resetPage()
  }

  if (trips.length === 0) {
    return (
      <div className="data-panel flex flex-col items-center gap-3 p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <Truck className="size-7 text-muted-foreground/60" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground">No trips to show yet.</p>
      </div>
    )
  }

  return (
    <div className="data-panel overflow-hidden">
      <SectionToolbar
        search={search}
        onSearchChange={onSearchChange}
        placeholder="Search challan, vehicle, material…"
        totalCount={trips.length}
        filteredCount={filtered.length}
      />

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Challan / trip</th>
              <th>Vehicle</th>
              <th>Material</th>
              <th className="hidden md:table-cell">Plant</th>
              <th className="text-right">Net (MT)</th>
              <th className="text-right">Amount</th>
              <th>Status</th>
              <th className="hidden sm:table-cell">Tare time</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No trips match your search.
                </td>
              </tr>
            ) : (
              pageItems.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    <div className="font-medium text-foreground">
                      {trip.challanNo ?? `#${trip.id}`}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground md:hidden">
                      {trip.companyName}
                    </div>
                  </td>
                  <td className="font-mono text-xs sm:text-sm">{trip.vehicleNo}</td>
                  <td>{trip.materialName}</td>
                  <td className="hidden max-w-[8rem] truncate md:table-cell">{trip.companyName}</td>
                  <td className="text-right tabular-nums">
                    {trip.netWt != null ? trip.netWt.toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="text-right tabular-nums font-medium">
                    {formatInrAmount(trip.totalAmt ?? trip.amount)}
                  </td>
                  <td>
                    <span className={tripStatusBadgeClass(trip.status)}>
                      {tripStatusLabel(trip.status)}
                    </span>
                  </td>
                  <td className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">
                    {formatDateTime(trip.tareTime)}
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
