import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { mustChangePortalPassword } from '@/api/session'

/** Blocks dashboard until the customer completes a required password change. */
export function PortalPasswordGate() {
  const location = useLocation()

  if (mustChangePortalPassword()) {
    return <Navigate to="/change-password" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
