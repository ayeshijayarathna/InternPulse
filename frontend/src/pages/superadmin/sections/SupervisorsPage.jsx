import { useState } from 'react';
import { useEffect } from 'react';
import {
  FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiMail,
  FiCalendar, FiChevronDown, FiChevronUp, FiX,
  FiUserCheck, FiUserX, FiRefreshCw, FiSearch, FiDownload,
  FiEye, FiEyeOff, FiCopy, FiCheck, FiShield
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const EMPTY_FORM = { name: '', email: '', password: '' };

function downloadInternsPDF(supervisor, interns) {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const rows = interns.length === 0
    ? `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px">No interns assigned</td></tr>`
    : interns.map((intern, i) => `
      <tr style="background:${i % 2 === 0 ? '#0f1117' : '#1a1f2e'}">
        <td style="padding:10px 14px;color:#f1f5f9">${intern.name}</td>
        <td style="padding:10px 14px;color:#94a3b8">${intern.email}</td>
        <td style="padding:10px 14px">
          <span style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;
            background:${intern.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'};
            color:${intern.isActive ? '#22c55e' : '#ef4444'}">
            ${intern.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td style="padding:10px 14px;color:#94a3b8">${new Date(intern.createdAt).toLocaleDateString()}</td>
      </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Intern List — ${supervisor.name}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#07080f;color:#f1f5f9;padding:40px}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}.logo{font-size:22px;font-weight:800;color:#fff}.logo span{color:#dc2626}.meta{text-align:right;font-size:12px;color:#64748b}.title{font-size:28px;font-weight:700;color:#fff;margin-bottom:6px}.subtitle{font-size:14px;color:#94a3b8;margin-bottom:8px}.sup-card{display:inline-flex;align-items:center;gap:10px;padding:10px 16px;border-radius:10px;background:#1a1f2e;border:1px solid rgba(220,38,38,0.2);margin-bottom:28px}.sup-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#b91c1c);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff}.divider{height:1px;background:rgba(255,255,255,0.08);margin-bottom:24px}table{width:100%;border-collapse:collapse}thead tr{background:#dc2626}thead th{padding:11px 14px;text-align:left;font-size:12px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.5px}.footer{margin-top:32px;text-align:center;font-size:11px;color:#334155}.count{font-size:13px;color:#94a3b8;margin-bottom:12px}.count span{color:#f59e0b;font-weight:600}</style>
  </head><body>
  <div class="header"><div class="logo">Intern<span>Pulse</span></div><div class="meta">Generated: ${now}<br/>System Administration Report</div></div>
  <div class="title">Intern List Report</div><div class="subtitle">Supervised by</div>
  <div class="sup-card"><div class="sup-avatar">${supervisor.name.charAt(0).toUpperCase()}</div>
  <div><div style="font-weight:600;color:#fff;font-size:14px">${supervisor.name}</div><div style="font-size:12px;color:#64748b">${supervisor.email}</div></div></div>
  <div class="divider"></div><div class="count">Total interns: <span>${interns.length}</span></div>
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

  const copyToClipboard = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="w-full max-w-md rounded-2xl p-6 space-y-5"
           style={{ background: 'var(--bg-card)', border: '1px solid rgba(34,197,94,0.25)' }}>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(34,197,94,0.12)' }}>
            <FiShield className="w-5 h-5" style={{ color: '#22c55e' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Supervisor Created
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Save these credentials — password won't be shown again
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)' }}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-xl text-xs"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
          ⚠️ Copy and share these credentials securely. This dialog cannot be reopened.
        </div>

        {/* Credentials */}
        <div className="space-y-3">
          {/* Name */}
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>FULL NAME</div>
            <div className="text-sm text-white font-medium">{credentials.name}</div>
          </div>

          {/* Email */}
          <div className="p-3 rounded-xl flex items-center justify-between gap-3"
               style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="min-w-0">
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>EMAIL</div>
              <div className="text-sm text-white font-medium truncate">{credentials.email}</div>
            </div>
            <button onClick={() => copyToClipboard(credentials.email, 'email')}
                    className="shrink-0 p-1.5 rounded-lg transition-all hover:bg-white/5"
                    style={{ color: copiedField === 'email' ? '#22c55e' : 'var(--text-secondary)' }}>
              {copiedField === 'email' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
            </button>
          </div>

          {/* Password */}
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
              <button onClick={() => copyToClipboard(credentials.password, 'password')}
                      className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                      style={{ color: copiedField === 'password' ? '#22c55e' : 'var(--text-secondary)' }}>
                {copiedField === 'password' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button onClick={onClose}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          Done — I've saved the credentials
        </button>
      </div>
    </div>
  );
}

export default function SupervisorsPage() {
  const [supervisors,    setSupervisors]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [expandedId,     setExpandedId]     = useState(null);
  const [internMap,      setInternMap]      = useState({});
  const [internSearch,   setInternSearch]   = useState({});
  const [internsLoading, setInternsLoading] = useState(null);

  const [modal,         setModal]         = useState(null);
  const [editTarget,    setEditTarget]    = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [showPass,      setShowPass]      = useState(false);
  const [formLoading,   setFormLoading]   = useState(false);
  const [formError,     setFormError]     = useState('');
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [credentials,   setCredentials]   = useState(null); // shown after create

  useEffect(() => { fetchSupervisors(); }, []);

  const fetchSupervisors = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/super-admin/supervisors');
      setSupervisors(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  const toggleExpand = async (supId) => {
    if (expandedId === supId) { setExpandedId(null); return; }
    setExpandedId(supId);
    if (internMap[supId]) return;
    setInternsLoading(supId);
    try {
      const res = await axiosInstance.get(`/super-admin/supervisors/${supId}/interns`);
      setInternMap(prev => ({ ...prev, [supId]: res.data }));
    } catch { setInternMap(prev => ({ ...prev, [supId]: [] })); }
    finally { setInternsLoading(null); }
  };

  const openCreate = () => { setForm(EMPTY_FORM); setShowPass(false); setFormError(''); setModal('create'); };
  const openEdit   = (sup) => { setEditTarget(sup); setForm({ name: sup.name, email: sup.email, password: '' }); setShowPass(false); setFormError(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditTarget(null); setForm(EMPTY_FORM); setFormError(''); setShowPass(false); };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (modal === 'create') {
        await axiosInstance.post('/super-admin/supervisors', form);
        closeModal();
        fetchSupervisors();
        // Show credentials modal
        setCredentials({ name: form.name, email: form.email, password: form.password });
      } else {
        const payload = { name: form.name, email: form.email };
        if (form.password) payload.password = form.password;
        await axiosInstance.patch(`/super-admin/supervisors/${editTarget._id}`, payload);
        closeModal();
        fetchSupervisors();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally { setFormLoading(false); }
  };

  const handleToggle = async (supId) => {
    setActionLoading(supId);
    try {
      await axiosInstance.patch(`/super-admin/supervisors/${supId}/toggle`);
      fetchSupervisors();
    } catch { }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/super-admin/supervisors/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchSupervisors();
    } catch { }
    finally { setDeleteLoading(false); }
  };

  const filteredSups = supervisors.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
             style={{ borderColor: '#dc2626', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Credentials modal */}
      {credentials && (
        <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Supervisors
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {supervisors.length} total supervisors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                      style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search supervisor..." value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="pl-8 pr-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 outline-none w-48"
                   style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
          </div>
          <button onClick={fetchSupervisors}
                  className="p-2 rounded-xl border transition-all hover:bg-white/5"
                  style={{ borderColor: 'var(--border)' }}>
            <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
            <FiUserPlus className="w-4 h-4" /> Add Supervisor
          </button>
        </div>
      </div>

      {/* List */}
      {filteredSups.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiUsers className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold text-white mb-1">
            {search ? 'No supervisors match your search' : 'No supervisors yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSups.map((sup) => {
            const supInterns      = internMap[sup._id] || [];
            const isExpanded      = expandedId === sup._id;
            const iSearch         = internSearch[sup._id] || '';
            const filteredInterns = supInterns.filter(i =>
              i.name.toLowerCase().includes(iSearch.toLowerCase()) ||
              i.email.toLowerCase().includes(iSearch.toLowerCase())
            );

            return (
              <div key={sup._id} className="rounded-2xl border overflow-hidden"
                   style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="p-5 flex items-center gap-4">
                  {sup.avatar?.url ? (
                    <img src={sup.avatar.url} alt={sup.name}
                         className="w-12 h-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                         style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                      {sup.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{sup.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${sup.isActive ? 'text-green-400' : 'text-red-400'}`}
                            style={{ background: sup.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                        {sup.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <FiMail className="w-3 h-3" />{sup.email}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />Joined {new Date(sup.createdAt).toLocaleDateString()}
                      </span>
                      <span style={{ color: '#f59e0b' }}>
                        <FiUsers className="w-3 h-3 inline mr-1" />{sup.internCount || 0} interns
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleToggle(sup._id)} disabled={actionLoading === sup._id}
                            className="p-2 rounded-lg transition-all"
                            style={{ background: sup.isActive ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                                     color: sup.isActive ? '#ef4444' : '#22c55e' }}
                            title={sup.isActive ? 'Deactivate' : 'Activate'}>
                      {actionLoading === sup._id
                        ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        : sup.isActive ? <FiUserX className="w-4 h-4" /> : <FiUserCheck className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(sup)}
                            className="p-2 rounded-lg transition-all hover:bg-blue-500/10"
                            style={{ color: '#60a5fa' }}>
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(sup)}
                            className="p-2 rounded-lg transition-all hover:bg-red-500/10"
                            style={{ color: '#ef4444' }}>
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleExpand(sup._id)}
                            className="p-2 rounded-lg transition-all hover:bg-white/5"
                            style={{ color: 'var(--text-secondary)' }}>
                      {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-5 pb-5 pt-4 space-y-4"
                       style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs font-semibold uppercase tracking-wider"
                         style={{ color: 'var(--text-secondary)' }}>
                        Interns under {sup.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3"
                                    style={{ color: 'var(--text-muted)' }} />
                          <input type="text" placeholder="Search intern..."
                                 value={internSearch[sup._id] || ''}
                                 onChange={e => setInternSearch(prev => ({ ...prev, [sup._id]: e.target.value }))}
                                 className="pl-7 pr-2 py-1.5 rounded-lg text-xs text-white placeholder-slate-600 outline-none w-36"
                                 style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
                        </div>
                        <button onClick={() => downloadInternsPDF(sup, supInterns)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                                style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)' }}>
                          <FiDownload className="w-3.5 h-3.5" /> PDF Report
                        </button>
                      </div>
                    </div>

                    {internsLoading === sup._id ? (
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                             style={{ borderColor: '#dc2626' }} />Loading...
                      </div>
                    ) : filteredInterns.length === 0 ? (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {iSearch ? 'No interns match your search' : 'No interns assigned'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredInterns.map((intern) => (
                          <div key={intern._id}
                               className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                               style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                            {intern.avatar?.url ? (
                              <img src={intern.avatar.url} alt={intern.name}
                                   className="w-8 h-8 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                   style={{ background: 'linear-gradient(135deg, var(--intern-primary), var(--intern-secondary))' }}>
                                {intern.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-white truncate">{intern.name}</div>
                              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{intern.email}</div>
                            </div>
                            <div className="w-2 h-2 rounded-full shrink-0"
                                 style={{ background: intern.isActive ? '#22c55e' : '#ef4444' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5"
               style={{ background: 'var(--bg-card)', border: '1px solid rgba(220,38,38,0.15)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {modal === 'create' ? 'Add Supervisor' : 'Edit Supervisor'}
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
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input type="text" required value={form.name} placeholder="John Silva"
                       onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                       className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                       onFocus={e => e.target.style.border = '1px solid rgba(220,38,38,0.45)'}
                       onBlur={e  => e.target.style.border = '1px solid var(--border)'} />
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email <span className="text-red-400">*</span>
                </label>
                <input type="email" required value={form.email} placeholder="john@company.com"
                       onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                       className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                       onFocus={e => e.target.style.border = '1px solid rgba(220,38,38,0.45)'}
                       onBlur={e  => e.target.style.border = '1px solid var(--border)'} />
              </div>
              {/* Password with eye icon */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {modal === 'create' ? 'Password' : 'New Password (leave blank to keep)'}
                  {modal === 'create' && <span className="text-red-400"> *</span>}
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'}
                         required={modal === 'create'} value={form.password}
                         placeholder="••••••••"
                         onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                         className="w-full px-4 pr-11 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                         onFocus={e => e.target.style.border = '1px solid rgba(220,38,38,0.45)'}
                         onBlur={e  => e.target.style.border = '1px solid var(--border)'} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                          style={{ color: 'var(--text-muted)' }}>
                    {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                  {formLoading ? 'Saving...' : modal === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5 text-center"
               style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                 style={{ background: 'rgba(239,68,68,0.10)' }}>
              <FiTrash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                Delete Supervisor
              </h3>
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