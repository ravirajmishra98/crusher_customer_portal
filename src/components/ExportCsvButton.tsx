import { Download } from 'lucide-react'
import { toast } from 'sonner'

type ExportCsvButtonProps = {
  onExport: () => void
  disabled?: boolean
  label?: string
}

export function ExportCsvButton({
  onExport,
  disabled,
  label = 'Export CSV',
}: ExportCsvButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="btn-ghost h-9 shrink-0 gap-1.5 px-3 text-xs sm:text-sm"
      onClick={() => {
        try {
          onExport()
          toast.success('Export downloaded.')
        } catch {
          toast.error('Could not export.')
        }
      }}
    >
      <Download className="size-3.5" aria-hidden />
      {label}
    </button>
  )
}
