import { useState } from 'react';
import {
  FiBell, FiCheckCircle, FiFilter, FiCheck,
  FiSend, FiUsers, FiMail, FiMessageSquare, 
} from 'react-icons/fi';
import { useNotifications } from '../../../context/NotificationContext';

// Config 
const TYPE_META = {
  submission_received: { icon: '📨', label: 'New Submission', color: '#f97316' },
  inquiry_received:    { icon: '📩', label: 'New Inquiry',    color: '#6366f1' }, // ← නව
  announcement:        { icon: '📢', label: 'Announcement',   color: '#f59e0b' }, // ← නව
};

const FILTERS = [
  { id: 'all',                 label: 'All'           },
  { id: 'unread',              label: 'Unread'        },
  { id: 'submission_received', label: 'Submissions'   },
  { id: 'inquiry_received',    label: 'Inquiries'     }, // ← නව
  { id: 'announcement',        label: 'Announcements' }, // ← නව
];

function timeAgo(date) {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  === 1) return 'Yesterday';
  return `${days}d ago`;
}

// Main 
export default function SupervisorNotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  // supervisor relevant types only
  const supervisorTypes = ['submission_received', 'inquiry_received', 'announcement']; // ← 2 types add
  const supervisorNotifications = notifications.filter(n => supervisorTypes.includes(n.type));

  const filtered = supervisorNotifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'all')    return true;
    return n.type === filter;
  });

  const supervisorUnread = supervisorNotifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}
          >
            <FiBell className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Notifications
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {supervisorUnread > 0 ? `${supervisorUnread} unread` : 'All caught up!'}
            </p>
          </div>
        </div>

        {supervisorUnread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--admin-primary)' }}
          >
            <FiCheckCircle className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',       value: supervisorNotifications.length,                                          icon: FiBell,          color: '#94a3b8' },
          { label: 'Unread',      value: supervisorUnread,                                                        icon: FiMail,          color: '#f97316' },
          { label: 'Submissions', value: supervisorNotifications.filter(n=>n.type==='submission_received').length, icon: FiSend,          color: '#22c55e' },
          { label: 'Inquiries',   value: supervisorNotifications.filter(n=>n.type==='inquiry_received').length,    icon: FiMessageSquare, color: '#6366f1' }, // ← නව stat
        ].map((s, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <FiFilter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: filter === f.id
                ? 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))'
                : 'var(--bg-card)',
              color:  filter === f.id ? '#000' : 'var(--text-secondary)',
              border: `1px solid ${filter === f.id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {f.label}
            {f.id === 'unread' && supervisorUnread > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                style={{ background: 'rgba(0,0,0,0.2)', color: filter==='unread' ? '#000' : 'var(--admin-primary)' }}
              >
                {supervisorUnread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notification List ── */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div
            className="py-20 text-center rounded-2xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <FiBell className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 font-medium">No notifications here</p>
            <p className="text-sm text-gray-600 mt-1">
              {filter !== 'all' ? 'Try a different filter' : 'No intern submissions yet'}
            </p>
          </div>
        ) : (
          filtered.map(n => {
            const meta = TYPE_META[n.type] || { icon: '🔔', label: n.type, color: '#94a3b8' };
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                className="flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:border-[var(--admin-primary)]"
                style={{
                  background:  n.isRead ? 'var(--bg-card)' : 'rgba(249,115,22,0.05)',
                  borderColor: n.isRead ? 'var(--border)' : 'rgba(249,115,22,0.3)',
                }}
              >
                {/* Icon bubble */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
                >
                  {meta.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{n.title}</p>
                      <p className="text-sm mt-0.5 text-gray-400 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.isRead
                      ? <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--admin-primary)' }} />
                      : <FiCheck className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    }
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: `${meta.color}18`, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}