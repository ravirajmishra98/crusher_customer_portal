import { useCallback, useEffect, useState } from 'react'
import { Hash, Mail, MapPin, Receipt, User } from 'lucide-react'
import { fetchPortalMe } from '@/api/portal'
import { ContentCard } from '@/components/content/ContentCard'
import { DetailField } from '@/components/content/DetailField'
import { ProfileHero } from '@/components/content/ProfileHero'
import { PageHeader } from '@/components/PageHeader'
import { PageState } from '@/components/PageState'
import type { PortalProfile } from '@/types/portal'
import { formatInrAmount } from '@/lib/format'
import { usePortalLoadErrorHandler } from '@/hooks/usePortalLoad'

function AccountSkeleton() {
  return (
    <div className="page-stack-wide stagger-children">
      <div className="skeleton-shimmer h-32 rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="skeleton-shimmer h-48 rounded-2xl" />
        <div className="skeleton-shimmer h-48 rounded-2xl" />
      </div>
    </div>
  )
}

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
    <PageState loading={loading && !profile} error={error} onRetry={load} skeleton={<AccountSkeleton />}>
      {profile ? (
        <div className="page-stack-wide stagger-children">
          <PageHeader
            eyebrow="Profile"
            title="Account"
            description="Registered business details on file with the plant. Contact the office to request changes."
          />

          <ProfileHero profile={profile} />

          <div className="grid gap-4 lg:grid-cols-2">
            <ContentCard title="Contact" description="How the plant reaches you" icon={User}>
              <dl className="detail-grid">
                <DetailField label="Email" value={profile.email} />
                <DetailField label="Phone" value={profile.phone} />
              </dl>
            </ContentCard>

            <ContentCard title="Tax & identity" description="Billing and compliance" icon={Receipt}>
              <dl className="detail-grid">
                <DetailField label="GSTIN" value={profile.gstNo} mono />
                <DetailField label="Customer code" value={profile.code} mono />
              </dl>
            </ContentCard>
          </div>

          <ContentCard title="Registered address" icon={MapPin}>
            <p className="text-sm leading-relaxed text-foreground">{profile.address ?? '—'}</p>
          </ContentCard>

          <ContentCard title="Account summary" icon={Hash}>
            <dl className="detail-grid sm:grid-cols-2">
              <DetailField label="Legal name" value={profile.name} />
              <DetailField label="Account status" value={profile.status} />
              <DetailField
                label="Credit limit"
                value={
                  profile.creditLimit != null ? formatInrAmount(profile.creditLimit) : null
                }
              />
              <DetailField label="Customer ID" value={String(profile.customerId)} mono />
            </dl>
          </ContentCard>

          <p className="text-center text-xs text-muted-foreground">
            <Mail className="mr-1 inline size-3.5 opacity-60" aria-hidden />
            Read-only view · updates are made by your plant administrator
          </p>
        </div>
      ) : null}
    </PageState>
  )
}
