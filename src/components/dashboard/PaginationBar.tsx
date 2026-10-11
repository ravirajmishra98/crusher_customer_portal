import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type PaginationBarProps = {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function PaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className,
}: PaginationBarProps) {
  if (totalItems === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border/80 bg-muted/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4',
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{' '}
        of <span className="font-medium text-foreground">{totalItems}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Rows
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-medium text-foreground"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="btn-ghost size-8 p-0 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-medium tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="btn-ghost size-8 p-0 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
