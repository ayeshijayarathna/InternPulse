import { useState, useEffect } from 'react';
import {
  FiUsers, FiUserPlus, FiUserCheck, FiUserX,
  FiMail, FiCalendar, FiEdit2, FiTrash2,
  FiX, FiRefreshCw, FiSearch, FiDownload,
  FiEye, FiEyeOff, FiCopy, FiCheck, FiShield
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const EMPTY_FORM = { name: '', email: '', password: '', avatar: null };

function downloadInternsPDF(supervisorName, interns) {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const rows = interns.length === 0
    ? `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px">No interns</td></tr>`
    : interns.map((intern, i) => `
      <tr style="background:${i % 2 === 0 ? '#0f1117' : '#1a1f2e'}">
        <td style="padding:10px 14px"><div style="font-weight:600;color:#f1f5f9">${intern.name}</div></td>
        <td style="padding:10px 14px;color:#94a3b8">${intern.email}</td>
        <td style="padding:10px 14px">
          <span style="padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;
            background:${intern.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'};
            color:${intern.isActive ? '#22c55e' : '#ef4444'}">
            ${intern.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td style="padding:10px 14px;color:#94a3b8">${new Date(intern.createdAt).toLocaleDateString()}</td>
      </tr>`).join('');

  const activeCount = interns.filter(i => i.isActive).length;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Intern List — ${supervisorName}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#07080f;color:#f1f5f9;padding:40px}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}.logo{font-size:22px;font-weight:800;color:#fff}.logo span{color:#f59e0b}.meta{text-align:right;font-size:12px;color:#64748b}h1{font-size:26px;font-weight:700;color:#fff;margin-bottom:4px}.sub{font-size:13px;color:#94a3b8;margin-bottom:24px}.stats{display:flex;gap:12px;margin-bottom:24px}.stat{padding:12px 20px;border-radius:10px;background:#1a1f2e;border:1px solid rgba(255,255,255,0.07)}.stat-val{font-size:22px;font-weight:700;color:#fff}.stat-lbl{font-size:11px;color:#64748b;margin-top:2px}.divider{height:1px;background:rgba(255,255,255,0.08);margin-bottom:20px}table{width:100%;border-collapse:collapse}thead tr{background:linear-gradient(135deg,#f59e0b,#d97706)}thead th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:0.5px}.footer{margin-top:28px;text-align:center;font-size:11px;color:#334155}</style>
  </head><body>
  <div class="header"><div class="logo">Intern<span>Pulse</span></div><div class="meta">Generated: ${now}<br/>Supervisor Report</div></div>
  <h1>My Intern List</h1><div class="sub">Supervisor: <strong style="color:#fff">${supervisorName}</strong></div>
  <div class="stats">
    <div class="stat"><div class="stat-val">${interns.length}</div><div class="stat-lbl">Total Interns</div></div>
    <div class="stat"><div class="stat-val" style="color:#22c55e">${activeCount}</div><div class="stat-lbl">Active</div></div>
    <div class="stat"><div class="stat-val" style="color:#ef4444">${interns.length - activeCount}</div><div class="stat-lbl">Inactive</div></div>
  </div>
  <div class="divider"></div>
  <table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="footer">InternPulse · Confidential · ${now}</div></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) { win.onload = () => { win.print(); URL.revokeObjectURL(url); }; }
}

