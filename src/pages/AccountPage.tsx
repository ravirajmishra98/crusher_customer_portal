import { useCallback, useEffect, useState } from 'react'
import { fetchPortalMe } from '@/api/portal'
import { PageHeader } from '@/components/PageHeader'
import { PageState } from '@/components/PageState'
import type { PortalProfile } from '@/types/portal'
import { formatInrAmount } from '@/lib/format'
import { usePortalLoadErrorHandler } from '@/hooks/usePortalLoad'

export function AccountPage() {
  const handleLoadError = usePortalLoadErrorHandler()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<PortalProfile | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchPortalMe()
      .then(setProfile)
      .catch((err) => {
        const msg = handleLoadError(err, 'Could not load profile.')
        if (msg) setError(msg)
      })
      .finally(() => setLoading(false))
  }, [handleLoadError])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PageState
      loading={loading && !profile}
      error={error}
      onRetry={load}
      skeleton={<div className="page-stack-wide skeleton-shimmer h-64 rounded-xl" />}
    >
      {profile ? (
        <div className="page-stack-wide stagger-children">
          <PageHeader
            eyebrow="Profile"
            title="Account"
            description="Your registered business details on file with the plant (read-only)."
          />
          <dl className="data-panel divide-y divide-border/80 text-sm">
            {[
              ['Name', profile.name],
              ['Code', profile.code],
              ['Email', profile.email],
              ['Phone', profile.phone],
              ['GSTIN', profile.gstNo],
              ['Address', profile.address],
              ['Credit limit', profile.creditLimit != null ? formatInrAmount(profile.creditLimit) : null],
              ['Status', profile.status],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr]">
                <dt className="font-medium text-muted-foreground">{label}</dt>
                <dd className="text-foreground">{value ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </PageState>
  )
}
