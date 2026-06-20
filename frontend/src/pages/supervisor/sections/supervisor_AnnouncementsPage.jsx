import { useState, useEffect } from 'react';
import { FiBell, FiRefreshCw, FiClock } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const PRIORITY_META = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)'  },
  medium: { label: 'Medium', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' },
  low:    { label: 'Low',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)'  },
};

function timeAgo(date) {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function SupervisorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/announcements');
      setAnnouncements(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
           style={{ borderColor: 'var(--admin-primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,var(--admin-primary),var(--admin-secondary))' }}>
            <FiBell className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Announcements
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              From System Administration · {announcements.length} total
            </p>
          </div>
        </div>
        <button onClick={fetch} className="p-2 rounded-xl border hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
          <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* List */}
      {announcements.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => {
            const p = PRIORITY_META[a.priority] || PRIORITY_META.medium;
            return (
              <div key={a._id}
                   className="p-5 rounded-2xl border transition-all"
                   style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', borderLeft: `3px solid ${p.color}` }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold border"
                        style={{ background: p.bg, color: p.color, borderColor: p.border }}>
                    {p.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <FiClock className="w-3 h-3" />{timeAgo(a.createdAt)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{a.title}</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {a.content}
                </p>
                <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Posted on {new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}