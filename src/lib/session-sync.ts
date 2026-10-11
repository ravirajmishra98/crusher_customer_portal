const SIGNAL_KEY = 'portal_session_signal'
const CHANNEL_NAME = 'portal_session'

export type PortalSessionSignal = {
  type: 'logout'
  at: number
}

let channel: BroadcastChannel | null = null

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME)
  return channel
}

/** Notify other tabs that this browser session ended (same origin). */
export function broadcastPortalLogout(): void {
  const payload: PortalSessionSignal = { type: 'logout', at: Date.now() }
  try {
    localStorage.setItem(SIGNAL_KEY, JSON.stringify(payload))
  } catch {
    /* private mode / quota */
  }
  getChannel()?.postMessage(payload)
}

export function subscribePortalSessionSignals(onLogout: () => void): () => void {
  const handlePayload = (raw: unknown) => {
    if (!raw || typeof raw !== 'object') return
    if ((raw as PortalSessionSignal).type === 'logout') onLogout()
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== SIGNAL_KEY || !event.newValue) return
    try {
      handlePayload(JSON.parse(event.newValue))
    } catch {
      /* ignore */
    }
  }

  window.addEventListener('storage', onStorage)

  const bc = getChannel()
  const onMessage = (event: MessageEvent) => handlePayload(event.data)
  bc?.addEventListener('message', onMessage)

  return () => {
    window.removeEventListener('storage', onStorage)
    bc?.removeEventListener('message', onMessage)
  }
}
