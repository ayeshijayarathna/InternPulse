import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function InternLogin() {
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
    <div className="min-h-screen flex relative overflow-hidden">

      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL — Background video + branding
      ══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">

        {/* ── Background video ──────────────────────────────────── */}
        {/*
          Put your video file at: public/video/bg-video.mp4
          It will be served from: /video/bg-video.mp4
        */}
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

        {/* ── Overlays on top of video ──────────────────────────── */}
        {/* Main dark overlay — adjust opacity to control video brightness */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(7,8,15,0.75) 0%, rgba(10,14,26,0.62) 50%, rgba(7,8,15,0.80) 100%)',
            zIndex: 1,
          }}
        />
        {/* Violet brand tint */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(109,40,217,0.10) 0%, transparent 65%)',
            zIndex: 1,
          }}
        />
        {/* Right-edge fade into the form panel */}
        <div
          className="absolute inset-y-0 right-0 w-28"
          style={{
            background: 'linear-gradient(to right, transparent, #07080f)',
            zIndex: 2,
          }}
        />
        {/* Bottom vignette */}
        <div
          className="absolute inset-x-0 bottom-0 h-52"
          style={{
            background: 'linear-gradient(to top, rgba(7,8,15,0.92), transparent)',
            zIndex: 2,
          }}
        />
        {/* Subtle grid over video */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            zIndex: 2,
          }}
        />

        {/* ── Logo ─────────────────────────────────────────────── */}
        {/*
          Put your logo at: public/images/logo.png
          Recommended: transparent PNG or SVG, height ~36px
          If image fails to load, a fallback violet icon shows instead
        */}
        <div className="relative flex items-center gap-3" style={{ zIndex: 10 }}>
          <img
            src="/images/logo.png"
            alt="InternPulse"
            className="h-9 w-auto object-contain drop-shadow-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              document.getElementById('logo-fallback').style.display = 'flex';
            }}
          />
          {/* Fallback icon (shows only when logo.png is missing) */}
          <div
            id="logo-fallback"
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 items-center justify-center shadow-lg shadow-violet-500/30"
            style={{ display: 'none' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span
            className="text-white font-semibold text-lg tracking-tight drop-shadow-md"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            InternPulse
          </span>
        </div>

        {/* ── Hero text ─────────────────────────────────────────── */}
        <div className="relative space-y-8" style={{ zIndex: 10 }}>
          <div className="space-y-5">
            {/* Animated live badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm"
              style={{
                background: 'rgba(109,40,217,0.15)',
                border: '1px solid rgba(167,139,250,0.25)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
              </span>
              <span
                className="text-violet-300 text-xs font-medium tracking-wide"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Intern Portal
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-5xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-xl"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Track your<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #a78bfa 0%, #67e8f9 100%)' }}
              >
                progress
              </span><br />
              daily.
            </h1>

            <p
              className="text-slate-300/80 text-base leading-relaxed max-w-sm drop-shadow"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              View assigned tasks, submit updates, and build your submission history — all in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: '✓', label: 'View assigned tasks' },
              { icon: '↑', label: 'Submit updates' },
              { icon: '◎', label: 'Track history' },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-slate-200 backdrop-blur-sm"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.13)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span className="text-violet-400 font-bold">{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Bottom quote ──────────────────────────────────────── */}
        <div className="relative" style={{ zIndex: 10 }}>
          <p
            className="text-slate-400/60 text-sm italic"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            "Every great journey begins with a single task."
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL — Login form (solid dark background)
      ══════════════════════════════════════════════════════════ */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative"
        style={{ background: '#07080f' }}
      >
        {/* Ambient glow behind form */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '20%',
            right: '20%',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(109,40,217,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="w-full max-w-md space-y-8 relative" style={{ zIndex: 10 }}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <img
              src="/images/logo.png"
              alt="InternPulse"
              className="h-8 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="text-white font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              InternPulse
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2
              className="text-3xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Welcome back
            </h2>
            <p className="text-slate-400 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Sign in to your intern account to continue
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
              }}
            >
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-300"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="kasun@intern.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    fontFamily: "'DM Sans', sans-serif",
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
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-slate-300"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    fontFamily: "'DM Sans', sans-serif",
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
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
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(109,40,217,0.28)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-slate-600 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              not an intern?
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Footer */}
          <p
            className="text-center text-slate-600 text-xs"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            © 2025 InternPulse · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}