import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07080f]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login
    if (role === 'super_admin') return <Navigate to="/sa-login" replace />;
    if (role === 'supervisor')  return <Navigate to="/system/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    if (user.role === 'super_admin')  return <Navigate to="/superadmin/dashboard" replace />;
    if (user.role === 'supervisor')   return <Navigate to="/supervisor/dashboard" replace />;
    return <Navigate to="/intern/dashboard" replace />;
  }

  return children;
}