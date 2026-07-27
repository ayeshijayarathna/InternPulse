import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FONT_DISPLAY = "'Syne', sans-serif";
const FONT_BODY = "'DM Sans', sans-serif";

export default function InternLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
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
      if (user.role !== 'intern') {
        setError('This portal is for interns only.');
        setLoading(false);
        return;
      }
      navigate('/intern/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .intern-login-wrap { animation: floatIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1023px) {
          .intern-left-panel { display: none !important; }
          .intern-right-panel { width: 100% !important; }
        }
      `}</style>

      {/* ═══ LEFT PANEL — Background video + branding ═══ */}
      <div style={{
        display: 'flex', width: '50%', position: 'relative', overflow: 'hidden',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '3rem',
      }}
           className="intern-left-panel">

        {/* Background video */}
        <video autoPlay loop muted playsInline
               style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src="/videos/bg-video.mp4" type="video/mp4" />
        </video>

        {/* Main dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(7,8,15,0.75) 0%, rgba(10,14,26,0.62) 50%, rgba(7,8,15,0.80) 100%)', zIndex: 1 }} />
        {/* Violet brand tint */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(109,40,217,0.10) 0%, transparent 65%)', zIndex: 1 }} />
        {/* Right-edge fade */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '7rem', background: 'linear-gradient(to right, transparent, #07080f)', zIndex: 2 }} />
        {/* Bottom vignette */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '13rem', background: 'linear-gradient(to top, rgba(7,8,15,0.92), transparent)', zIndex: 2 }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px', zIndex: 2,
        }} />

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 0.75rem', borderRadius: '9999px',
              background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(167,139,250,0.25)',
              backdropFilter: 'blur(8px)', alignSelf: 'flex-start',
            }}>
              <span style={{ position: 'relative', display: 'flex', width: '0.5rem', height: '0.5rem' }}>
                <span className="animate-ping" style={{ position: 'absolute', display: 'inline-flex', width: '100%', height: '100%', borderRadius: '50%', opacity: 0.75, background: '#a78bfa' }} />
                <span style={{ position: 'relative', display: 'inline-flex', width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#a78bfa' }} />
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', color: '#c4b5fd', fontFamily: FONT_BODY }}>
                Intern Portal
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', fontWeight: 700, color: 'white', lineHeight: 1.1, letterSpacing: '-0.025em', fontFamily: FONT_DISPLAY, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))', margin: 0 }}>
              Track your<br />
              <span style={{ WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(90deg, #a78bfa 0%, #67e8f9 100%)', WebkitBackgroundClip: 'text' }}>
                progress
              </span><br />
              daily.
            </h1>

            <p style={{ fontSize: '1rem', lineHeight: 1.625, maxWidth: '24rem', color: 'white', fontFamily: FONT_BODY, filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.3))', margin: 0 }}>
              View assigned tasks, submit updates, and build your submission history — all in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              { icon: '✓', label: 'View assigned tasks' },
              { icon: '↑', label: 'Submit updates' },
              { icon: '◎', label: 'Track history' },
            ].map(({ icon, label }) => (
              <span key={label} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)',
                color: 'white', fontFamily: FONT_BODY, backdropFilter: 'blur(8px)',
              }}>
                <span style={{ color: '#a78bfa', fontWeight: 700 }}>{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ position: 'relative', zIndex: 10, marginTop: '2rem' }}>
          <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'white', fontFamily: FONT_BODY, margin: 0 }}>
            "Every great journey begins with a single task."
          </p>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Login form ═══ */}
      <div style={{
        width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem 3rem', position: 'relative', background: '#07080f',
      }}
           className="intern-right-panel intern-login-wrap">

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          top: '20%', right: '20%', width: '320px', height: '320px',
          background: 'radial-gradient(circle, rgba(109,40,217,0.07) 0%, transparent 70%)',
        }} />

        <div style={{ width: '100%', maxWidth: '28rem', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 10 }}>

          {/* Logo + Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/images/logo.png"
              alt="InternPulse"
              style={{ height: '4rem', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span style={{
              fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', fontFamily: FONT_DISPLAY,
              background: 'linear-gradient(135deg, #059669, #0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              InternPulse
            </span>
          </div>

          {/* Heading */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white', letterSpacing: '-0.025em', fontFamily: FONT_DISPLAY, margin: 0 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'white', fontFamily: FONT_BODY, margin: 0 }}>
              Sign in to your intern account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '1rem', borderRadius: '0.75rem',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
            }}>
              <svg style={{ width: '1rem', height: '1rem', color: '#f87171', marginTop: '0.125rem', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p style={{ color: '#f87171', fontSize: '0.875rem', fontFamily: FONT_BODY, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', fontFamily: FONT_BODY }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <svg style={{ width: '1rem', height: '1rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  required placeholder="kasun@intern.com"
                  style={{
                    width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem',
                    color: 'white', fontSize: '0.875rem', outline: 'none',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                    fontFamily: FONT_BODY, transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(139,92,246,0.55)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.10)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', fontFamily: FONT_BODY }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <svg style={{ width: '1rem', height: '1rem', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password" value={form.password} onChange={handleChange}
                  required placeholder="••••••••"
                  style={{
                    width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.5rem', borderRadius: '0.75rem',
                    color: 'white', fontSize: '0.875rem', outline: 'none',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                    fontFamily: FONT_BODY, transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(139,92,246,0.55)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.10)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: 'absolute', top: 0, bottom: 0, right: 0,
                    width: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'white', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
                  onMouseLeave={e => e.currentTarget.style.color = 'white'}
                >
                  {showPass ? (
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              style={{
                width: '100%', padding: '0.75rem',
                borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(109,40,217,0.28)',
                fontFamily: FONT_BODY, border: 'none', transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg style={{ width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '0.75rem', color: 'white', fontFamily: FONT_BODY }}>
              not an intern?
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'white', fontFamily: FONT_BODY, margin: 0 }}>
            © 2025 InternPulse · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
