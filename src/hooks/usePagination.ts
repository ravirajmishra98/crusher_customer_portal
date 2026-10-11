import { useEffect, useMemo, useState } from 'react'

export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const resetPage = () => setPage(1)

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    pageItems,
    resetPage,
  }
}
