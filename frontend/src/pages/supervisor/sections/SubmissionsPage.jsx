import { useState, useEffect } from 'react';
import {
  FiFileText, FiUser, FiClock, FiCheckCircle,
  FiDownload, FiPaperclip, FiRefreshCw, FiZap
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

// Only 2 types shown: submission (update) and self_task
const TYPE_META = {
  update:    { label: 'Submission',  icon: FiCheckCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)' },
  self_task: { label: 'Self Task',   icon: FiZap,         color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all');

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/updates');
      // Exclude blockers from supervisor view
      setSubmissions(res.data.filter(s => s.type !== 'blocker'));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const filtered = filter === 'all'
    ? submissions
    : submissions.filter(s => s.type === filter);

  const counts = {
    all:       submissions.length,
    update:    submissions.filter(s => s.type === 'update').length,
    self_task: submissions.filter(s => s.type === 'self_task').length,
  };

  const filterTabs = [
    { id: 'all',       label: 'All',         count: counts.all       },
    { id: 'update',    label: 'Submissions', count: counts.update    },
    { id: 'self_task', label: 'Self Tasks',  count: counts.self_task },
  ];

  const handleDownload = async (url, originalName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = originalName || 'attachment';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
             style={{ borderColor: 'var(--admin-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-secondary)] flex items-center justify-center">
            <FiFileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Submissions
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filtered.length} entries
            </p>
          </div>
        </div>
        <button onClick={fetchSubmissions}
                className="p-2 rounded-xl border transition-all hover:bg-white/5"
                style={{ borderColor: 'var(--border)' }}>
          <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',      value: counts.all,       color: '#94a3b8' },
          { label: 'Submissions', value: counts.update,   color: '#3b82f6' },
          { label: 'Self Tasks', value: counts.self_task, color: '#a78bfa' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl border"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-2xl font-bold text-white mb-1"
                 style={{ fontFamily: 'var(--font-display)', color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: filter === tab.id
                ? 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))'
                : 'var(--bg-card)',
              color:  filter === tab.id ? '#000' : 'var(--text-secondary)',
              border: filter === tab.id ? 'none' : '1px solid var(--border)',
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiFileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => {
            const meta    = TYPE_META[sub.type] || TYPE_META.update;
            const Icon    = meta.icon;

            return (
              <div key={sub._id}
                   className="p-5 rounded-xl border transition-all hover:border-[var(--admin-primary)]"
                   style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

                {/* Header row */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background: meta.bg }}>
                    <Icon className="w-5 h-5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase border"
                            style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}>
                        {meta.label}
                      </span>
                      {sub.taskId && (
                        <span className="text-sm font-semibold text-white">
                          {sub.taskId.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs flex-wrap"
                         style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1.5">
                        <FiUser className="w-3.5 h-3.5" />
                        {sub.createdBy?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5" />
                        {new Date(sub.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap mb-3 pl-14">
                  {sub.content}
                </p>

                {/* Attachments */}
                {sub.attachments?.length > 0 && (
                  <div className="pl-14 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold"
                         style={{ color: 'var(--text-secondary)' }}>
                      <FiPaperclip className="w-3.5 h-3.5" />
                      {sub.attachments.length} attachment{sub.attachments.length > 1 ? 's' : ''}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sub.attachments.map((file, idx) => (
                        <div key={idx}
                             className="flex items-center gap-3 p-3 rounded-lg border"
                             style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                          {file.resourceType === 'image' ? (
                            <img src={file.url} alt={file.originalName}
                                 className="w-12 h-12 rounded object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded flex items-center justify-center shrink-0"
                                 style={{ background: 'rgba(245,158,11,0.1)' }}>
                              <FiFileText className="w-6 h-6" style={{ color: 'var(--admin-primary)' }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {file.originalName}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {(file.fileSize / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(file.url, file.originalName)}
                            className="p-1.5 rounded-lg transition-all hover:bg-white/10 shrink-0"
                            style={{ color: 'var(--admin-primary)' }}
                            title="Download"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}