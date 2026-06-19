import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiShield, FiUsers, FiLogOut, FiMenu, FiX, FiGrid, FiCamera
} from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';

import SuperAdminOverview from './sections/OverviewPage';
import SupervisorsPage    from './sections/SupervisorsPage';

export default function SuperAdminDashboard() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading]     = useState(false);
  const fileRef = useRef();

  const handleLogout = () => { logout(); navigate('/sa-login'); };

  //Avatar upload
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

  //  Avatar component 
  const AvatarButton = ({ size = 'lg' }) => {
    const dim = size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
    const txt = size === 'lg' ? 'text-xl' : 'text-sm';
    return (
      <label className="relative cursor-pointer group shrink-0">
        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
        {user?.avatar?.url
          ? <img src={user.avatar.url} alt={user.name}
                 className={`${dim} rounded-full object-cover border-2 group-hover:opacity-80 transition-opacity`}
                 style={{ borderColor: '#dc2626' }} />
          : (
            <div className={`${dim} rounded-full flex items-center justify-center ${txt} font-bold text-white group-hover:opacity-80 transition-opacity`}
                 style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
              {uploading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : user?.name?.charAt(0).toUpperCase()
              }
            </div>
          )}
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading
            ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <FiCamera className="w-3.5 h-3.5 text-white" />
          }
        </div>
      </label>
    );
  };

  const navItems = [
    { id: 'overview',    label: 'Overview',    icon: FiGrid  },
    { id: 'supervisors', label: 'Supervisors', icon: FiUsers },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':    return <SuperAdminOverview setActiveTab={setActiveTab} />;
      case 'supervisors': return <SupervisorsPage />;
      default:            return <SuperAdminOverview setActiveTab={setActiveTab} />;
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
          {/* Avatar — mobile */}
          <AvatarButton size="sm" />
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
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                InternPulse
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>System Administration</p>
            </div>

            {/* Profile — avatar clickable */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <AvatarButton size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                      <FiShield className="w-3 h-3" />
                      Super Admin
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      click to change
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nav */}
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
                              background: isActive ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'transparent',
                              color: isActive ? '#fff' : 'var(--text-secondary)',
                            }}>
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
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