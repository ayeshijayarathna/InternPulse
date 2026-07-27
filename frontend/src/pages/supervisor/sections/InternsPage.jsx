import { useState, useEffect } from 'react';
import {
  FiUsers, FiUserPlus, FiUserCheck, FiUserX,
  FiMail, FiCalendar, FiEdit2, FiTrash2,
  FiX, FiRefreshCw, FiSearch, FiDownload,
  FiEye, FiEyeOff, FiCopy, FiCheck, FiShield,
  FiMapPin, FiBook, FiFileText, FiUser, FiCheckCircle, FiGithub,
  FiAlertCircle
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const EMPTY_FORM = {
  name: '', email: '', password: '', avatar: null,
  internshipStart: '', internshipEnd: '',
};

// PDF report 
function downloadInternsPDF(supervisorName, interns) {
  const now  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const rows = interns.length === 0
    ? `<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">No interns</td></tr>`
    : interns.map((intern, i) => `
      <tr style="background:${i % 2 === 0 ? '#0f1117' : '#1a1f2e'}">
        <td style="padding:10px 14px"><div style="font-weight:600;color:#f1f5f9">${intern.name}</div></td>
        <td style="padding:10px 14px;color:#94a3b8">${intern.email}</td>
        <td style="padding:10px 14px;color:#94a3b8">${intern.university || '—'}</td>
        <td style="padding:10px 14px">
          <span style="padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;
            background:${intern.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'};
            color:${intern.isActive ? '#22c55e' : '#ef4444'}">
            ${intern.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td style="padding:10px 14px;color:#94a3b8">
          ${intern.internshipStart ? new Date(intern.internshipStart).toLocaleDateString() : '—'}
          ${intern.internshipEnd   ? ' → ' + new Date(intern.internshipEnd).toLocaleDateString() : ''}
        </td>
      </tr>`).join('');

  const activeCount = interns.filter(i => i.isActive).length;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Intern List — ${supervisorName}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#07080f;color:#f1f5f9;padding:40px}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}.logo{font-size:22px;font-weight:800;color:#fff}.logo span{color:#f59e0b}.meta{text-align:right;font-size:12px;color:#64748b}h1{font-size:26px;font-weight:700;color:#fff;margin-bottom:4px}.sub{font-size:13px;color:#94a3b8;margin-bottom:24px}.stats{display:flex;gap:12px;margin-bottom:24px}.stat{padding:12px 20px;border-radius:10px;background:#1a1f2e;border:1px solid rgba(255,255,255,0.07)}.stat-val{font-size:22px;font-weight:700;color:#fff}.stat-lbl{font-size:11px;color:#64748b;margin-top:2px}.divider{height:1px;background:rgba(255,255,255,0.08);margin-bottom:20px}table{width:100%;border-collapse:collapse}thead tr{background:linear-gradient(135deg,#f59e0b,#d97706)}thead th{padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:0.5px}.footer{margin-top:28px;text-align:center;font-size:11px;color:#334155}</style>
  </head><body>
  <div class="header"><div class="logo">Intern<span>Pulse</span></div><div class="meta">Generated: ${now}<br/>Supervisor Report</div></div>
  <h1>My Intern List</h1><div class="sub">Supervisor: <strong style="color:#fff">${supervisorName}</strong></div>
  <div class="stats">
    <div class="stat"><div class="stat-val">${interns.length}</div><div class="stat-lbl">Total</div></div>
    <div class="stat"><div class="stat-val" style="color:#22c55e">${activeCount}</div><div class="stat-lbl">Active</div></div>
    <div class="stat"><div class="stat-val" style="color:#ef4444">${interns.length - activeCount}</div><div class="stat-lbl">Inactive</div></div>
  </div>
  <div class="divider"></div>
  <table><thead><tr><th>Name</th><th>Email</th><th>University</th><th>Status</th><th>Internship Period</th></tr></thead><tbody>${rows}</tbody></table>
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
  const [copyToast,   setCopyToast]   = useState(null); // ← copy toast

  const copy = async (text, field, label) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setCopyToast(`${label} copied!`);             // ← toast show
    setTimeout(() => setCopiedField(null), 2000);
    setTimeout(() => setCopyToast(null), 2000);   // ← toast hide
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
            <h3 className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Intern Account Created</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Share these login credentials with the intern</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Email sent banner ── */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
             style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <FiCheckCircle className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />
          <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
            Login credentials sent to <strong>{credentials.email}</strong> successfully!
          </p>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-xl text-xs"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
          ⚠️ Copy and share these credentials securely. This dialog cannot be reopened.
        </div>

        {/* Copy toast */}
        {copyToast && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
               style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <FiCheck className="w-3.5 h-3.5" /> {copyToast}
          </div>
        )}

        {/* Credentials */}
        <div className="space-y-3">
          {[
            { label: 'FULL NAME', value: credentials.name,  field: 'name',  canCopy: false },
            { label: 'EMAIL',     value: credentials.email, field: 'email', canCopy: true  },
          ].map(f => (
            <div key={f.field} className="p-3 rounded-xl flex items-center justify-between gap-3"
                 style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="min-w-0">
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</div>
                <div className="text-sm text-white font-medium truncate">{f.value}</div>
              </div>
              {f.canCopy && (
                <button onClick={() => copy(f.value, f.field, f.label)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-white/5"
                        style={{ color: copiedField === f.field ? '#22c55e' : 'var(--text-secondary)' }}>
                  {copiedField === f.field ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                </button>
              )}
            </div>
          ))}

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
              <button onClick={() => setShowPass(p => !p)} className="p-1.5 rounded-lg hover:bg-white/5"
                      style={{ color: 'var(--text-secondary)' }}>
                {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
              <button onClick={() => copy(credentials.password, 'password', 'Password')}
                      className="p-1.5 rounded-lg hover:bg-white/5"
                      style={{ color: copiedField === 'password' ? '#22c55e' : 'var(--text-secondary)' }}>
                {copiedField === 'password' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,var(--supervisor-primary),var(--supervisor-secondary))' }}>
          Done — I've saved the credentials
        </button>
      </div>
    </div>
  );
}

// Intern Profile Modal (supervisor view) — compact two-column layout
function InternProfileModal({ intern, onClose }) {
  const [cvDownloading, setCvDownloading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleDownloadCV = async () => {
    setCvDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/intern/${intern._id}/cv`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Download failed');
      const blob    = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a       = document.createElement('a');
      a.href        = blobUrl;
      a.download    = intern.cv?.originalName || 'cv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setToast({ type: 'error', msg: 'CV download failed or no CV uploaded yet.' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setCvDownloading(false);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
         onClick={onClose}>
      {toast && (
        <div className="fixed top-6 right-6 z-[70] flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg backdrop-blur-sm transition-all"
             style={{
               background: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
               borderColor: toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
               color: toast.type === 'success' ? '#22c55e' : '#ef4444',
             }}>
          {toast.type === 'success' ? <FiCheck className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
           style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3"
             style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(251,146,60,0.05))', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <FiUser className="w-4 h-4" style={{ color: 'var(--supervisor-primary)' }} />
            <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>Intern Profile</h3>
          </div>
          <button onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                  style={{ color: 'var(--text-secondary)' }}>
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Body — two columns */}
        <div className="flex">
          {/* Left column — avatar + name + status */}
          <div className="w-36 shrink-0 flex flex-col items-center text-center p-5 space-y-3"
               style={{ borderRight: '1px solid var(--border)' }}>
            {intern.avatar?.url
              ? <img src={intern.avatar.url} alt={intern.name}
                     className="w-16 h-16 rounded-xl object-cover border-2"
                     style={{ borderColor: 'var(--supervisor-primary)' }} />
              : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                     style={{ background: 'linear-gradient(135deg,var(--supervisor-primary),var(--supervisor-secondary))' }}>
                  {intern.name?.charAt(0).toUpperCase()}
                </div>
              )}
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">{intern.name}</h4>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: intern.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color:      intern.isActive ? '#22c55e' : '#ef4444',
                    }}>
                {intern.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {intern.githubUsername && (
              <a href={`https://github.com/${intern.githubUsername}`} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1 text-[11px] hover:underline"
                 style={{ color: '#60a5fa' }}>
                <FiGithub className="w-3 h-3" />@{intern.githubUsername}
              </a>
            )}
          </div>

          {/* Right column — details */}
          <div className="flex-1 p-5 space-y-3 min-w-0">
            {/* Row 1: Email */}
            <InfoRow icon={FiMail} label="Email" value={intern.email} />

            {/* Row 2: University + Hometown side by side */}
            <div className="grid grid-cols-2 gap-2">
              <InfoRow icon={FiBook}   label="University" value={intern.university || '—'} />
              <InfoRow icon={FiMapPin} label="Hometown"   value={intern.hometown   || '—'} />
            </div>

            {/* Row 3: Dates side by side */}
            <div className="grid grid-cols-2 gap-2">
              <InfoRow icon={FiCalendar} label="Start" value={fmt(intern.internshipStart)} />
              <InfoRow icon={FiCalendar} label="End"   value={fmt(intern.internshipEnd)} />
            </div>

            {/* Row 4: Joined */}
            <InfoRow icon={FiCalendar} label="Joined" value={fmt(intern.createdAt)} />

            {/* CV */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <FiFileText className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--supervisor-primary)' }} />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>CV</div>
                  <div className="text-xs font-semibold text-white truncate">
                    {intern.cv?.originalName || 'No CV'}
                  </div>
                </div>
              </div>
              {intern.cv?.filename && (
                <button onClick={handleDownloadCV} disabled={cvDownloading}
                        className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                        style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--supervisor-primary)' }}>
                  <FiDownload className="w-3 h-3" />
                  {cvDownloading ? '...' : 'Download'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer close */}
        <div className="px-5 py-3 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-white/5"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--supervisor-primary)' }} />
      <div className="min-w-0">
        <div className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</div>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
             className="text-xs font-semibold hover:underline" style={{ color: '#60a5fa' }}>
            {value}
          </a>
        ) : (
          <div className="text-xs font-semibold text-white truncate">{value}</div>
        )}
      </div>
    </div>
  );
}

