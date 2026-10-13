import type { PortalInvoiceDetail } from '@/types/portal'
import { formatDate, formatInrAmount } from '@/lib/format'
import { invoiceStatusBadgeClass, invoiceStatusLabel } from '@/lib/invoiceStatus'
import { cn } from '@/lib/utils'

type InvoiceDocumentProps = {
  invoice: PortalInvoiceDetail
  className?: string
}

function PartyBlock({
  title,
  name,
  address,
  gstNo,
}: {
  title: string
  name?: string | null
  address?: string | null
  gstNo?: string | null
}) {
  return (
    <div className="invoice-party">
      <p className="invoice-party-label">{title}</p>
      <p className="font-display mt-1 text-sm font-bold text-foreground">{name ?? '—'}</p>
      {address ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{address}</p> : null}
      <p className="mt-2 text-xs text-muted-foreground">
        GSTIN{' '}
        <span className="font-mono font-medium text-foreground">{gstNo?.trim() || '—'}</span>
      </p>
    </div>
  )
}

export function InvoiceDocument({ invoice, className }: InvoiceDocumentProps) {
  const items = invoice.items ?? []
  const lineTotal = items.reduce((sum, item) => sum + (item.totalAmt ?? item.amount ?? 0), 0)
  const subtotal = invoice.subtotal ?? (lineTotal > 0 ? lineTotal : null)
  const gstAmt = invoice.gstAmt
  const totalAmt = invoice.totalAmt

  const periodLabel =
    invoice.billingPeriodFrom || invoice.billingPeriodTo
      ? `${formatDate(invoice.billingPeriodFrom)} – ${formatDate(invoice.billingPeriodTo)}`
      : null

  return (
    <article className={cn('invoice-document', className)}>
      <header className="invoice-document-header">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Tax invoice
          </p>
          <h1 className="font-display mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {invoice.invoiceNo}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Issued {formatDate(invoice.invoiceDate)}</span>
            {periodLabel ? (
              <>
                <span aria-hidden>·</span>
                <span>Period {periodLabel}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <span className={invoiceStatusBadgeClass(invoice.status)}>
            {invoiceStatusLabel(invoice.status)}
          </span>
          <p className="font-display mt-3 text-2xl font-bold tabular-nums sm:text-3xl">
            {formatInrAmount(totalAmt)}
          </p>
          <p className="text-xs text-muted-foreground">Amount payable</p>
        </div>
      </header>

      <div className="invoice-document-parties">
        <PartyBlock
          title="Supplier"
          name={invoice.companyName}
          address={invoice.companyAddress}
          gstNo={invoice.companyGstNo}
        />
        <PartyBlock
          title="Bill to"
          name={invoice.customerName}
          address={invoice.customerAddress}
          gstNo={invoice.customerGstNo}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="invoice-lines">
          <thead>
            <tr>
              <th className="w-10">#</th>
              <th>Challan</th>
              <th>Vehicle</th>
              <th>Material / description</th>
              <th className="text-right">Net (MT)</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  No line items on this invoice.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id ?? idx}>
                  <td className="text-muted-foreground">{idx + 1}</td>
                  <td className="font-mono text-xs">{item.challanNo ?? '—'}</td>
                  <td className="font-mono text-xs">{item.vehicleNo ?? '—'}</td>
                  <td>{item.materialName ?? item.description ?? '—'}</td>
                  <td className="text-right tabular-nums">
                    {item.netWt != null ? item.netWt.toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="text-right tabular-nums">
                    {item.rate != null ? formatInrAmount(item.rate) : '—'}
                  </td>
                  <td className="text-right tabular-nums font-semibold">
                    {formatInrAmount(item.totalAmt ?? item.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="invoice-document-totals">
        <dl className="invoice-totals-grid">
          {invoice.totalNetWt != null ? (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">Total quantity</dt>
              <dd className="tabular-nums font-medium">
                {invoice.totalNetWt.toLocaleString('en-IN')} MT
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums font-medium">{formatInrAmount(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">GST</dt>
            <dd className="tabular-nums font-medium">{formatInrAmount(gstAmt)}</dd>
          </div>
          <div className="invoice-totals-grand flex justify-between gap-4">
            <dt>Grand total</dt>
            <dd className="font-display tabular-nums">{formatInrAmount(totalAmt)}</dd>
          </div>
        </dl>
      </footer>

      {invoice.notes ? (
        <p className="mt-6 rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Notes: </span>
          {invoice.notes}
        </p>
      ) : null}
    </article>
  )
}
