import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiActivity, FiUsers, FiCheckSquare, FiFileText, 
  FiLogOut, FiMenu, FiX, FiUser 
} from 'react-icons/fi';

// Import section pages
import OverviewPage from './sections/OverviewPage';
import InternsPage from './sections/InternsPage';
import TasksPage from './sections/TasksPage';
import SubmissionsPage from './sections/SubmissionsPage';

export default function SupervisorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/system/admin');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiActivity },
    { id: 'interns', label: 'Interns', icon: FiUsers },
    { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
    { id: 'submissions', label: 'Submissions', icon: FiFileText }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage />;
      case 'interns': return <InternsPage />;
      case 'tasks': return <TasksPage />;
      case 'submissions': return <SubmissionsPage />;
      default: return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-4 border-b backdrop-blur-xl"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5"
            >
              {sidebarOpen ? <FiX className="w-5 h-5 text-white" /> : <FiMenu className="w-5 h-5 text-white" />}
            </button>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              InternPulse
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-secondary)] flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 border-r z-40 transition-transform lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b hidden lg:block" style={{ borderColor: 'var(--border)' }}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--admin-primary)] to-[var(--admin-secondary)] bg-clip-text text-transparent"
                  style={{ fontFamily: 'var(--font-display)' }}>
                InternPulse
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Supervisor Dashboard</p>
            </div>

            {/* User Profile */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                {user?.avatar?.url ? (
                  <img 
                    src={user.avatar.url} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full border-2"
                    style={{ borderColor: 'var(--admin-primary)' }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-secondary)] flex items-center justify-center text-xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                  <div className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ 
                            background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))',
                            color: '#000'
                          }}>
                      Supervisor
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all"
                      style={{
                        background: isActive ? 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' : 'transparent',
                        color: isActive ? '#000' : 'var(--text-secondary)'
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all hover:bg-red-500/10 text-red-400"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}