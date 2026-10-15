import { Link } from 'react-router-dom'
import type { PortalInvoiceDetail } from '@/types/portal'
import { formatDate, formatDateTime, formatInrAmount } from '@/lib/format'
import {
  documentTypeLabel,
  formatInvoiceLineQuantity,
  invoiceTotalQuantityLabel,
  transportModeLabel,
} from '@/lib/invoice-display'
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
  const tripCount = items.length
  const totalQtyLabel = invoiceTotalQuantityLabel(invoice)
  const materialSubtotal = items.reduce((s, i) => s + (i.amount ?? 0), 0)
  const transportSubtotal = items.reduce((s, i) => s + (i.transportAmt ?? 0), 0)
  const subtotal = invoice.subtotal
  const gstAmt = invoice.gstAmt
  const totalAmt = invoice.totalAmt

  const periodLabel =
    invoice.billingPeriodFrom || invoice.billingPeriodTo
      ? `${formatDate(invoice.billingPeriodFrom)} – ${formatDate(invoice.billingPeriodTo)}`
      : null

  return (
    <article className={cn('invoice-document', className)}>
      <header className="invoice-document-header">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {documentTypeLabel(invoice.documentType)}
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

      <dl className="grid gap-3 border-b border-border/80 pb-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Transport billing
          </dt>
          <dd className="mt-0.5 capitalize">{transportModeLabel(invoice.transportInvoiceMode)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Payment
          </dt>
          <dd className="mt-0.5 capitalize">
            {invoice.paymentStatus?.replace(/_/g, ' ') ?? '—'}
            {invoice.dueAmt != null ? ` · Due ${formatInrAmount(invoice.dueAmt)}` : ''}
            {invoice.paidAmt != null ? ` · Paid ${formatInrAmount(invoice.paidAmt)}` : ''}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Document
          </dt>
          <dd className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {invoice.einvoicingRequired ? 'E-invoicing applies to this supplier.' : 'Standard tax invoice'}
            {invoice.createdAt ? (
              <>
                <br />
                Generated {formatDateTime(invoice.createdAt)}
              </>
            ) : null}
          </dd>
        </div>
      </dl>

      {(invoice.irn || invoice.einvoiceStatus || invoice.ackNo) && (
        <div className="flex flex-wrap gap-3 py-4 text-xs text-muted-foreground">
          {invoice.irn ? (
            <span>
              IRN: <span className="font-mono text-foreground">{invoice.irn}</span>
            </span>
          ) : null}
          {invoice.ackNo ? <span>Ack {invoice.ackNo}</span> : null}
          {invoice.ackDate ? <span>Ack date {invoice.ackDate}</span> : null}
          {invoice.einvoiceStatus ? <span>e-Invoice: {invoice.einvoiceStatus}</span> : null}
        </div>
      )}

      <div className="grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Trips', value: String(tripCount) },
          { label: 'Quantity', value: totalQtyLabel },
          { label: 'Taxable subtotal', value: formatInrAmount(subtotal) },
          { label: 'Invoice total', value: formatInrAmount(totalAmt), emphasis: true },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={cn('bg-card px-4 py-3', kpi.emphasis && 'bg-primary/[0.04]')}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {kpi.label}
            </p>
            <p
              className={cn(
                'mt-0.5 text-lg font-semibold tabular-nums',
                kpi.emphasis && 'text-primary',
              )}
            >
              {kpi.value}
            </p>
            {kpi.label === 'Invoice total' ? (
              <p className="text-xs text-muted-foreground">GST {formatInrAmount(gstAmt)}</p>
            ) : null}
          </div>
        ))}
      </div>

      {(materialSubtotal > 0 || transportSubtotal > 0) && (
        <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border sm:grid-cols-3">
          {[
            { label: 'Material (lines)', value: formatInrAmount(materialSubtotal) },
            { label: 'Transport (lines)', value: formatInrAmount(transportSubtotal) },
            {
              label: 'Taxable + GST',
              value: `${formatInrAmount(subtotal)} + ${formatInrAmount(gstAmt)}`,
            },
          ].map((row) => (
            <div key={row.label} className="bg-card px-4 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {row.label}
              </p>
              <p className="mt-0.5 text-sm font-medium tabular-nums">{row.value}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-6 text-sm font-semibold">Line items (dispatch trips)</h2>
      <div className="mt-2 overflow-x-auto rounded-lg border border-border/80">
        <table className="invoice-lines">
          <thead>
            <tr>
              <th className="w-10">#</th>
              <th>Challan</th>
              <th className="hidden md:table-cell">Loaded</th>
              <th>Vehicle</th>
              <th>Material</th>
              <th className="hidden lg:table-cell">HSN</th>
              <th className="text-right">Qty</th>
              <th className="hidden sm:table-cell text-right">Material</th>
              <th className="hidden sm:table-cell text-right">Transport</th>
              <th className="hidden md:table-cell text-right">Taxable</th>
              <th className="hidden lg:table-cell text-right">GST</th>
              <th className="text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-10 text-center text-sm text-muted-foreground">
                  No line items on this invoice.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id ?? idx}>
                  <td className="text-muted-foreground">{idx + 1}</td>
                  <td className="min-w-[120px] whitespace-nowrap font-mono text-xs">
                    {item.challanNo ?? '—'}
                    {item.weighmentId ? (
                      <Link
                        className="ml-2 font-sans text-primary hover:underline print:hidden"
                        to={`/dispatches/${item.weighmentId}`}
                      >
                        Trip #{item.weighmentId}
                      </Link>
                    ) : null}
                    {item.itemType ? (
                      <p className="mt-0.5 font-sans text-[10px] uppercase text-muted-foreground">
                        {item.itemType}
                      </p>
                    ) : null}
                  </td>
                  <td className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">
                    {formatDateTime(item.grossTime)}
                  </td>
                  <td className="font-mono text-xs">{item.vehicleNo ?? '—'}</td>
                  <td className="max-w-[120px] truncate">
                    {item.materialName ?? item.description ?? '—'}
                  </td>
                  <td className="hidden lg:table-cell">{item.hsnSac ?? '—'}</td>
                  <td className="text-right tabular-nums text-sm">
                    {formatInvoiceLineQuantity(item)}
                    {item.netWt != null && item.quantity != null && item.unit === 'MT' ? (
                      <p className="text-[10px] text-muted-foreground">
                        Net {item.netWt >= 1000 ? `${item.netWt / 1000} MT` : `${item.netWt} kg`}
                      </p>
                    ) : null}
                  </td>
                  <td className="hidden text-right tabular-nums sm:table-cell">
                    {item.rate != null ? (
                      <>
                        {formatInrAmount(item.rate)}
                        {item.amount != null ? (
                          <p className="text-[10px] text-muted-foreground">
                            {formatInrAmount(item.amount)}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="hidden text-right tabular-nums sm:table-cell">
                    {item.transportApplicable || item.transportAmt != null ? (
                      <>
                        {item.transportRate != null
                          ? `${formatInrAmount(item.transportRate)}/MT`
                          : '—'}
                        {item.transportAmt != null ? (
                          <p className="text-[10px] text-muted-foreground">
                            {formatInrAmount(item.transportAmt)}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="hidden text-right tabular-nums md:table-cell">
                    {formatInrAmount(item.taxableAmt ?? item.amount)}
                    {item.royaltyAmt != null && item.royaltyAmt > 0 ? (
                      <p className="text-[10px] text-muted-foreground">
                        Royalty {formatInrAmount(item.royaltyAmt)}
                      </p>
                    ) : null}
                  </td>
                  <td className="hidden text-right tabular-nums lg:table-cell">
                    {item.gstRate != null ? `${item.gstRate}%` : '—'}
                    {item.gstAmt != null ? (
                      <p className="text-[10px] text-muted-foreground">
                        {formatInrAmount(item.gstAmt)}
                      </p>
                    ) : null}
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
          <div className="flex justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">Taxable subtotal</dt>
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
