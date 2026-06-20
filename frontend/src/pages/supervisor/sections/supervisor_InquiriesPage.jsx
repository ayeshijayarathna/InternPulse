import { useState, useEffect } from 'react';
import {
  FiMessageSquare, FiRefreshCw, FiSend, FiX,
  FiClock, FiCheckCircle, FiUser, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const STATUS_META = {
  open:    { label: 'Open',    color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  replied: { label: 'Replied', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  closed:  { label: 'Closed',  color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
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

export default function SupervisorInquiriesPage() {
  const [inquiries,   setInquiries]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState(null);
  const [replyText,   setReplyText]   = useState({});
  const [replying,    setReplying]    = useState(null);
  const [filter,      setFilter]      = useState('all');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/inquiries');
      setInquiries(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleReply = async (inquiryId) => {
    const msg = replyText[inquiryId]?.trim();
    if (!msg) return;
    setReplying(inquiryId);
    try {
      const res = await axiosInstance.post(`/inquiries/${inquiryId}/reply`, { message: msg });
      setInquiries(prev => prev.map(i => i._id === inquiryId ? res.data : i));
      setReplyText(prev => ({ ...prev, [inquiryId]: '' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Reply failed');
    } finally {
      setReplying(null);
    }
  };

  const handleClose = async (inquiryId) => {
    try {
      const res = await axiosInstance.patch(`/inquiries/${inquiryId}/status`);
      setInquiries(prev => prev.map(i => i._id === inquiryId ? res.data : i));
    } catch { }
  };

  const filtered = filter === 'all'
    ? inquiries
    : inquiries.filter(i => i.status === filter);

  const counts = {
    all:     inquiries.length,
    open:    inquiries.filter(i => i.status === 'open').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    closed:  inquiries.filter(i => i.status === 'closed').length,
  };

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
            <FiMessageSquare className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Inquiries</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {counts.open} open · {counts.replied} replied
            </p>
          </div>
        </div>
        <button onClick={fetch} className="p-2 rounded-xl border hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
          <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all',     label: `All (${counts.all})`         },
          { id: 'open',    label: `Open (${counts.open})`       },
          { id: 'replied', label: `Replied (${counts.replied})`  },
          { id: 'closed',  label: `Closed (${counts.closed})`   },
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: filter === t.id ? 'linear-gradient(135deg,var(--admin-primary),var(--admin-secondary))' : 'var(--bg-card)',
                    color:  filter === t.id ? '#000' : 'var(--text-secondary)',
                    border: filter === t.id ? 'none' : '1px solid var(--border)',
                  }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiMessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No inquiries here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(inq => {
            const sm        = STATUS_META[inq.status] || STATUS_META.open;
            const isOpen    = expanded === inq._id;
            return (
              <div key={inq._id} className="rounded-2xl border overflow-hidden"
                   style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

                {/* Card header */}
                <button className="w-full flex items-start gap-4 p-5 text-left"
                        onClick={() => setExpanded(isOpen ? null : inq._id)}>
                  {inq.createdBy?.avatar?.url
                    ? <img src={inq.createdBy.avatar.url} alt={inq.createdBy.name}
                           className="w-10 h-10 rounded-full object-cover shrink-0" />
                    : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                           style={{ background: 'linear-gradient(135deg,var(--intern-primary),var(--intern-secondary))' }}>
                        {inq.createdBy?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-bold text-white">{inq.createdBy?.name}</span>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                            style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{inq.subject}</p>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{inq.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{timeAgo(inq.createdAt)}</span>
                      <span>{inq.replies?.length || 0} replies</span>
                    </div>
                  </div>
                  {isOpen ? <FiChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                           : <FiChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t px-5 pb-5 pt-4 space-y-4" style={{ borderColor: 'var(--border)' }}>
                    {/* Original message */}
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <FiUser className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs font-semibold text-white">{inq.createdBy?.name}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(inq.createdAt)}</span>
                      </div>
                      <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                    </div>

                    {/* Replies thread */}
                    {inq.replies?.map((r, idx) => (
                      <div key={idx} className="p-4 rounded-xl ml-6"
                           style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <FiCheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--admin-primary)' }} />
                          <span className="text-xs font-semibold" style={{ color: 'var(--admin-primary)' }}>You (Supervisor)</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(r.createdAt)}</span>
                        </div>
                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{r.message}</p>
                      </div>
                    ))}

                    {/* Reply box (only if not closed) */}
                    {inq.status !== 'closed' && (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={replyText[inq._id] || ''}
                          onChange={e => setReplyText(prev => ({ ...prev, [inq._id]: e.target.value }))}
                          placeholder="Type your reply…"
                          className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none resize-none"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReply(inq._id)}
                            disabled={!replyText[inq._id]?.trim() || replying === inq._id}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
                            style={{ background: 'linear-gradient(135deg,var(--admin-primary),var(--admin-secondary))', color: '#000' }}>
                            <FiSend className="w-3.5 h-3.5" />
                            {replying === inq._id ? 'Sending…' : 'Send Reply'}
                          </button>
                          {inq.status === 'replied' && (
                            <button onClick={() => handleClose(inq._id)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              Close Inquiry
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {inq.status === 'closed' && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        This inquiry has been closed
                      </div>
                    )}
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