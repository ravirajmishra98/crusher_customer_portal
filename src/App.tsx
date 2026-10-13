import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { PortalLayout } from '@/components/PortalLayout'
import { PortalPasswordGate } from '@/components/PortalPasswordGate'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PortalAuthProvider } from '@/context/PortalAuthContext'
import { AccountPage } from '@/pages/AccountPage'
import { ChangePasswordPage } from '@/pages/ChangePasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DispatchDetailPage } from '@/pages/DispatchDetailPage'
import { DispatchesPage } from '@/pages/DispatchesPage'
import { InvoiceDetailPage } from '@/pages/InvoiceDetailPage'
import { InvoicesPage } from '@/pages/InvoicesPage'
import { LedgerPage } from '@/pages/LedgerPage'
import { LoginPage } from '@/pages/LoginPage'
import { OutstandingPage } from '@/pages/OutstandingPage'

export function App() {
  return (
    <PortalAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route element={<PortalPasswordGate />}>
              <Route element={<PortalLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="dispatches" element={<DispatchesPage />} />
                <Route path="dispatches/:id" element={<DispatchDetailPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="outstanding" element={<OutstandingPage />} />
                <Route path="ledger" element={<LedgerPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </PortalAuthProvider>
  )
}
