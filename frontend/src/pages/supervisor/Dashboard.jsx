import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity, FiUsers, FiCheckSquare, FiFileText,
  FiLogOut, FiMenu, FiX, FiBell, FiMessageSquare, FiVolume2 // ← නව icons
} from 'react-icons/fi';

import { useNotifications }  from '../../context/NotificationContext';
import AvatarUpload          from '../../components/common/AvatarUpload';
import OverviewPage          from './sections/OverviewPage';
import InternsPage           from './sections/InternsPage';
import TasksPage             from './sections/TasksPage';
import SubmissionsPage       from './sections/SubmissionsPage';
import NotificationsPage     from './sections/supervisor_NotificationsPage';
import AnnouncementsPage     from './sections/AnnouncementsPage';     // ← නව
import InquiriesPage         from './sections/InquiriesPage';         // ← නව

export default function SupervisorDashboard() {
  const { user, logout, setUser }      = useAuth();
  const { unreadCount }                = useNotifications();
  const navigate                       = useNavigate();
  const [activeTab, setActiveTab]      = useState('overview');
  const [sidebarOpen, setSidebarOpen]  = useState(false);

  const handleLogout = () => { logout(); navigate('/system/admin'); };

  const navItems = [
    { id: 'overview',       label: 'Overview',       icon: FiActivity      },
    { id: 'interns',        label: 'Interns',         icon: FiUsers         },
    { id: 'tasks',          label: 'Tasks',           icon: FiCheckSquare   },
    { id: 'submissions',    label: 'Submissions',     icon: FiFileText      },
    { id: 'inquiries',      label: 'Inquiries',       icon: FiMessageSquare }, // ← නව
    { id: 'announcements',  label: 'Announcements',   icon: FiVolume2       }, // ← නව
    { id: 'notifications',  label: 'Notifications',   icon: FiBell, badge: unreadCount },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewPage />;
      case 'interns':       return <InternsPage />;
      case 'tasks':         return <TasksPage />;
      case 'submissions':   return <SubmissionsPage />;
      case 'inquiries':     return <InquiriesPage />;         // ← නව
      case 'announcements': return <AnnouncementsPage />;     // ← නව
      case 'notifications': return <NotificationsPage />;
      default:              return <OverviewPage />;
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
              {sidebarOpen ? <FiX className="w-5 h-5 text-white" /> : <FiMenu className="w-5 h-5 text-white" />}
            </button>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              InternPulse
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setActiveTab('notifications'); setSidebarOpen(false); }}
                    className="relative p-2 rounded-xl hover:bg-white/5 transition-all">
              <FiBell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-black"
                      style={{ background: 'var(--admin-primary)', padding: '0 4px' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
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

            {/* Profile */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <AvatarUpload
                  user={user} size="lg"
                  accentColor="var(--admin-primary)"
                  accentColor2="var(--admin-secondary)"
                  onUpdate={(updated) => setUser?.(updated)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))', color: '#000' }}>
                      Supervisor
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

            <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
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