import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StatCardProps = {
  label: string
  value: ReactNode
  hint?: string
  icon?: LucideIcon
  tone?: 'default' | 'primary' | 'success' | 'warning'
  className?: string
}

const toneIcon: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-slate-100 text-slate-600 ring-slate-200/80',
  primary: 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20',
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-800 ring-amber-500/25',
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  className,
}: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {hint ? <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
              toneIcon[tone],
            )}
            aria-hidden
          >
            <Icon className="size-[1.125rem]" strokeWidth={2.25} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
