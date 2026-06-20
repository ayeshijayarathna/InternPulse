import { useState, useEffect } from 'react';
import {
  FiBell, FiPlus, FiEdit2, FiTrash2, FiX,
  FiRefreshCw, FiAlertCircle, FiCheck
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const PRIORITY_META = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'   },
  medium: { label: 'Medium', color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)'  },
  low:    { label: 'Low',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'   },
};

const EMPTY_FORM = { title: '', content: '', priority: 'medium' };

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

export default function SuperAdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(null); // 'create' | 'edit'
  const [editTarget,    setEditTarget]    = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [saving,        setSaving]        = useState(false);
  const [formError,     setFormError]     = useState('');
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [toast,         setToast]         = useState(null);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/announcements');
      setAnnouncements(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal('create'); };
  const openEdit   = (a)  => { setEditTarget(a); setForm({ title: a.title, content: a.content, priority: a.priority }); setFormError(''); setModal('edit'); };
  const closeModal = ()   => { setModal(null); setEditTarget(null); setForm(EMPTY_FORM); setFormError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (modal === 'create') {
        await axiosInstance.post('/announcements', form);
        showToast('success', 'Announcement sent to all supervisors!');
      } else {
        await axiosInstance.patch(`/announcements/${editTarget._id}`, form);
        showToast('success', 'Announcement updated.');
      }
      closeModal();
      fetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/announcements/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetch();
      showToast('success', 'Announcement deleted.');
    } catch { }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#dc2626', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
             style={{
               background:  toast.type === 'success' ? 'rgba(34,197,94,0.1)'  : 'rgba(239,68,68,0.1)',
               borderColor: toast.type === 'success' ? 'rgba(34,197,94,0.3)'  : 'rgba(239,68,68,0.3)',
               color:       toast.type === 'success' ? '#22c55e' : '#ef4444',
             }}>
          {toast.type === 'success' ? <FiCheck className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
            <FiBell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Announcements</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {announcements.length} total · sent to all supervisors
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetch} className="p-2 rounded-xl border hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
            <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
            <FiPlus className="w-4 h-4" /> New Announcement
          </button>
        </div>
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
              <div key={a._id} className="p-5 rounded-2xl border transition-all hover:border-red-500/30"
                   style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold border"
                            style={{ background: p.bg, color: p.color, borderColor: p.border }}>
                        {p.label} Priority
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(a.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">{a.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {a.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(a)}
                            className="p-2 rounded-lg hover:bg-blue-500/10 transition-all"
                            style={{ color: '#60a5fa' }}>
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(a)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-all"
                            style={{ color: '#ef4444' }}>
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-5"
               style={{ background: 'var(--bg-card)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{modal === 'create' ? 'New Announcement' : 'Edit Announcement'}</h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {formError && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Title <span className="text-red-400">*</span>
                </label>
                <input type="text" required value={form.title}
                       onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                       placeholder="e.g. Office Closure Notice"
                       className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Priority
                </label>
                <div className="flex gap-2">
                  {['low','medium','high'].map(p => (
                    <button key={p} type="button"
                            onClick={() => setForm(f => ({ ...f, priority: p }))}
                            className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border"
                            style={{
                              background:   form.priority === p ? PRIORITY_META[p].bg : 'transparent',
                              color:        form.priority === p ? PRIORITY_META[p].color : 'var(--text-secondary)',
                              borderColor:  form.priority === p ? PRIORITY_META[p].border : 'var(--border)',
                            }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea required rows={5} value={form.content}
                          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                          placeholder="Write your announcement here..."
                          className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none resize-none"
                          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={closeModal}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
                  {saving ? 'Saving…' : modal === 'create' ? 'Send to All Supervisors' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5 text-center"
               style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <FiTrash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Delete Announcement</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Delete "<strong className="text-white">{deleteTarget.title}</strong>"? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}