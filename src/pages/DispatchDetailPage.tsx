import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { fetchPortalDispatch } from '@/api/portal'
import { PageState } from '@/components/PageState'
import type { PortalWeighmentSummary } from '@/types/portal'
import { formatDateTime, formatInrAmount } from '@/lib/format'
import { tripStatusBadgeClass, tripStatusLabel } from '@/lib/tripStatus'
import { usePortalLoadErrorHandler } from '@/hooks/usePortalLoad'

export function DispatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatchId = Number(id)
  const handleLoadError = usePortalLoadErrorHandler()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trip, setTrip] = useState<PortalWeighmentSummary | null>(null)

  const load = useCallback(() => {
    if (!Number.isFinite(dispatchId)) {
      setError('Invalid dispatch id.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetchPortalDispatch(dispatchId)
      .then(setTrip)
      .catch((err) => {
        const msg = handleLoadError(err, 'Could not load dispatch.')
        if (msg) setError(msg)
      })
      .finally(() => setLoading(false))
  }, [dispatchId, handleLoadError])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PageState loading={loading && !trip} error={error} onRetry={load} skeleton={null}>
      {trip ? (
        <div className="page-stack-wide stagger-children">
          <Link to="/dispatches" className="btn-ghost inline-flex w-fit px-3">
            <ArrowLeft className="size-4" aria-hidden />
            Back to dispatches
          </Link>
          <div className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">
                  {trip.challanNo ?? `Trip #${trip.id}`}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{trip.vehicleNo}</p>
              </div>
              <span className={tripStatusBadgeClass(trip.status)}>
                {tripStatusLabel(trip.status)}
              </span>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Material</dt>
                <dd className="font-medium">{trip.materialName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Plant</dt>
                <dd className="font-medium">{trip.companyName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Net (MT)</dt>
                <dd className="tabular-nums font-medium">
                  {trip.netWt != null ? trip.netWt.toLocaleString('en-IN') : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Amount</dt>
                <dd className="tabular-nums font-medium">
                  {formatInrAmount(trip.totalAmt ?? trip.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tare</dt>
                <dd>{formatDateTime(trip.tareTime)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Gross</dt>
                <dd>{formatDateTime(trip.grossTime)}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </PageState>
  )
}
