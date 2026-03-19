import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/common/ProtectedRoute';

import InternLogin      from './pages/auth/Internlogin';
import AdminLogin       from './pages/auth/Adminlogin';
import SuperAdminLogin  from './pages/auth/SuperAdminLogin';

import InternDashboard      from './pages/intern/Dashboard';
import SupervisorDashboard  from './pages/supervisor/Dashboard';
import SuperAdminDashboard  from './pages/superadmin/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ─────────────────────────────────────────── */}
          <Route path="/login"        element={<InternLogin />} />
          <Route path="/system/admin" element={<AdminLogin />} />

          {/* Super admin login — obfuscated URL */}
          <Route path="/sa-login" element={<SuperAdminLogin />} />

          {/* ── Intern ─────────────────────────────────────────── */}
          <Route path="/intern/dashboard"
            element={
              <ProtectedRoute role="intern">
                <InternDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Supervisor ─────────────────────────────────────── */}
          <Route path="/supervisor/dashboard"
            element={
              <ProtectedRoute role="supervisor">
                <SupervisorDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Super Admin ────────────────────────────────────── */}
          <Route path="/superadmin/dashboard"
            element={
              <ProtectedRoute role="super_admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all ──────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}