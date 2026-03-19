import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login }       = useAuth();
  const navigate        = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'supervisor') {
        setError('Access denied. This portal is for supervisors only.');
        setLoading(false);
        return;
      }
      navigate('/supervisor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/videos/bg-video.mp4"  type="video/mp4" />
      </video>
     
      {/* Amber tint — brand colour cast */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 70% 20%, rgba(245,158,11,0.08) 0%, transparent 60%)',
          zIndex: 1,
        }}
      />
      {/* Dot texture over video */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(245,158,11,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          zIndex: 1,
        }}
      />

      {/* ══════════════════════════════════════════════════════════
          CARD
      ══════════════════════════════════════════════════════════ */}
      <div className="relative w-full max-w-md" style={{ zIndex: 10 }}>

        {/* Top accent line */}
        <div
          className="h-px w-full mb-8 opacity-70"
          style={{
            background: 'linear-gradient(to right, transparent, #f59e0b, transparent)',
          }}
        />

        {/* Card body */}
        <div
          className="rounded-2xl p-8 space-y-7 shadow-2xl"
          style={{
            background: 'rgba(15,12,24,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.60), 0 0 0 1px rgba(245,158,11,0.06)',
          }}
        >

          {/* ── Logo section */}
          <div className="flex flex-col items-center gap-4 pb-1">
            <img
              src="/images/logo.png"
              alt="InternPulse"
              className="h-12 w-auto object-contain drop-shadow-lg"
              onError={(e) => {
                // If logo.png missing — show text wordmark fallback
                e.target.style.display = 'none';
                document.getElementById('admin-logo-fallback').style.display = 'block';
              }}
            />
            {/* Fallback wordmark (hidden unless logo fails) */}
            <span
              id="admin-logo-fallback"
              className="text-2xl font-bold text-white tracking-tight"
              style={{ display: 'none', fontFamily: "'Syne', sans-serif" }}
            >
              Intern<span style={{ color: '#f59e0b' }}>Pulse</span>
            </span>

            {/* Title & subtitle below logo */}
            <div className="text-center space-y-1">
              <h1
                className="text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Supervisor Portal
              </h1>
              <p
                className="text-slate-500 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Authorised personnel only
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* ── Error ─────────────────────────────────────────── */}
          {error && (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.25)',
              }}
            >
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <p className="text-red-400 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {error}
              </p>
            </div>
          )}

          {/* ── Form ──────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-2">
              <label
                className="block text-xs font-semibold text-slate-400 uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@tracker.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(245,158,11,0.50)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.10)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                className="block text-xs font-semibold text-slate-400 uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(245,158,11,0.50)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.10)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                color: '#000',
                boxShadow: '0 8px 24px rgba(245,158,11,0.22)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(0,0,0,0.25)', borderTopColor: '#000' }}
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Authenticate
                </>
              )}
            </button>
          </form>

          {/* ── Divider ───────────────────────────────────────── */}
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* ── Security notice ───────────────────────────────── */}
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-600 text-xs leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Restricted area. Unauthorised access attempts are logged. If you are an intern,{' '}
              <a
                href="/login"
                className="text-slate-500 underline underline-offset-2 hover:text-slate-300 transition-colors"
              >
                use the intern portal
              </a>.
            </p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className="h-px w-full mt-8 opacity-30"
          style={{
            background: 'linear-gradient(to right, transparent, #f59e0b, transparent)',
          }}
        />
      </div>
    </div>
  );
}