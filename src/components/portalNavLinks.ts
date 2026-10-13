import type { LucideIcon } from 'lucide-react'
import { BookOpen, FileText, Home, Scale, Truck, User } from 'lucide-react'

export type PortalNavLink = {
  to: string
  label: string
  shortLabel?: string
  icon: LucideIcon
  end?: boolean
}

export const portalNavLinks: PortalNavLink[] = [
  { to: '/', label: 'Home', shortLabel: 'Home', icon: Home, end: true },
  { to: '/dispatches', label: 'Dispatches', shortLabel: 'Trips', icon: Truck },
  { to: '/invoices', label: 'Invoices', shortLabel: 'Bills', icon: FileText },
  { to: '/outstanding', label: 'Outstanding', shortLabel: 'Due', icon: Scale },
  { to: '/ledger', label: 'Ledger', shortLabel: 'Ledger', icon: BookOpen },
  { to: '/account', label: 'Account', shortLabel: 'Profile', icon: User },
]
