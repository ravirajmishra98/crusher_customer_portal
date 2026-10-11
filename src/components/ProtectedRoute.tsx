import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { usePortalAuth } from '@/context/PortalAuthContext'

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated } = usePortalAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
