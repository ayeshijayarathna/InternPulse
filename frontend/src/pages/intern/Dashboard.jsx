import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiGrid, FiCheckSquare, FiFileText, FiPlusCircle,
  FiLogOut, FiMenu, FiX, FiBell, FiUser, FiMessageSquare, FiCalendar, FiBarChart2, FiBook,
  FiSun, FiMoon, FiAlertTriangle, FiEdit3, FiCamera, FiInfo
} from 'react-icons/fi';

import { useNotifications }  from '../../context/NotificationContext';
import { useTheme }          from '../../context/ThemeContext';
import AvatarUpload          from '../../components/common/AvatarUpload';
import MyTasksPage           from './sections/MyTasksPage';
import MySubmissionsPage     from './sections/MySubmissionsPage';
import SubmitUpdatePage      from './sections/SubmitUpdatePage';
import OverviewPage          from './sections/OverviewPage';
import NotificationsPage     from './sections/intern_NotificationsPage';
import EditProfilePage       from './sections/EditProfilePage';
import InquiryPage           from './sections/intern_InquiryPage';
import InternRequiredDaysPage from './sections/InternRequiredDaysPage';
import InternChartsPage      from './sections/InternChartsPage';
import RecordBookPage        from './sections/RecordBookPage';

export default function InternDashboard() {
  const { user, logout, setUser }         = useAuth();
  const { unreadCount }                   = useNotifications();
  const { theme, toggleTheme }            = useTheme();
  const navigate                          = useNavigate();
  const [activeTab, setActiveTab]         = useState('overview');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [showWelcome, setShowWelcome]     = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('internpulse_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem('internpulse_welcome_seen', 'true');
    setShowWelcome(false);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { id: 'analytics',      label: 'Analytics',       icon: FiBarChart2     },
    { id: 'overview',       label: 'Overview',        icon: FiGrid          },
    { id: 'record-book',    label: 'Record Book',     icon: FiBook          },
    { id: 'tasks',          label: 'My Tasks',        icon: FiCheckSquare   },
    { id: 'submit',         label: 'Submit Update',   icon: FiPlusCircle    },
    { id: 'submissions',    label: 'My Submissions',  icon: FiFileText      },
    { id: 'inquiry',        label: 'My Inquiries',    icon: FiMessageSquare },
    { id: 'required-days',  label: 'Required Days',   icon: FiCalendar      },
    { id: 'notifications',  label: 'Notifications',   icon: FiBell, badge: unreadCount },
    { id: 'edit-profile',   label: 'Edit Profile',    icon: FiUser          },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':      return <InternChartsPage />;
      case 'overview':       return <OverviewPage setActiveTab={setActiveTab} />;
      case 'record-book':    return <RecordBookPage />;
      case 'tasks':          return <MyTasksPage />;
      case 'submit':         return <SubmitUpdatePage />;
      case 'submissions':    return <MySubmissionsPage />;
      case 'inquiry':        return <InquiryPage />;
      case 'required-days':  return <InternRequiredDaysPage />;
      case 'notifications':  return <NotificationsPage />;
      case 'edit-profile':   return <EditProfilePage />;
      default:               return <InternChartsPage />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-4 border-b backdrop-blur-xl"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
              {sidebarOpen ? <FiX className="w-5 h-5" style={{ color: 'var(--text-primary)' }} /> : <FiMenu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />}
            </button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-[#059669] to-[#0891b2] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>InternPulse</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    style={{ color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <AvatarUpload
              user={user} size="sm"
              accentColor="var(--intern-primary)"
              accentColor2="var(--intern-secondary)"
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
              <h1 className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{ fontFamily: 'var(--font-display)', backgroundImage: 'linear-gradient(135deg, var(--intern-primary), var(--intern-accent))' }}>
                InternPulse
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Intern Dashboard</p>
            </div>

            {/* Profile with notification bell */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <AvatarUpload
                  user={user} size="lg"
                  accentColor="var(--intern-primary)"
                  accentColor2="var(--intern-secondary)"
                  onUpdate={(updated) => setUser?.(updated)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</div>
                    <button onClick={() => setActiveTab('notifications')}
                            className="relative shrink-0 p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5">
                      <FiBell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-bold"
                              style={{ background: 'var(--intern-primary)', color: '#fff', padding: '0 3px' }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, var(--intern-primary), var(--intern-secondary))' }}>
                      <FiGrid className="w-3 h-3" />Intern
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
                            style={{
                              background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                              color: 'var(--text-secondary)',
                            }}>
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge > 0 && (
                        <span className="min-w-[20px] h-5 rounded-full flex items-center justify-center text-[11px] font-bold px-1 text-white"
                              style={{
                                background: isActive ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.15)',
                              }}>
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
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ color: 'var(--text-secondary)' }}>
                {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all hover:bg-red-50 dark:hover:bg-red-50 text-red-500">
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

      {/* ═══ First-Time Login Welcome Popup ═══ */}
      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center p-4"
             style={{ zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
             onClick={dismissWelcome}>
          <div className="w-full max-w-md rounded-3xl p-8 space-y-6 relative"
               style={{
                 background: 'linear-gradient(135deg, #0f0a1a 0%, #1a1030 100%)',
                 border: '1px solid rgba(139,92,246,0.25)',
                 boxShadow: '0 40px 120px rgba(109,40,217,0.25), 0 0 0 1px rgba(139,92,246,0.1)',
                 animation: 'popupIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
               }}
               onClick={(e) => e.stopPropagation()}>

            <style>{`
              @keyframes popupIn {
                from { opacity: 0; transform: scale(0.92) translateY(16px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>

            {/* Close button */}
            <button onClick={dismissWelcome}
                    className="absolute top-4 right-4 p-2 rounded-xl transition-all hover:bg-white/10"
                    style={{ color: '#94a3b8' }}>
              <FiX className="w-5 h-5" />
            </button>

            {/* Warning icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl opacity-50"
                     style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }} />
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.15))', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <FiAlertTriangle className="w-8 h-8" style={{ color: '#f59e0b' }} />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Important!
              </h2>
              <p className="text-sm" style={{ color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}>
                Complete your profile setup before getting started
              </p>
            </div>

            <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.3), transparent)' }} />

            {/* Profile Guide Steps */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <FiInfo className="w-4 h-4" style={{ color: '#a78bfa' }} />
                Profile Edit Guide
              </h3>
              <div className="space-y-3">
                {[
                  { step: '1', icon: FiCamera, color: '#22c55e', text: 'Click your avatar in the sidebar to upload a profile picture' },
                  { step: '2', icon: FiEdit3, color: '#3b82f6', text: 'Go to "Edit Profile" tab to update your personal information' },
                  { step: '3', icon: FiUser, color: '#a78bfa', text: 'Add your university, hometown, and contact details' },
                  { step: '4', icon: FiBook, color: '#f59e0b', text: 'Fill in your internship start and end dates' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl"
                       style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                         style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}30` }}>
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                        <span className="text-xs text-white font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {item.text}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button onClick={dismissWelcome}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/5"
                      style={{ color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                Skip for now
              </button>
              <button onClick={() => { dismissWelcome(); setActiveTab('edit-profile'); }}
                      className="flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#fff',
                               boxShadow: '0 8px 24px rgba(109,40,217,0.3)' }}>
                <FiEdit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
