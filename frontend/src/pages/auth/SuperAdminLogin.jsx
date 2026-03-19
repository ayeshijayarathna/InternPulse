import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function SuperAdminLogin() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
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
      if (user.role !== 'super_admin') {
        setError('Access denied.');
        setLoading(false);
        return;
      }
      navigate('/superadmin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
         style={{ background: '#07080f' }}>

      {/* ── Background video ── */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.6, zIndex: 0 }}
      >
        {/* Uses a free dark tech/network loop from a public CDN */}
        <source
          src="videos/bg.mp4"
          type="video/mp4"
        />
      </video>

      {/* ── Animated scan line ── */}
      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .scan-line {
          animation: scanline 6s linear infinite;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      <div className="absolute inset-x-0 pointer-events-none scan-line"
           style={{ zIndex: 3, height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.15), transparent)' }} />

      {/* ── Login card ── */}
      <div className="relative w-full max-w-sm fade-up" style={{ zIndex: 10 }}>

        <div className="h-px w-full mb-8"
             style={{ background: 'linear-gradient(to right, transparent, #dc2626, transparent)' }} />

        <div className="rounded-2xl p-8 space-y-7" style={{
          background:    'rgba(10,7,7,0.92)',
          backdropFilter:'blur(32px)',
          border:        '1px solid rgba(220,38,38,0.18)',
          boxShadow:     '0 32px 80px rgba(0,0,0,0.80), 0 0 0 1px rgba(220,38,38,0.06)',
        }}>

          {/* Icon + title */}
          <div className="flex flex-col items-center gap-3">
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

            <div className="text-center">
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
               System Administration
              </h1>
              <p className="text-xs mt-1" style={{ color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>
                Restricted access · Authorised personnel only
              </p>
            </div>
          </div>

          <div className="h-px" style={{ background: 'rgba(220,38,38,0.10)' }} />

          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest"
                     style={{ color: '#64748b' }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                     required placeholder="admin@system.com"
                     className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none transition-all"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                     onFocus={e => { e.target.style.border = '1px solid rgba(220,38,38,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.08)'; }}
                     onBlur={e  => { e.target.style.border = '1px solid rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }} />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest"
                     style={{ color: '#64748b' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password"
                       value={form.password} onChange={handleChange}
                       required placeholder="••••••••"
                       className="w-full px-4 pr-11 py-3 rounded-xl text-white placeholder-slate-600 text-sm outline-none transition-all"
                       style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                       onFocus={e => { e.target.style.border = '1px solid rgba(220,38,38,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.08)'; }}
                       onBlur={e  => { e.target.style.border = '1px solid rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors"
                        style={{ color: '#475569' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                        onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="w-full py-3 mt-1 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: '#fff',
                             boxShadow: '0 8px 24px rgba(220,38,38,0.22)' }}>
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 animate-spin"
                     style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Authenticate
                </>
              )}
            </button>
          </form>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <p className="text-center text-xs" style={{ color: '#334155' }}>
            All access attempts are logged and monitored
          </p>
        </div>

        <div className="h-px w-full mt-8"
             style={{ background: 'linear-gradient(to right, transparent, rgba(220,38,38,0.3), transparent)' }} />
      </div>
    </div>
  );
}