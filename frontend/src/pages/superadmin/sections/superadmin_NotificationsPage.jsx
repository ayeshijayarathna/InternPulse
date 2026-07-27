import { useState } from 'react';
import {
  FiBell, FiCheckCircle, FiFilter, FiCheck,
  FiMail, FiMessageSquare
} from 'react-icons/fi';
import { useNotifications } from '../../../context/NotificationContext';

const TYPE_META = {
  admin_inquiry_received: { icon: '📩', label: 'Inquiry Received', color: '#dc2626' },
  admin_inquiry_reply:    { icon: '💬', label: 'Inquiry Reply',    color: '#6366f1' },
  announcement:           { icon: '📢', label: 'Announcement',     color: '#f59e0b' },
  welcome:                { icon: '👋', label: 'Welcome',          color: '#22c55e' },
};

const FILTERS = [
  { id: 'all',                    label: 'All'             },
  { id: 'unread',                 label: 'Unread'          },
  { id: 'admin_inquiry_received', label: 'Inquiries'       },
  { id: 'admin_inquiry_reply',    label: 'Replies'         },
  { id: 'announcement',           label: 'Announcements'   },
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

export default function SuperAdminNotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const adminTypes = ['admin_inquiry_received', 'admin_inquiry_reply', 'announcement', 'welcome'];
  const adminNotifications = notifications.filter(n => adminTypes.includes(n.type));

  const filtered = adminNotifications.filter(n => {
    if (filter === 'unread')  return !n.isRead;
    if (filter === 'all')     return true;
    return n.type === filter;
  });

  const adminUnread = adminNotifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            <FiBell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Notifications
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {adminUnread > 0 ? `${adminUnread} unread` : 'All caught up!'}
            </p>
          </div>
        </div>

        {adminUnread > 0 && (
          <button onClick={markAllRead}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: 'rgba(220,38,38,0.15)', color: '#dc2626' }}>
            <FiCheckCircle className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',       value: adminNotifications.length,                                                icon: FiBell,          color: '#94a3b8' },
          { label: 'Unread',      value: adminUnread,                                                               icon: FiMail,          color: '#dc2626' },
          { label: 'Inquiries',   value: adminNotifications.filter(n=>n.type==='admin_inquiry_received').length,     icon: FiMessageSquare, color: '#6366f1' },
          { label: 'Replies',     value: adminNotifications.filter(n=>n.type==='admin_inquiry_reply').length,        icon: FiMessageSquare, color: '#a78bfa' },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl border"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <FiFilter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: filter === f.id ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'var(--bg-card)',
                    color: filter === f.id ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${filter === f.id ? 'transparent' : 'var(--border)'}`,
                  }}>
            {f.label}
            {f.id === 'unread' && adminUnread > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: 'rgba(255,255,255,0.25)', color: filter==='unread' ? '#fff' : '#dc2626' }}>
                {adminUnread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <FiBell className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No notifications here</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {filter !== 'all' ? 'Try a different filter' : "You're all caught up!"}
            </p>
          </div>
        ) : (
          filtered.map(n => {
            const meta = TYPE_META[n.type] || { icon: '🔔', label: n.type, color: '#94a3b8' };
            return (
              <div key={n._id}
                   onClick={() => !n.isRead && markRead(n._id)}
                   className="flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:border-red-400"
                   style={{
                     background:  n.isRead ? 'var(--bg-card)' : 'rgba(220,38,38,0.05)',
                     borderColor: n.isRead ? 'var(--border)' : 'rgba(220,38,38,0.3)',
                   }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                     style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                      <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                    </div>
                    {!n.isRead
                      ? <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: '#dc2626' }} />
                      : <FiCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                    }
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                          style={{ background: `${meta.color}18`, color: meta.color }}>
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
