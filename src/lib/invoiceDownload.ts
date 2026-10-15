import { getApiBaseUrl, isPortalLoginBypassEnabled } from '@/config/env'
import { downloadBlob } from '@/lib/downloadBlob'
import { formatDate, formatDateTime, formatInrAmount } from '@/lib/format'
import { formatInvoiceLineQuantity, invoiceTotalQuantityLabel } from '@/lib/invoice-display'
import { invoiceStatusLabel } from '@/lib/invoiceStatus'
import type { PortalInvoiceDetail } from '@/types/portal'
import { getPortalToken } from '@/api/session'
import { exportCsvFile } from '@/lib/exportCsv'

const PRINT_FRAME_ID = 'portal-invoice-print-frame'

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_')
}

function escapeHtml(text: string | null | undefined): string {
  if (text == null) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function invoiceHtmlDocument(invoice: PortalInvoiceDetail, options?: { autoPrint?: boolean }): string {
  const items = invoice.items ?? []
  const rows = items
    .map(
      (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.challanNo ?? '—')}</td>
        <td>${escapeHtml(formatDateTime(item.grossTime))}</td>
        <td>${escapeHtml(item.vehicleNo ?? '—')}</td>
        <td>${escapeHtml(item.materialName ?? item.description ?? '—')}</td>
        <td style="text-align:right">${escapeHtml(formatInvoiceLineQuantity(item))}</td>
        <td style="text-align:right">${escapeHtml(formatInrAmount(item.amount ?? item.rate))}</td>
        <td style="text-align:right">${escapeHtml(formatInrAmount(item.transportAmt))}</td>
        <td style="text-align:right">${escapeHtml(formatInrAmount(item.taxableAmt ?? item.amount))}</td>
        <td style="text-align:right">${item.gstRate != null ? `${item.gstRate}%` : '—'}</td>
        <td style="text-align:right">${escapeHtml(formatInrAmount(item.totalAmt ?? item.amount))}</td>
      </tr>`,
    )
    .join('')

  const period =
    invoice.billingPeriodFrom || invoice.billingPeriodTo
      ? `${formatDate(invoice.billingPeriodFrom)} – ${formatDate(invoice.billingPeriodTo)}`
      : '—'

  const autoPrintScript = options?.autoPrint
    ? `<script>
        window.addEventListener('load', function () {
          setTimeout(function () { window.print(); }, 150);
        });
      </script>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(invoice.invoiceNo)}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #0f172a; margin: 2rem; font-size: 14px; }
    h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
    .muted { color: #64748b; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.5rem 0; }
    .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
    .box h2 { margin: 0 0 0.5rem; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 0.5rem 0.4rem; text-align: left; }
    th { font-size: 11px; text-transform: uppercase; color: #64748b; }
    .totals { margin-top: 1rem; max-width: 280px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 0.25rem 0; }
    .totals .grand { font-weight: 700; font-size: 1.1rem; border-top: 2px solid #0f172a; margin-top: 0.5rem; padding-top: 0.5rem; }
    @media print { body { margin: 0.5in; } }
  </style>
  ${autoPrintScript}
</head>
<body>
  <p class="muted">Tax invoice</p>
  <h1>${escapeHtml(invoice.invoiceNo)}</h1>
  <p class="muted">Date: ${escapeHtml(formatDate(invoice.invoiceDate))} · Status: ${escapeHtml(invoiceStatusLabel(invoice.status))}</p>
  <p class="muted">Billing period: ${escapeHtml(period)}</p>
  <div class="grid">
    <div class="box">
      <h2>Supplier</h2>
      <p><strong>${escapeHtml(invoice.companyName ?? '—')}</strong></p>
      <p class="muted">${escapeHtml(invoice.companyAddress ?? '')}</p>
      <p class="muted">GSTIN: ${escapeHtml(invoice.companyGstNo ?? '—')}</p>
    </div>
    <div class="box">
      <h2>Bill to</h2>
      <p><strong>${escapeHtml(invoice.customerName ?? '—')}</strong></p>
      <p class="muted">${escapeHtml(invoice.customerAddress ?? '')}</p>
      <p class="muted">GSTIN: ${escapeHtml(invoice.customerGstNo ?? '—')}</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Challan</th><th>Loaded</th><th>Vehicle</th><th>Material</th>
        <th style="text-align:right">Qty</th><th style="text-align:right">Material</th><th style="text-align:right">Transport</th>
        <th style="text-align:right">Taxable</th><th style="text-align:right">GST</th><th style="text-align:right">Line total</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="11">No line items</td></tr>'}</tbody>
  </table>
  <p class="muted">Total quantity: ${escapeHtml(invoiceTotalQuantityLabel(invoice))}</p>
  <div class="totals">
    <div><span>Taxable subtotal</span><span>${escapeHtml(formatInrAmount(invoice.subtotal))}</span></div>
    <div><span>GST</span><span>${escapeHtml(formatInrAmount(invoice.gstAmt))}</span></div>
    <div class="grand"><span>Total</span><span>${escapeHtml(formatInrAmount(invoice.totalAmt))}</span></div>
  </div>
  ${invoice.notes ? `<p class="muted" style="margin-top:1.5rem">Notes: ${escapeHtml(invoice.notes)}</p>` : ''}
</body>
</html>`
}

function getPrintFrame(): HTMLIFrameElement {
  let frame = document.getElementById(PRINT_FRAME_ID) as HTMLIFrameElement | null
  if (!frame) {
    frame = document.createElement('iframe')
    frame.id = PRINT_FRAME_ID
    frame.setAttribute('title', 'Invoice print')
    frame.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
    document.body.appendChild(frame)
  }
  return frame
}

export function exportInvoiceLineItemsCsv(invoice: PortalInvoiceDetail): void {
  const base = sanitizeFilename(invoice.invoiceNo)
  exportCsvFile(
    `${base}_line_items`,
    [
      'Challan',
      'Vehicle',
      'Material',
      'Qty',
      'Material amt',
      'Transport amt',
      'Taxable',
      'GST rate',
      'Line total',
    ],
    (invoice.items ?? []).map((item) => [
      item.challanNo,
      item.vehicleNo,
      item.materialName ?? item.description,
      formatInvoiceLineQuantity(item),
      item.amount,
      item.transportAmt,
      item.taxableAmt ?? item.amount,
      item.gstRate,
      item.totalAmt ?? item.amount,
    ]),
  )
}

export function downloadInvoiceHtml(invoice: PortalInvoiceDetail): void {
  const html = invoiceHtmlDocument(invoice)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  downloadBlob(`${sanitizeFilename(invoice.invoiceNo)}.html`, blob)
}

/** Print via hidden iframe (avoids popup blockers and noopener issues). */
export function printInvoice(invoice: PortalInvoiceDetail): boolean {
  if (typeof document === 'undefined') return false

  const frame = getPrintFrame()
  const doc = frame.contentDocument ?? frame.contentWindow?.document
  if (!doc) return false

  const html = invoiceHtmlDocument(invoice)
  doc.open()
  doc.write(html)
  doc.close()

  const win = frame.contentWindow
  if (!win) return false

  const runPrint = () => {
    try {
      win.focus()
      win.print()
    } catch {
      /* ignore */
    }
  }

  if (doc.readyState === 'complete') {
    setTimeout(runPrint, 200)
  } else {
    frame.onload = () => setTimeout(runPrint, 200)
  }

  return true
}

/** Open printable invoice in a new tab (blob URL). */
export function openInvoiceInNewTab(invoice: PortalInvoiceDetail, autoPrint = false): boolean {
  const html = invoiceHtmlDocument(invoice, { autoPrint })
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    URL.revokeObjectURL(url)
    return false
  }
  win.addEventListener('load', () => URL.revokeObjectURL(url), { once: true })
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return true
}

/** Tries server PDF at /portal/invoices/{id}/pdf; returns true if downloaded. */
export async function downloadPortalInvoicePdf(invoice: PortalInvoiceDetail): Promise<boolean> {
  if (isPortalLoginBypassEnabled()) return false

  const token = getPortalToken()
  const url = `${getApiBaseUrl()}/portal/invoices/${invoice.id}/pdf`
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 12_000)

  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    })

    if (!response.ok) return false

    const contentType = response.headers.get('content-type') ?? ''
    const blob = await response.blob()
    if (blob.size === 0) return false

    let looksLikePdf = contentType.includes('pdf') || contentType.includes('octet-stream')
    if (!looksLikePdf && blob.size >= 4) {
      const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
      looksLikePdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46
    }

    if (!looksLikePdf) return false

    const fromHeader = response.headers
      .get('content-disposition')
      ?.match(/filename="?([^";]+)"?/i)?.[1]
    const filename = fromHeader ?? `${sanitizeFilename(invoice.invoiceNo)}.pdf`
    downloadBlob(filename, blob)
    return true
  } finally {
    window.clearTimeout(timeout)
  }
}

export type InvoiceDownloadResult = 'pdf' | 'html' | 'print-failed'

export async function downloadInvoiceWithFallback(
  invoice: PortalInvoiceDetail,
): Promise<InvoiceDownloadResult> {
  try {
    const ok = await downloadPortalInvoicePdf(invoice)
    if (ok) return 'pdf'
  } catch {
    /* network / abort */
  }

  downloadInvoiceHtml(invoice)
  return 'html'
}

export function printInvoiceWithFallback(invoice: PortalInvoiceDetail): boolean {
  if (printInvoice(invoice)) return true
  return openInvoiceInNewTab(invoice, true)
}
