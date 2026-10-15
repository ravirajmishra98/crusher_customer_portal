import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ContentCardProps = {
  title?: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function ContentCard({ title, description, icon: Icon, children, className }: ContentCardProps) {
  return (
    <section className={cn('content-card', className)}>
      {title ? (
        <header className="content-card-header">
          <div className="flex items-start gap-3">
            {Icon ? (
              <div className="content-card-icon" aria-hidden>
                <Icon className="size-4" strokeWidth={2.25} />
              </div>
            ) : null}
            <div className="min-w-0">
              <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              {description ? (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>
        </header>
      ) : null}
      <div className={cn(title && 'content-card-body')}>{children}</div>
    </section>
  )
}
