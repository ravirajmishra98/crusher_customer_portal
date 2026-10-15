import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DetailFieldProps = {
  label: string
  value: ReactNode
  mono?: boolean
  className?: string
}

export function DetailField({ label, value, mono, className }: DetailFieldProps) {
  return (
    <div className={cn('detail-field', className)}>
      <dt className="detail-field-label">{label}</dt>
      <dd className={cn('detail-field-value', mono && 'font-mono text-[13px]')}>
        {value ?? '—'}
      </dd>
    </div>
  )
}
