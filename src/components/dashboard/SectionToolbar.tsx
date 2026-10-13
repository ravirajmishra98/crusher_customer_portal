import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

type SectionToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  placeholder: string
  totalCount: number
  filteredCount: number
  actions?: ReactNode
}

export function SectionToolbar({
  search,
  onSearchChange,
  placeholder,
  totalCount,
  filteredCount,
  actions,
}: SectionToolbarProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border/70 bg-muted/25 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{filteredCount}</span>
        {filteredCount !== totalCount ? (
          <>
            {' '}
            of {totalCount} records
          </>
        ) : (
          <> records</>
        )}
      </p>
      <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center sm:justify-end">
        {actions}
      <div className="input-icon-wrap w-full sm:max-w-xs">
        <span className="input-field-icon" aria-hidden>
          <Search className="size-3.5" />
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="input-field h-9 text-sm"
        />
      </div>
      </div>
    </div>
  )
}