// Main Page 
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
  const [viewIntern,    setViewIntern]    = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchInterns(); }, []);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users/interns');
      setInterns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = interns.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setFormData(EMPTY_FORM); setShowPass(false); setFormError(''); setModal('create'); };
  const openEdit   = (i) => {
    setEditTarget(i);
    setFormData({
      name:            i.name,
      email:           i.email,
      password:        '',
      avatar:          null,
      internshipStart: i.internshipStart ? i.internshipStart.split('T')[0] : '',
      internshipEnd:   i.internshipEnd   ? i.internshipEnd.split('T')[0]   : '',
    });
    setShowPass(false); setFormError(''); setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditTarget(null); setFormData(EMPTY_FORM); setFormError(''); setShowPass(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',  formData.name);
      fd.append('email', formData.email);
      if (formData.password)        fd.append('password',        formData.password);
      if (formData.avatar)          fd.append('avatar',          formData.avatar);
      if (formData.internshipStart) fd.append('internshipStart', formData.internshipStart);
      if (formData.internshipEnd)   fd.append('internshipEnd',   formData.internshipEnd);

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
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (internId, current) => {
    if (!window.confirm(`${current ? 'Deactivate' : 'Activate'} this intern?`)) return;
    setActionLoading(internId);
    try { await axiosInstance.patch(`/users/intern/${internId}/toggle`); fetchInterns(); }
    catch {
      setToast({ type: 'error', msg: 'Failed to update intern status' });
      setTimeout(() => setToast(null), 3000);
    } finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await axiosInstance.delete(`/users/intern/${deleteTarget._id}`); setDeleteTarget(null); fetchInterns(); }
    catch {
      setToast({ type: 'error', msg: 'Failed to delete intern' });
      setTimeout(() => setToast(null), 3000);
    } finally { setDeleteLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin"
           style={{ borderColor: 'var(--supervisor-primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6">
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

      {credentials && <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />}
      {viewIntern  && <InternProfileModal intern={viewIntern}     onClose={() => setViewIntern(null)}  />}

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,var(--supervisor-primary),var(--supervisor-secondary))' }}>
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>My Interns</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {interns.length} interns under your supervision
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search intern..." value={search}
                   onChange={e => setSearch(e.target.value)}
                   className="pl-9 pr-3 py-2 rounded-xl text-sm text-white placeholder-slate-600 outline-none w-44"
                   style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
          </div>
          <button onClick={() => downloadInternsPDF('My Interns', interns)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm hover:opacity-90"
                  style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--supervisor-primary)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <FiDownload className="w-4 h-4" /> PDF
          </button>
          <button onClick={fetchInterns} className="p-2 rounded-xl border hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
            <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,var(--supervisor-primary),var(--supervisor-secondary))' }}>
            <FiUserPlus className="w-4 h-4" /> Add Intern
          </button>
        </div>
      </div>

      {/* Intern cards */}
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
                 className="relative p-5 rounded-2xl border transition-all hover:border-[var(--supervisor-primary)]"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: intern.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color:      intern.isActive ? '#22c55e' : '#ef4444',
                        border:     `1px solid ${intern.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      }}>
                  <div className={`w-1.5 h-1.5 rounded-full ${intern.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                  {intern.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex flex-col items-center text-center mb-4">
                {intern.avatar?.url
                  ? <img src={intern.avatar.url} alt={intern.name}
                         className="w-20 h-20 rounded-full object-cover mb-3 border-2"
                         style={{ borderColor: 'var(--supervisor-primary)' }} />
                  : (
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 text-2xl font-bold text-white"
                         style={{ background: 'linear-gradient(135deg,var(--supervisor-primary),var(--supervisor-secondary))' }}>
                      {intern.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                <h3 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                  {intern.name}
                </h3>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <FiMail className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{intern.email}</span>
                </div>
                {intern.university && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <FiBook className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{intern.university}</span>
                  </div>
                )}
                {intern.hometown && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <FiMapPin className="w-3.5 h-3.5 shrink-0" /><span>{intern.hometown}</span>
                  </div>
                )}
                {intern.githubUsername && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#60a5fa' }}>
                    <FiGithub className="w-3.5 h-3.5 shrink-0" />
                    <a href={`https://github.com/${intern.githubUsername}`} target="_blank" rel="noopener noreferrer"
                       className="hover:underline truncate">@{intern.githubUsername}</a>
                  </div>
                )}
                {(intern.internshipStart || intern.internshipEnd) && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <FiCalendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {intern.internshipStart ? new Date(intern.internshipStart).toLocaleDateString() : '?'}
                      {' → '}
                      {intern.internshipEnd   ? new Date(intern.internshipEnd).toLocaleDateString()   : '?'}
                    </span>
                  </div>
                )}
                {intern.cv?.filename && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#22c55e' }}>
                    <FiFileText className="w-3.5 h-3.5 shrink-0" /><span>CV uploaded</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(intern._id, intern.isActive)}
                        disabled={actionLoading === intern._id}
                        className="flex-1 py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                        style={{
                          background: intern.isActive ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                          color:      intern.isActive ? '#ef4444' : '#22c55e',
                          border:     `1px solid ${intern.isActive ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
                        }}>
                  {actionLoading === intern._id
                    ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : intern.isActive
                      ? <><FiUserX className="w-3.5 h-3.5" />Deactivate</>
                      : <><FiUserCheck className="w-3.5 h-3.5" />Activate</>}
                </button>
                <button onClick={() => setViewIntern(intern)}
                        className="p-2 rounded-xl hover:bg-emerald-500/10 transition-all"
                        style={{ color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }} title="View Profile">
                  <FiEye className="w-4 h-4" />
                </button>
                <button onClick={() => openEdit(intern)}
                        className="p-2 rounded-xl hover:bg-blue-500/10 transition-all"
                        style={{ color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(intern)}
                        className="p-2 rounded-xl hover:bg-red-500/10 transition-all"
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
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
               style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {modal === 'create' ? 'Create New Intern' : 'Edit Intern'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
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
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input type="text" required value={formData.name}
                       onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                       placeholder="Kasun Perera"
                       className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Email <span className="text-red-400">*</span>
                </label>
                <input type="email" required value={formData.email}
                       onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                       placeholder="kasun@example.com"
                       className="w-full px-4 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                       style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {modal === 'create' ? <>Password <span className="text-red-400">*</span></> : 'New Password (leave blank to keep)'}
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required={modal === 'create'}
                         value={formData.password} placeholder="••••••••"
                         onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                         className="w-full px-4 pr-11 py-2.5 rounded-xl text-white placeholder-slate-600 text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                          style={{ color: 'var(--text-muted)' }}>
                    {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Start Date</label>
                  <input type="date" value={formData.internshipStart}
                         onChange={e => setFormData(p => ({ ...p, internshipStart: e.target.value }))}
                         className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>End Date</label>
                  <input type="date" value={formData.internshipEnd}
                         onChange={e => setFormData(p => ({ ...p, internshipEnd: e.target.value }))}
                         className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', colorScheme: 'dark' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Avatar (Optional)</label>
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
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,var(--supervisor-primary),var(--supervisor-secondary))' }}>
                  {formLoading ? 'Saving…' : modal === 'create' ? 'Create Intern' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5 text-center"
               style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                 style={{ background: 'rgba(239,68,68,0.10)' }}>
              <FiTrash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Delete Intern</h3>
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
                      style={{ background: 'linear-gradient(135deg,var(--supervisor-primary),var(--supervisor-secondary))' }}>
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}