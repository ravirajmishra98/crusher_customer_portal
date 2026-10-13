import { useCallback, useEffect, useState } from 'react'
import { fetchPortalInvoices } from '@/api/portal'
import { InvoicesTable } from '@/components/dashboard/InvoicesTable'
import { PageHeader } from '@/components/PageHeader'
import { PageState } from '@/components/PageState'
import type { PortalInvoice } from '@/types/portal'
import { usePortalLoadErrorHandler } from '@/hooks/usePortalLoad'

export function InvoicesPage() {
  const handleLoadError = usePortalLoadErrorHandler()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<PortalInvoice[]>([])

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchPortalInvoices()
      .then(setInvoices)
      .catch((err) => {
        const msg = handleLoadError(err, 'Could not load invoices.')
        if (msg) setError(msg)
      })
      .finally(() => setLoading(false))
  }, [handleLoadError])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PageState
      loading={loading && invoices.length === 0}
      error={error}
      onRetry={load}
      skeleton={<div className="page-stack-wide skeleton-shimmer h-96 rounded-xl" />}
    >
      <div className="page-stack-wide stagger-children">
        <PageHeader
          eyebrow="Finance"
          title="Invoices"
          description="Tax invoices issued to your account."
        />
        <InvoicesTable invoices={invoices} detailBasePath="/invoices" />
      </div>
    </PageState>
  )
}
