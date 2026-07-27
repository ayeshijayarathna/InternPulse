import { useState, useEffect } from 'react';
import {
  FiMessageSquare, FiSend, FiChevronDown, FiChevronUp, FiX, FiPlus, FiUser,
  FiCheck, FiAlertCircle
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

export default function SuperAdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ subject: '', message: '', supervisorId: '' });
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      const [inqRes, supRes] = await Promise.all([
        axiosInstance.get('/inquiries/admin'),
        axiosInstance.get('/super-admin/supervisors'),
      ]);
      setInquiries(inqRes.data);
      setSupervisors(supRes.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message || !form.supervisorId) return;
    setSending(true);
    try {
      await axiosInstance.post('/inquiries/admin', form);
      setForm({ subject: '', message: '', supervisorId: '' });
      setShowForm(false);
      fetchData();
      setToast({ type: 'success', msg: 'Inquiry sent successfully!' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.message || 'Failed to send inquiry' });
      setTimeout(() => setToast(null), 3000);
    } finally { setSending(false); }
  };

  const handleReply = async (id) => {
    const text = replyText[id];
    if (!text?.trim()) return;
    try {
      const res = await axiosInstance.post(`/inquiries/admin/${id}/reply`, { message: text });
      setInquiries(prev => prev.map(i => i._id === id ? res.data : i));
      setReplyText(prev => ({ ...prev, [id]: '' }));
      setToast({ type: 'success', msg: 'Reply sent! Supervisor has been notified.' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.message || 'Reply failed' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleClose = async (id) => {
    try {
      const res = await axiosInstance.patch(`/inquiries/admin/${id}/status`);
      setInquiries(prev => prev.map(i => i._id === id ? res.data : i));
    } catch {}
  };

  const filtered = inquiries.filter(i => filter === 'all' || i.status === filter);
  const counts = { all: inquiries.length, open: inquiries.filter(i => i.status === 'open').length, replied: inquiries.filter(i => i.status === 'replied').length, closed: inquiries.filter(i => i.status === 'closed').length };

  const statusColor = (s) => {
    if (s === 'open') return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' };
    if (s === 'replied') return { bg: 'rgba(99,102,241,0.15)', text: '#6366f1' };
    return { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' };
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
           style={{ borderColor: '#dc2626', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg backdrop-blur-sm transition-all"
             style={{
               background: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
               borderColor: toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
               color: toast.type === 'success' ? '#22c55e' : '#ef4444',
             }}>
          {toast.type === 'success' ? <FiCheck className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Inquiries
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Communicate with supervisors
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
          {showForm ? <FiX className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Inquiry'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate}
              className="rounded-2xl border p-5 space-y-4"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>To Supervisor</label>
            <select value={form.supervisorId} onChange={e => setForm({ ...form, supervisorId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <option value="">Select supervisor...</option>
              {supervisors.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>Subject</label>
            <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                   placeholder="Inquiry subject..."
                   className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                   style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>Message</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Write your inquiry..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <button type="submit" disabled={sending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            <FiSend className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Inquiry'}
          </button>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'replied', 'closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: filter === f ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'var(--bg-card)',
                    color: filter === f ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${filter === f ? 'transparent' : 'var(--border)'}`,
                  }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Inquiries list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <FiMessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No inquiries found</p>
          </div>
        ) : filtered.map(inq => {
          const isOpen = expandedId === inq._id;
          const sc = statusColor(inq.status);
          return (
            <div key={inq._id} className="rounded-2xl border overflow-hidden"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <button onClick={() => setExpandedId(isOpen ? null : inq._id)}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{inq.subject}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: sc.bg, color: sc.text }}>
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    To: {inq.supervisor?.name} · {new Date(inq.createdAt).toLocaleDateString()}
                    {inq.replies?.length > 0 && ` · ${inq.replies.length} replies`}
                  </p>
                </div>
                {isOpen ? <FiChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                        : <FiChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="pt-4">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{inq.message}</p>
                    <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                      Sent by {inq.createdBy?.name} · {new Date(inq.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Replies */}
                  {inq.replies?.length > 0 && (
                    <div className="space-y-3">
                      {inq.replies.map((r, i) => (
                        <div key={i} className="rounded-xl p-3"
                             style={{ background: 'var(--bg-surface)' }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                              {r.sender?.name || 'User'}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                                  style={{
                                    background: r.sender?.role === 'super_admin' ? 'rgba(220,38,38,0.15)' : 'rgba(245,158,11,0.15)',
                                    color: r.sender?.role === 'super_admin' ? '#dc2626' : '#f59e0b',
                                  }}>
                              {r.sender?.role === 'super_admin' ? 'Admin' : 'Supervisor'}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {new Date(r.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {inq.status !== 'closed' && (
                    <div className="flex gap-2">
                      <input type="text" value={replyText[inq._id] || ''}
                             onChange={e => setReplyText({ ...replyText, [inq._id]: e.target.value })}
                             onKeyDown={e => e.key === 'Enter' && handleReply(inq._id)}
                             placeholder="Type your reply..."
                             className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                             style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                      <button onClick={() => handleReply(inq._id)}
                              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                              style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                        <FiSend className="w-4 h-4" />
                      </button>
                      {inq.status === 'replied' && (
                        <button onClick={() => handleClose(inq._id)}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          Close
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
