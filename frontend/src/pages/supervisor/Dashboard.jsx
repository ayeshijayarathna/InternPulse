import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity, FiUsers, FiCheckSquare, FiFileText,
  FiLogOut, FiMenu, FiX, FiBell, FiCamera
} from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';

import { useNotifications }  from '../../context/NotificationContext';
import OverviewPage          from './sections/OverviewPage';
import InternsPage           from './sections/InternsPage';
import TasksPage             from './sections/TasksPage';
import SubmissionsPage       from './sections/SubmissionsPage';
import NotificationsPage     from './sections/supervisor_NotificationsPage';

export default function SupervisorDashboard() {
  const { user, logout, setUser }      = useAuth();
  const { unreadCount }                = useNotifications();
  const navigate                       = useNavigate();
  const [activeTab, setActiveTab]      = useState('overview');
  const [sidebarOpen, setSidebarOpen]  = useState(false);
  const [uploading, setUploading]      = useState(false);

  const handleLogout = () => { logout(); navigate('/system/admin'); };

  // Avatar upload 
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await axiosInstance.patch('/users/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (setUser) setUser(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Avatar update failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const navItems = [
    { id: 'overview',      label: 'Overview',     icon: FiActivity    },
    { id: 'interns',       label: 'Interns',       icon: FiUsers       },
    { id: 'tasks',         label: 'Tasks',         icon: FiCheckSquare },
    { id: 'submissions',   label: 'Submissions',   icon: FiFileText    },
    { id: 'notifications', label: 'Notifications', icon: FiBell, badge: unreadCount },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewPage />;
      case 'interns':       return <InternsPage />;
      case 'tasks':         return <TasksPage />;
      case 'submissions':   return <SubmissionsPage />;
      case 'notifications': return <NotificationsPage />;
      default:              return <OverviewPage />;
    }
  };

  // Avatar component (reusable) 
  const AvatarButton = ({ size = 'lg' }) => {
    const dim = size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
    const txt = size === 'lg' ? 'text-xl' : 'text-sm';
    return (
      <label className="relative cursor-pointer group shrink-0">
        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
        {user?.avatar?.url
          ? <img src={user.avatar.url} alt={user.name}
                 className={`${dim} rounded-full object-cover border-2 group-hover:opacity-80 transition-opacity`}
                 style={{ borderColor: 'var(--admin-primary)' }} />
          : (
            <div className={`${dim} rounded-full flex items-center justify-center ${txt} font-bold text-white group-hover:opacity-80 transition-opacity`}
                 style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}>
              {uploading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : user?.name?.charAt(0).toUpperCase()
              }
            </div>
          )}
        {/* Camera overlay */}
        <div className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
          {uploading
            ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <FiCamera className="w-3.5 h-3.5 text-white" />
          }
        </div>
      </label>
    );
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
            {/* Avatar — mobile */}
            <AvatarButton size="sm" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 border-r z-40 transition-transform lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `} style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col h-full">

            {/* Logo */}
            <div className="p-6 border-b hidden lg:block" style={{ borderColor: 'var(--border)' }}>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--admin-primary)] to-[var(--admin-secondary)] bg-clip-text text-transparent"
                  style={{ fontFamily: 'var(--font-display)' }}>
                InternPulse
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Supervisor Dashboard</p>
            </div>

            {/* User Profile — avatar clickable */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <AvatarButton size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                          style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))', color: '#000' }}>
                      Supervisor
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      click avatar to change
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon     = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all"
                            style={{
                              background: isActive ? 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' : 'transparent',
                              color: isActive ? '#000' : 'var(--text-secondary)',
                            }}>
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

            {/* Logout */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all hover:bg-red-500/10 text-red-400">
                <FiLogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
               onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}