import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, FileDown, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { fetchPortalInvoice } from '@/api/portal'
import { InvoiceDocument } from '@/components/invoice/InvoiceDocument'
import { PageState } from '@/components/PageState'
import type { PortalInvoiceDetail } from '@/types/portal'
import {
  downloadInvoiceHtml,
  downloadInvoiceWithFallback,
  exportInvoiceLineItemsCsv,
  printInvoiceWithFallback,
} from '@/lib/invoiceDownload'
import { usePortalLoadErrorHandler } from '@/hooks/usePortalLoad'

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const invoiceId = Number(id)
  const handleLoadError = usePortalLoadErrorHandler()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<PortalInvoiceDetail | null>(null)
  const [downloading, setDownloading] = useState(false)

  const load = useCallback(() => {
    if (!Number.isFinite(invoiceId)) {
      setError('Invalid invoice id.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetchPortalInvoice(invoiceId)
      .then(setInvoice)
      .catch((err) => {
        const msg = handleLoadError(err, 'Could not load invoice.')
        if (msg) setError(msg)
      })
      .finally(() => setLoading(false))
  }, [handleLoadError, invoiceId])

  useEffect(() => {
    load()
  }, [load])

  async function handleDownloadPdf() {
    if (!invoice) return
    setDownloading(true)
    try {
      const mode = await downloadInvoiceWithFallback(invoice)
      if (mode === 'pdf') {
        toast.success('Invoice PDF downloaded.')
      } else {
        toast.success(
          'Invoice saved (HTML). Open the file and use Print → Save as PDF, or use the Print button here.',
        )
      }
    } catch {
      toast.error('Could not download invoice.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <PageState
      loading={loading && !invoice}
      error={error}
      onRetry={load}
      skeleton={
        <div className="page-stack-wide skeleton-shimmer h-[28rem] rounded-2xl" />
      }
    >
      {invoice ? (
        <div className="page-stack-wide stagger-children">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/invoices" className="btn-ghost inline-flex w-fit px-3">
              <ArrowLeft className="size-4" aria-hidden />
              Back to invoices
            </Link>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-ghost h-10 gap-2 px-4"
                disabled={downloading}
                onClick={() => void handleDownloadPdf()}
              >
                <Download className="size-4" aria-hidden />
                {downloading ? 'Downloading…' : 'Download PDF'}
              </button>
              <button
                type="button"
                className="btn-ghost h-10 gap-2 px-4"
                onClick={() => {
                  const ok = printInvoiceWithFallback(invoice)
                  if (!ok) {
                    toast.error(
                      'Could not open print. Allow pop-ups for this site or use Download.',
                    )
                  }
                }}
              >
                <Printer className="size-4" aria-hidden />
                Print
              </button>
              <button
                type="button"
                className="btn-ghost h-10 gap-2 px-4"
                onClick={() => {
                  exportInvoiceLineItemsCsv(invoice)
                  toast.success('Line items exported.')
                }}
              >
                <FileDown className="size-4" aria-hidden />
                Export CSV
              </button>
              <button
                type="button"
                className="btn-ghost hidden h-10 gap-2 px-4 sm:inline-flex"
                onClick={() => {
                  downloadInvoiceHtml(invoice)
                  toast.success('Invoice HTML saved.')
                }}
              >
                Save HTML
              </button>
            </div>
          </div>

          <InvoiceDocument invoice={invoice} />
        </div>
      ) : null}
    </PageState>
  )
}