// ── Credentials Modal ─────────────────────────────────────────────────────────
function CredentialsModal({ credentials, onClose }) {
  const [copiedField, setCopiedField] = useState(null);
  const [showPass,    setShowPass]    = useState(false);

  const copy = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="w-full max-w-md rounded-2xl p-6 space-y-5"
           style={{ background: 'var(--bg-card)', border: '1px solid rgba(34,197,94,0.25)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(34,197,94,0.12)' }}>
            <FiShield className="w-5 h-5" style={{ color: '#22c55e' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Intern Account Created
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Share these login credentials with the intern
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)' }}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl text-xs"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
          ⚠️ Copy and share these credentials securely. This dialog cannot be reopened.
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>FULL NAME</div>
            <div className="text-sm text-white font-medium">{credentials.name}</div>
          </div>

          <div className="p-3 rounded-xl flex items-center justify-between gap-3"
               style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="min-w-0">
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>EMAIL</div>
              <div className="text-sm text-white font-medium truncate">{credentials.email}</div>
            </div>
            <button onClick={() => copy(credentials.email, 'email')}
                    className="shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/5"
                    style={{ color: copiedField === 'email' ? '#22c55e' : 'var(--text-secondary)' }}>
              {copiedField === 'email' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl flex items-center justify-between gap-3"
               style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>PASSWORD</div>
              <div className="text-sm text-white font-mono">
                {showPass ? credentials.password : '•'.repeat(credentials.password.length)}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setShowPass(p => !p)}
                      className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                      style={{ color: 'var(--text-secondary)' }}>
                {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
              <button onClick={() => copy(credentials.password, 'password')}
                      className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                      style={{ color: copiedField === 'password' ? '#22c55e' : 'var(--text-secondary)' }}>
                {copiedField === 'password' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button onClick={onClose}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}>
          Done — I've saved the credentials
        </button>
      </div>
    </div>
  );
}

export default function InternsPage() {
  const [interns,       setInterns]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [modal,         setModal]         = useState(null);
  const [editTarget,    setEditTarget]    = useState(null);
  const [formData,      setFormData]      = useState(EMPTY_FORM);
  const [showPass,      setShowPass]      = useState(false);
  const [formLoading,   setFormLoading]   = useState(false);
  const [formError,     setFormError]     = useState('');
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [credentials,   setCredentials]   = useState(null);

  useEffect(() => { fetchInterns(); }, []);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users/interns');
      setInterns(res.data);
    } catch (err) {
      console.error('Fetch interns error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = interns.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setFormData(EMPTY_FORM); setShowPass(false); setFormError(''); setModal('create'); };
  const openEdit   = (i) => { setEditTarget(i); setFormData({ name: i.name, email: i.email, password: '', avatar: null }); setShowPass(false); setFormError(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditTarget(null); setFormData(EMPTY_FORM); setFormError(''); setShowPass(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',  formData.name);
      fd.append('email', formData.email);
      if (formData.password) fd.append('password', formData.password);
      if (formData.avatar)   fd.append('avatar',   formData.avatar);

      if (modal === 'create') {
        if (!formData.password) { setFormError('Password is required'); setFormLoading(false); return; }
        await axiosInstance.post('/users/intern', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const savedCreds = { name: formData.name, email: formData.email, password: formData.password };
        closeModal();
        fetchInterns();
        setCredentials(savedCreds);
      } else {
        await axiosInstance.patch(`/users/intern/${editTarget._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        closeModal();
        fetchInterns();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally { setFormLoading(false); }
  };

  const handleToggle = async (internId, current) => {
    if (!window.confirm(`${current ? 'Deactivate' : 'Activate'} this intern?`)) return;
    setActionLoading(internId);
    try {
      await axiosInstance.patch(`/users/intern/${internId}/toggle`);
      fetchInterns();
    } catch { }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/users/intern/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchInterns();
    } catch { }
    finally { setDeleteLoading(false); }
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

      {credentials && (
        <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}>
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              My Interns
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {interns.length} interns under your supervision
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                      style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search intern..." value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="pl-9 pr-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 outline-none w-44"
                   style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
          </div>
          <button onClick={() => downloadInternsPDF('My Interns', interns)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                  style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--admin-primary)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <FiDownload className="w-4 h-4" /> PDF
          </button>
          <button onClick={fetchInterns}
                  className="p-2 rounded-xl border transition-all hover:bg-white/5"
                  style={{ borderColor: 'var(--border)' }}>
            <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-black transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}>
            <FiUserPlus className="w-4 h-4" /> Add Intern
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiUsers className="w-14 h-14 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold text-white mb-1">
            {search ? 'No interns match your search' : 'No interns yet'}
          </p>
          {!search && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your first intern to get started</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((intern) => (
            <div key={intern._id}
                 className="relative p-6 rounded-2xl border transition-all"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="absolute top-4 right-4">
                {intern.isActive ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />Inactive
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center text-center mb-4">
                {intern.avatar?.url ? (
                  <img src={intern.avatar.url} alt={intern.name}
                       className="w-20 h-20 rounded-full object-cover mb-3 border-2"
                       style={{ borderColor: 'var(--admin-primary)' }} />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 text-2xl font-bold text-white"
                       style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}>
                    {intern.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  {intern.name}
                </h3>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <FiMail className="w-4 h-4 shrink-0" /><span className="truncate">{intern.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <FiCalendar className="w-4 h-4 shrink-0" />
                  <span>Joined {new Date(intern.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(intern._id, intern.isActive)}
                        disabled={actionLoading === intern._id}
                        className="flex-1 py-2 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                        style={{ background: intern.isActive ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                                 color: intern.isActive ? '#ef4444' : '#22c55e',
                                 border: `1px solid ${intern.isActive ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}` }}>
                  {actionLoading === intern._id ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : intern.isActive ? <><FiUserX className="w-3.5 h-3.5" />Deactivate</>
                                      : <><FiUserCheck className="w-3.5 h-3.5" />Activate</>}
                </button>
                <button onClick={() => openEdit(intern)}
                        className="p-2 rounded-xl transition-all hover:bg-blue-500/10"
                        style={{ color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(intern)}
                        className="p-2 rounded-xl transition-all hover:bg-red-500/10"
                        style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5"
               style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {modal === 'create' ? 'Create New Intern' : 'Edit Intern'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-white/5"
                      style={{ color: 'var(--text-secondary)' }}>
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {formError && (
              <div className="p-3 rounded-xl text-sm"
                   style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full Name',     key: 'name',  type: 'text',  placeholder: 'Kasun Perera',     required: true },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'kasun@example.com', required: true },
              ].map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <input type={type} required={required} value={formData[key]}
                         onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                         placeholder={placeholder}
                         className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                         onFocus={e => e.target.style.border = '1px solid rgba(245,158,11,0.45)'}
                         onBlur={e  => e.target.style.border = '1px solid var(--border)'} />
                </div>
              ))}
              {/* Password with eye icon */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {modal === 'create' ? 'Password' : 'New Password (leave blank to keep)'}
                  {modal === 'create' && <span className="text-red-400"> *</span>}
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'}
                         required={modal === 'create'} value={formData.password}
                         placeholder="••••••••"
                         onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                         className="w-full px-4 pr-11 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                         onFocus={e => e.target.style.border = '1px solid rgba(245,158,11,0.45)'}
                         onBlur={e  => e.target.style.border = '1px solid var(--border)'} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                          style={{ color: 'var(--text-muted)' }}>
                    {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {/* Avatar */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Avatar (Optional)
                </label>
                <input type="file" accept="image/*"
                       onChange={e => setFormData(p => ({ ...p, avatar: e.target.files[0] || null }))}
                       className="w-full px-4 py-2.5 rounded-xl text-sm text-white"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-black disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}>
                  {formLoading ? 'Saving...' : modal === 'create' ? 'Create Intern' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5 text-center"
               style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                 style={{ background: 'rgba(239,68,68,0.10)' }}>
              <FiTrash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>Delete Intern</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Delete <strong className="text-white">{deleteTarget.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleteLoading}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}