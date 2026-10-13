import { downloadBlob } from '@/lib/downloadBlob'

function escapeCsvCell(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value)
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ]
  return lines.join('\r\n')
}

export function exportCsvFile(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
): void {
  const csv = buildCsv(headers, rows)
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(filename.endsWith('.csv') ? filename : `${filename}.csv`, blob)
}
