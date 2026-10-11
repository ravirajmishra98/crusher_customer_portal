import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { PortalLayout } from '@/components/PortalLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PortalAuthProvider } from '@/context/PortalAuthContext'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'

export function App() {
  return (
    <PortalAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<PortalLayout />}>
              <Route index element={<DashboardPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </PortalAuthProvider>
  )
}
