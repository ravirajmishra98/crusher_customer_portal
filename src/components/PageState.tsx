import { AlertCircle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

type PageStateProps = {
  loading: boolean
  error: string | null
  onRetry: () => void
  children: ReactNode
  skeleton?: ReactNode
}

export function PageState({ loading, error, onRetry, children, skeleton }: PageStateProps) {
  if (loading && skeleton) return <>{skeleton}</>
  if (error) {
    return (
      <div className="page-stack-wide animate-fade-in-up">
        <div className="surface-card flex gap-3 border-destructive/30 p-4 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
        <button type="button" onClick={onRetry} className="btn-ghost h-10 w-fit px-5">
          <RefreshCw className="size-4" aria-hidden />
          Retry
        </button>
      </div>
    )
  }
  return <>{children}</>
}
