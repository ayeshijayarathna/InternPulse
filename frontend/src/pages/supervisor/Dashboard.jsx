import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity, FiUsers, FiCheckSquare, FiFileText,
  FiLogOut, FiMenu, FiX, FiBell, FiMessageSquare, FiVolume2, FiCalendar,
  FiSun, FiMoon
} from 'react-icons/fi';

import { useNotifications }  from '../../context/NotificationContext';
import { useTheme }          from '../../context/ThemeContext';
import AvatarUpload from '../../components/common/AvatarUpload';

import OverviewPage          from './sections/OverviewPage';
import InternsPage           from './sections/InternsPage';
import TasksPage             from './sections/TasksPage';
import SubmissionsPage       from './sections/SubmissionsPage';
import NotificationsPage     from './sections/supervisor_NotificationsPage';
import AnnouncementsPage     from './sections/supervisor_AnnouncementsPage';
import InquiriesPage         from './sections/supervisor_InquiriesPage';
import AdminInquiriesPage    from './sections/SupervisorAdminInquiriesPage';
import SupervisorRequiredDaysPage from './sections/SupervisorRequiredDaysPage';

export default function SupervisorDashboard() {
  const { user, logout, setUser }      = useAuth();
  const { unreadCount }                = useNotifications();
  const { theme, toggleTheme }         = useTheme();
  const navigate                       = useNavigate();
  const [activeTab, setActiveTab]      = useState('overview');
  const [sidebarOpen, setSidebarOpen]  = useState(false);

  const handleLogout = () => { logout(); navigate('/system/admin'); };

  const navItems = [
    { id: 'overview',       label: 'Overview',       icon: FiActivity      },
    { id: 'interns',        label: 'Interns',         icon: FiUsers         },
    { id: 'tasks',          label: 'Tasks',           icon: FiCheckSquare   },
    { id: 'submissions',    label: 'Submissions',     icon: FiFileText      },
    { id: 'inquiries',      label: 'Inquiries',       icon: FiMessageSquare },
    { id: 'admin-inquiries', label: 'Admin Inquiries', icon: FiMessageSquare },
    { id: 'announcements',  label: 'Announcements',   icon: FiVolume2       },
    { id: 'required-days',  label: 'Required Days',   icon: FiCalendar      },
    { id: 'notifications',  label: 'Notifications',   icon: FiBell, badge: unreadCount },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':       return <OverviewPage />;
      case 'interns':        return <InternsPage />;
      case 'tasks':          return <TasksPage />;
      case 'submissions':    return <SubmissionsPage />;
      case 'inquiries':      return <InquiriesPage />;
      case 'admin-inquiries': return <AdminInquiriesPage />;
      case 'announcements':  return <AnnouncementsPage />;
      case 'required-days':  return <SupervisorRequiredDaysPage />;
      case 'notifications':  return <NotificationsPage />;
      default:               return <OverviewPage />;
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
            <AvatarUpload
              user={user} size="sm"
              accentColor="var(--admin-primary)"
              accentColor2="var(--admin-secondary)"
              onUpdate={(updated) => setUser?.(updated)}
            />
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--admin-primary)] to-[var(--admin-secondary)] bg-clip-text text-transparent"
                  style={{ fontFamily: 'var(--font-display)' }}>InternPulse</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Supervisor Dashboard</p>
            </div>

            {/* Profile with notification bell */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <AvatarUpload
                  user={user} size="lg"
                  accentColor="var(--admin-primary)"
                  accentColor2="var(--admin-secondary)"
                  onUpdate={(updated) => setUser?.(updated)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
                    <button onClick={() => setActiveTab('notifications')}
                            className="relative shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/5">
                      <FiBell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                              style={{ background: '#dc2626', padding: '0 3px' }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))', color: '#000' }}>
                      <FiUsers className="w-3 h-3" />Supervisor
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
                            style={{ background: isActive ? 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' : 'transparent', color: isActive ? '#000' : 'var(--text-secondary)' }}>
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="min-w-[20px] h-5 rounded-full flex items-center justify-center text-[11px] font-bold px-1"
                              style={{ background: isActive ? 'rgba(0,0,0,0.2)' : 'var(--admin-primary)', color: '#000' }}>
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
