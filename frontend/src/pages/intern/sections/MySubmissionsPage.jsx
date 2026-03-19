import { useEffect, useState } from 'react';
import {
  FiFileText, FiRefreshCw, FiPaperclip, FiImage, FiFile,
  FiCheckCircle, FiZap, FiLock
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const TYPE_META = {
  update:    { label: 'Update',    icon: FiCheckCircle, color: 'var(--success)',       bg: 'rgba(34,197,94,0.1)'  },
  self_task: { label: 'Self Task', icon: FiZap,         color: 'var(--intern-accent)', bg: 'rgba(124,58,237,0.1)' },
};

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all');
  const [expanded,    setExpanded]    = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/updates/my');
      // Exclude blockers from intern view
      setSubmissions(res.data.filter(s => s.type !== 'blocker'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const filtered = filter === 'all'
    ? submissions
    : submissions.filter(s => s.type === filter);

  const filterTabs = [
    { id: 'all',       label: 'All',        count: submissions.length },
    { id: 'update',    label: 'Updates',    count: submissions.filter(s => s.type === 'update').length    },
    { id: 'self_task', label: 'Self Tasks', count: submissions.filter(s => s.type === 'self_task').length },
  ];

  const isImageMime = (mime) => mime?.startsWith('image/');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            My Submissions
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {submissions.length} total · read-only after submission
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="p-2 rounded-xl border transition-all hover:bg-white/5"
          style={{ borderColor: 'var(--border)' }}
        >
          <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: filter === tab.id
                ? 'linear-gradient(135deg, var(--intern-primary), var(--intern-secondary))'
                : 'var(--bg-card)',
              color:  filter === tab.id ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${filter === tab.id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {tab.label}
            <span className="opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
               style={{ borderColor: 'var(--intern-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiFileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No submissions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const meta       = TYPE_META[sub.type] || TYPE_META.update;
            const Icon       = meta.icon;
            const isExpanded = expanded === sub._id;

            return (
              <div
                key={sub._id}
                className="rounded-2xl border overflow-hidden transition-all"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                {/* Card Header */}
                <button
                  className="w-full flex items-center gap-4 p-5 text-left"
                  onClick={() => setExpanded(isExpanded ? null : sub._id)}
                >
                  <div className="p-2 rounded-lg shrink-0" style={{ background: meta.bg }}>
                    <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ color: meta.color, background: meta.bg }}>
                        {meta.label}
                      </span>
                      {sub.taskId?.title && (
                        <span className="text-xs px-2 py-0.5 rounded"
                              style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' }}>
                          {sub.taskId.title}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white mt-1 line-clamp-1">{sub.content}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {sub.attachments?.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 justify-end"
                           style={{ color: 'var(--text-muted)' }}>
                        <FiPaperclip className="w-3 h-3" />
                        <span className="text-xs">{sub.attachments.length}</span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t pt-4 space-y-4"
                       style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-2"
                           style={{ color: 'var(--text-secondary)' }}>
                        Content
                      </div>
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                        {sub.content}
                      </p>
                    </div>

                    {sub.attachments?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2"
                             style={{ color: 'var(--text-secondary)' }}>
                          Attachments
                        </div>
                        <div className="space-y-2">
                          {sub.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all hover:bg-white/5"
                              style={{ borderColor: 'var(--border)' }}
                            >
                              {isImageMime(att.fileType)
                                ? <FiImage className="w-4 h-4 shrink-0" style={{ color: 'var(--intern-accent)' }} />
                                : <FiFile  className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                              }
                              <span className="flex-1 text-xs truncate text-white">
                                {att.originalName}
                              </span>
                              <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                                {att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : ''}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs"
                         style={{ color: 'var(--text-muted)' }}>
                      <FiLock className="w-3 h-3" />
                      Submission locked — cannot be edited or deleted
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