import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiShield, FiUsers, FiLogOut, FiMenu, FiX, FiGrid, FiVolume2, FiBarChart2, FiFileText,
  FiBell, FiMessageSquare, FiSun, FiMoon
} from 'react-icons/fi';

import { useNotifications }  from '../../context/NotificationContext';
import { useTheme }          from '../../context/ThemeContext';
import AvatarUpload          from '../../components/common/AvatarUpload';
import SuperAdminOverview    from './sections/OverviewPage';
import SupervisorsPage       from './sections/SupervisorsPage';
import AnnouncementsPage     from './sections/superadmin_AnnouncementsPage';
import ChartsPage            from './sections/ChartsPage';
import ReportsPage           from './sections/ReportsPage';
import InquiriesPage         from './sections/superadmin_InquiriesPage';
import NotificationsPage     from './sections/superadmin_NotificationsPage';

export default function SuperAdminDashboard() {
  const { user, logout, setUser }    = useAuth();
  const { unreadCount }              = useNotifications();
  const { theme, toggleTheme }       = useTheme();
  const navigate                     = useNavigate();
  const [activeTab, setActiveTab]    = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/sa-login'); };

  const navItems = [
    { id: 'charts',         label: 'Analytics',       icon: FiBarChart2     },
    { id: 'overview',       label: 'Overview',        icon: FiGrid          },
    { id: 'supervisors',    label: 'Supervisors',     icon: FiUsers         },
    { id: 'announcements',  label: 'Announcements',   icon: FiVolume2       },
    { id: 'inquiries',      label: 'Inquiries',       icon: FiMessageSquare },
    { id: 'reports',        label: 'Reports',         icon: FiFileText      },
    { id: 'notifications',  label: 'Notifications',   icon: FiBell, badge: unreadCount },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'charts':        return <ChartsPage />;
      case 'overview':      return <SuperAdminOverview setActiveTab={setActiveTab} />;
      case 'supervisors':   return <SupervisorsPage />;
      case 'announcements': return <AnnouncementsPage />;
      case 'inquiries':     return <InquiriesPage />;
      case 'reports':       return <ReportsPage />;
      case 'notifications': return <NotificationsPage />;
      default:              return <ChartsPage />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-4 border-b backdrop-blur-xl"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/5">
              {sidebarOpen ? <FiX className="w-5 h-5" style={{ color: 'var(--text-primary)' }} /> : <FiMenu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />}
            </button>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>InternPulse</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-white/5 transition-all"
                    style={{ color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <button onClick={() => { setActiveTab('notifications'); setSidebarOpen(false); }}
                    className="relative p-2 rounded-xl hover:bg-white/5 transition-all"
                    style={{ color: 'var(--text-secondary)' }}>
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: '#dc2626', padding: '0 4px' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <AvatarUpload user={user} size="sm" accentColor="#dc2626" accentColor2="#b91c1c"
                          onUpdate={(updated) => setUser?.(updated)} />
          </div>
        </div>
      </div>

      <div className="flex">
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 border-r z-40 transition-transform lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `} style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col h-full">

            <div className="p-6 border-b hidden lg:block" style={{ borderColor: 'var(--border)' }}>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>InternPulse</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>System Administration</p>
            </div>

            {/* Profile */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <AvatarUpload user={user} size="lg" accentColor="#dc2626" accentColor2="#b91c1c"
                              onUpdate={(updated) => setUser?.(updated)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                      <FiShield className="w-3 h-3" />Super Admin
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>click avatar</span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon; const isActive = activeTab === item.id;
                  return (
                    <button key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all"
                            style={{ background: isActive ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'transparent', color: isActive ? '#fff' : 'var(--text-secondary)' }}>
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="min-w-[20px] h-5 rounded-full flex items-center justify-center text-[11px] font-bold px-1 text-white"
                              style={{ background: isActive ? 'rgba(255,255,255,0.3)' : '#dc2626' }}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
              <button onClick={toggleTheme}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all hover:bg-white/5"
                      style={{ color: 'var(--text-secondary)' }}>
                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all hover:bg-red-500/10 text-red-400">
                <FiLogOut className="w-5 h-5" /><span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
               onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
