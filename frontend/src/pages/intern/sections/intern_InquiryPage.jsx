import { useState, useEffect } from 'react';
import {
  FiMessageSquare, FiPlus, FiSend, FiX, FiTrash2,
  FiEdit2, FiRefreshCw, FiClock, FiCheckCircle, FiChevronDown, FiChevronUp
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

const EMPTY_FORM = { subject: '', message: '' };

export default function InternInquiryPage() {
  const [inquiries,  setInquiries]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [editTarget, setEditTarget] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState('');
  const [deleting,   setDeleting]   = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/inquiries/my');
      setInquiries(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setEditTarget(null); setShowForm(true); };
  const openEdit   = (inq) => { setForm({ subject: inq.subject, message: inq.message }); setEditTarget(inq); setFormError(''); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditTarget(null); setForm(EMPTY_FORM); setFormError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editTarget) {
        const res = await axiosInstance.patch(`/inquiries/${editTarget._id}`, form);
        setInquiries(prev => prev.map(i => i._id === editTarget._id ? res.data : i));
      } else {
        const res = await axiosInstance.post('/inquiries', form);
        setInquiries(prev => [res.data, ...prev]);
      }
      closeForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (inq) => {
    if (!window.confirm('Delete this inquiry?')) return;
    setDeleting(inq._id);
    try {
      await axiosInstance.delete(`/inquiries/${inq._id}`);
      setInquiries(prev => prev.filter(i => i._id !== inq._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
           style={{ borderColor: 'var(--intern-primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,var(--intern-primary),var(--intern-secondary))' }}>
            <FiMessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>My Inquiries</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Send questions or concerns to your supervisor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetch} className="p-2 rounded-xl border hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
            <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg,var(--intern-primary),var(--intern-secondary))' }}>
            <FiPlus className="w-4 h-4" /> New Inquiry
          </button>
        </div>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="p-5 rounded-2xl border space-y-4"
             style={{ background: 'var(--bg-card)', borderColor: 'rgba(99,102,241,0.3)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">{editTarget ? 'Edit Inquiry' : 'New Inquiry'}</h3>
            <button onClick={closeForm} className="p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
              <FiX className="w-4 h-4" />
            </button>
          </div>
          {formError && (
            <div className="p-3 rounded-xl text-sm"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Subject <span className="text-red-400">*</span>
              </label>
              <input type="text" required value={form.subject}
                     onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                     placeholder="e.g. Question about task deadline"
                     className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                     style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Message <span className="text-red-400">*</span>
              </label>
              <textarea required rows={4} value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Describe your question or concern…"
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none resize-none"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={closeForm}
                      className="flex-1 py-2 rounded-xl font-semibold text-sm border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                      className="flex-1 py-2 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,var(--intern-primary),var(--intern-secondary))' }}>
                <FiSend className="w-3.5 h-3.5" />
                {saving ? 'Sending…' : editTarget ? 'Update' : 'Send Inquiry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {inquiries.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiMessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 mb-2">No inquiries yet</p>
          <button onClick={openCreate}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg,var(--intern-primary),var(--intern-secondary))' }}>
            Send your first inquiry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map(inq => {
            const sm     = STATUS_META[inq.status] || STATUS_META.open;
            const isOpen = expanded === inq._id;
            const canEdit = inq.replies?.length === 0 && inq.status === 'open';

            return (
              <div key={inq._id} className="rounded-2xl border overflow-hidden"
                   style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

                <button className="w-full flex items-start gap-3 p-4 text-left"
                        onClick={() => setExpanded(isOpen ? null : inq._id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                            style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <FiClock className="w-3 h-3" />{timeAgo(inq.createdAt)}
                      </span>
                      {inq.replies?.length > 0 && (
                        <span className="text-xs" style={{ color: '#6366f1' }}>
                          {inq.replies.length} reply
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{inq.subject}</p>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                      {inq.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {canEdit && (
                      <button onClick={() => openEdit(inq)}
                              className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-all"
                              style={{ color: '#60a5fa' }}>
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canEdit && (
                      <button onClick={() => handleDelete(inq)} disabled={deleting === inq._id}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                              style={{ color: '#ef4444' }}>
                        {deleting === inq._id
                          ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <FiTrash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {isOpen
                      ? <FiChevronUp className="w-4 h-4 text-gray-400 ml-1" />
                      : <FiChevronDown className="w-4 h-4 text-gray-400 ml-1" />}
                  </div>
                </button>

                {/* Expanded thread */}
                {isOpen && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-3" style={{ borderColor: 'var(--border)' }}>
                    {/* Original */}
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                      <div className="text-xs mb-1.5 font-semibold text-white">Your message</div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                        {inq.message}
                      </p>
                    </div>

                    {/* Replies */}
                    {inq.replies?.map((r, idx) => (
                      <div key={idx} className="p-3 rounded-xl ml-4"
                           style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <FiCheckCircle className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
                          <span className="text-xs font-semibold" style={{ color: '#6366f1' }}>Supervisor</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(r.createdAt)}</span>
                        </div>
                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{r.message}</p>
                      </div>
                    ))}

                    {inq.status === 'closed' && (
                      <div className="flex items-center gap-2 text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        Inquiry closed by supervisor
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