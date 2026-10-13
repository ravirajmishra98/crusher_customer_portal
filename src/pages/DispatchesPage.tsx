import { useCallback, useEffect, useState } from 'react'
import { fetchPortalDispatches } from '@/api/portal'
import { TripsTable } from '@/components/dashboard/TripsTable'
import { PageHeader } from '@/components/PageHeader'
import { PageState } from '@/components/PageState'
import type { PortalWeighmentSummary } from '@/types/portal'
import { usePortalLoadErrorHandler } from '@/hooks/usePortalLoad'

export function DispatchesPage() {
  const handleLoadError = usePortalLoadErrorHandler()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dispatches, setDispatches] = useState<PortalWeighmentSummary[]>([])

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchPortalDispatches({ limit: 500 })
      .then(setDispatches)
      .catch((err) => {
        const msg = handleLoadError(err, 'Could not load dispatches.')
        if (msg) setError(msg)
      })
      .finally(() => setLoading(false))
  }, [handleLoadError])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PageState
      loading={loading && dispatches.length === 0}
      error={error}
      onRetry={load}
      skeleton={<div className="page-stack-wide skeleton-shimmer h-96 rounded-xl" />}
    >
      <div className="page-stack-wide stagger-children">
        <PageHeader
          eyebrow="Operations"
          title="Dispatches"
          description="All weighments and trips linked to your account."
        />
        <TripsTable trips={dispatches} detailBasePath="/dispatches" />
      </div>
    </PageState>
  )
}
