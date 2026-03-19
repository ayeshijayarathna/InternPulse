import { useEffect, useState } from 'react';
import { FiUsers, FiShield, FiArrowRight, FiUserCheck, FiUserX, FiSearch } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

export default function OverviewPage({ setActiveTab }) {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    axiosInstance.get('/super-admin/supervisors')
      .then(res => setSupervisors(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSupervisors  = supervisors.length;
  const activeSupervisors = supervisors.filter(s => s.isActive).length;
  // Fix: sum all internCount from each supervisor
  const totalInterns      = supervisors.reduce((sum, s) => sum + (s.internCount || 0), 0);

  const filtered = supervisors.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
             style={{ borderColor: '#dc2626', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          System Overview
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Platform-wide snapshot
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Supervisors',  value: totalSupervisors,  icon: FiShield,    color: '#dc2626' },
          { label: 'Active Supervisors', value: activeSupervisors, icon: FiUserCheck, color: '#22c55e' },
          { label: 'Total Interns',      value: totalInterns,      icon: FiUsers,     color: '#f59e0b' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label}
                 className="p-5 rounded-2xl border relative overflow-hidden"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20"
                   style={{ background: card.color }} />
              <div className="p-2 rounded-lg w-fit mb-3" style={{ background: `${card.color}22` }}>
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div className="text-3xl font-bold text-white mb-1"
                   style={{ fontFamily: 'var(--font-display)' }}>
                {card.value}
              </div>
              <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Supervisor list with search */}
      <div className="rounded-2xl border overflow-hidden"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b gap-4"
             style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-white shrink-0" style={{ fontFamily: 'var(--font-display)' }}>
            Supervisors
          </h3>
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                      style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs text-white placeholder-slate-600 outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            />
          </div>
          <button onClick={() => setActiveTab('supervisors')}
                  className="flex items-center gap-1 text-xs font-semibold shrink-0"
                  style={{ color: '#dc2626' }}>
            Manage all <FiArrowRight className="w-3 h-3" />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
            {search ? 'No supervisors match your search' : 'No supervisors yet'}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map((sup) => (
              <div key={sup._id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {sup.avatar?.url ? (
                    <img src={sup.avatar.url} alt={sup.name}
                         className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                         style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                      {sup.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-white">{sup.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sup.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                    {sup.internCount || 0} interns
                  </span>
                  {sup.isActive ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                          style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                      <FiUserCheck className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                      <FiUserX className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}