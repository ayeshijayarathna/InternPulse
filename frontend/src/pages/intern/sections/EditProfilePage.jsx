import { useState, useEffect, useRef } from 'react';
import {
  FiUser, FiMapPin, FiBook, FiUpload, FiSave,
  FiCalendar, FiFileText, FiCheck, FiAlertCircle, FiCamera
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';
import { useAuth } from '../../../context/AuthContext';

// Helper: format date for <input type="date"> 
const toDateInput = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

export default function EditProfilePage() {
  const { user, setUser } = useAuth();

  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [toast,     setToast]     = useState(null); // { type: 'success'|'error', msg }

  // form state
  const [university, setUniversity] = useState('');
  const [hometown,   setHometown]   = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [cvFile,     setCvFile]     = useState(null);

  const avatarRef = useRef();
  const cvRef     = useRef();

  // Fetch own profile 
  useEffect(() => {
    axiosInstance.get('/users/me')
      .then(res => {
        setProfile(res.data);
        setUniversity(res.data.university || '');
        setHometown(res.data.hometown || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  //Avatar file select
  const onAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // CV file select 
  const onCVChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCvFile(file);
  };

  // Save profile (university, hometown, avatar) 
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('university', university);
      fd.append('hometown',   hometown);
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await axiosInstance.patch('/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      if (setUser) setUser(res.data); // update AuthContext
      setAvatarFile(null);
      showToast('success', 'Profile updated successfully!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  //Upload CV 
  const handleCVUpload = async () => {
    if (!cvFile) return;
    setCvUploading(true);
    try {
      const fd = new FormData();
      fd.append('cv', cvFile);
      const res = await axiosInstance.post('/users/cv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      setCvFile(null);
      showToast('success', 'CV uploaded successfully!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'CV upload failed');
    } finally {
      setCvUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
             style={{ borderColor: 'var(--intern-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const avatarSrc = avatarPreview || profile?.avatar?.url;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium"
             style={{
               background:   toast.type === 'success' ? 'rgba(34,197,94,0.1)'  : 'rgba(239,68,68,0.1)',
               borderColor:  toast.type === 'success' ? 'rgba(34,197,94,0.3)'  : 'rgba(239,68,68,0.3)',
               color:        toast.type === 'success' ? '#22c55e' : '#ef4444',
             }}>
          {toast.type === 'success'
            ? <FiCheck className="w-4 h-4 shrink-0" />
            : <FiAlertCircle className="w-4 h-4 shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg,var(--intern-primary),var(--intern-secondary))' }}>
          <FiUser className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Edit Profile
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Update your personal information
          </p>
        </div>
      </div>

      {/*  Avatar section  */}
      <div className="p-6 rounded-2xl border space-y-4"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FiCamera className="w-4 h-4" style={{ color: 'var(--intern-primary)' }} />
          Profile Picture
        </h3>
        <div className="flex items-center gap-5">
          {avatarSrc
            ? <img src={avatarSrc} alt="Avatar"
                   className="w-20 h-20 rounded-2xl object-cover border-2"
                   style={{ borderColor: 'var(--intern-primary)' }} />
            : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
                   style={{ background: 'linear-gradient(135deg,var(--intern-primary),var(--intern-secondary))' }}>
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          <div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            <button onClick={() => avatarRef.current.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--intern-primary)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <FiUpload className="w-4 h-4" />
              {avatarFile ? avatarFile.name : 'Choose Image'}
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              JPG, PNG, GIF, WEBP · max 5 MB
            </p>
          </div>
        </div>
      </div>

      {/* Read-only fields (set by supervisor)  */}
      <div className="p-6 rounded-2xl border space-y-4"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FiCalendar className="w-4 h-4" style={{ color: 'var(--intern-primary)' }} />
          Internship Details
          <span className="ml-auto text-xs px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
            Set by supervisor · read-only
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name',      value: profile?.name },
            { label: 'Email',          value: profile?.email },
            { label: 'Internship Start', value: profile?.internshipStart ? new Date(profile.internshipStart).toLocaleDateString() : '—' },
            { label: 'Internship End',   value: profile?.internshipEnd   ? new Date(profile.internshipEnd).toLocaleDateString()   : '—' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-semibold uppercase tracking-wider"
                     style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
              <div className="mt-1 px-4 py-2.5 rounded-xl text-sm text-white/60 border"
                   style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)' }}>
                {f.value || '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*  Editable profile fields */}
      <div className="p-6 rounded-2xl border space-y-4"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FiBook className="w-4 h-4" style={{ color: 'var(--intern-primary)' }} />
          Personal Info
        </h3>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider"
                 style={{ color: 'var(--text-secondary)' }}>University</label>
          <input
            type="text"
            value={university}
            onChange={e => setUniversity(e.target.value)}
            placeholder="e.g. University of Colombo"
            className="w-full mt-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 border outline-none transition-all focus:border-[var(--intern-primary)]"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)' }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider"
                 style={{ color: 'var(--text-secondary)' }}>Hometown</label>
          <input
            type="text"
            value={hometown}
            onChange={e => setHometown(e.target.value)}
            placeholder="e.g. Colombo"
            className="w-full mt-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 border outline-none transition-all focus:border-[var(--intern-primary)]"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)' }}
          />
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,var(--intern-primary),var(--intern-secondary))', color: '#fff' }}
        >
          <FiSave className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      {/* CV Upload  */}
      <div className="p-6 rounded-2xl border space-y-4"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FiFileText className="w-4 h-4" style={{ color: 'var(--intern-primary)' }} />
          My CV
        </h3>

        {profile?.cv?.filename && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
               style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.25)' }}>
            <FiCheck className="w-4 h-4 text-green-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile.cv.originalName}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {profile.cv.fileSize ? `${(profile.cv.fileSize / 1024).toFixed(1)} KB` : ''} ·
                Uploaded {profile.cv.uploadedAt ? new Date(profile.cv.uploadedAt).toLocaleDateString() : ''}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onCVChange} />
          <button onClick={() => cvRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--intern-primary)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <FiUpload className="w-4 h-4" />
            {cvFile ? cvFile.name : 'Choose CV File'}
          </button>

          {cvFile && (
            <button onClick={handleCVUpload} disabled={cvUploading}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,var(--intern-primary),var(--intern-secondary))', color: '#fff' }}>
              <FiSave className="w-4 h-4" />
              {cvUploading ? 'Uploading…' : 'Upload CV'}
            </button>
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          PDF or Word document · max 10 MB · replaces previous CV
        </p>
      </div>
    </div>
  );
}