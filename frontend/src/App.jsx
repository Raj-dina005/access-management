import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import VisitorsPage from './pages/VisitorsPage';
import LogsPage from './pages/LogsPage';
import UsersPage from './pages/UsersPage';
import Layout from './components/layout/Layout';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#161b27',
              color: '#e2e8f0',
              border: '1px solid #1e2535',
              borderRadius: '12px',
              fontFamily: 'Sora, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#161b27' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#161b27' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/employees"  element={<EmployeesPage />} />
            <Route path="/visitors"   element={<VisitorsPage />} />
            <Route path="/logs"       element={<LogsPage />} />
            <Route path="/users"      element={
              <ProtectedRoute roles={['super_admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
