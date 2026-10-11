import { Search } from 'lucide-react'

type SectionToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  placeholder: string
  totalCount: number
  filteredCount: number
}

export function SectionToolbar({
  search,
  onSearchChange,
  placeholder,
  totalCount,
  filteredCount,
}: SectionToolbarProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
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
  )
}
