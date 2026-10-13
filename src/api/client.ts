import { getApiBaseUrl } from '@/config/env'
import { clearPortalSession, getPortalToken } from './session'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function messageFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined
  const r = body as Record<string, unknown>
  if (typeof r.error === 'string' && r.error.trim()) return r.error
  if (typeof r.message === 'string' && r.message.trim()) return r.message
  return undefined
}

type PortalRequestOptions = RequestInit & {
  /** Portal login only — omit bearer token */
  anonymous?: boolean
}

export async function portalRequest<T>(
  path: string,
  options: PortalRequestOptions = {},
): Promise<T> {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const url = `${getApiBaseUrl()}${normalized}`

  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (!options.anonymous) {
    const token = getPortalToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = await response.json()
      message = messageFromBody(body) ?? message
    } catch {
      /* non-JSON */
    }
    if (response.status === 401 && !options.anonymous) {
      clearPortalSession({ broadcast: true })
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function portalFetchRaw(
  path: string,
  options: PortalRequestOptions = {},
): Promise<Response> {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const url = `${getApiBaseUrl()}${normalized}`

  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (!options.anonymous) {
    const token = getPortalToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(url, { ...options, headers })
}
