import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff, FiUsers, FiArrowRight } from 'react-icons/fi';

const FONT_DISPLAY = "'Syne', sans-serif";
const FONT_BODY = "'DM Sans', sans-serif";

export default function AdminLogin() {
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem',
      background: '#06070e',
    }}>

      {/* Background video */}
      <video
        autoPlay muted loop playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, zIndex: 0 }}
      >
        <source src="/videos/bg-1.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 70% 20%, rgba(5,150,105,0.06) 0%, transparent 60%)',
        zIndex: 1,
      }} />

      <style>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sup-login-wrap { animation: floatIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        @media (max-width: 768px) {
          .sup-flex-col { flex-direction: column !important; }
          .sup-left-half, .sup-right-half { width: 100% !important; border-right: none !important; }
          .sup-left-half { display: none !important; }
        }
      `}</style>

      <div className="sup-login-wrap" style={{ position: 'relative', width: '100%', maxWidth: '56rem', zIndex: 10 }}>

        {/* Logo + Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <img
            src="/images/logo.png"
            alt="InternPulse"
            style={{ height: '4rem', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
            onError={(e) => { e.target.style.display = 'none'; document.getElementById('sup-fb').style.display = 'flex'; }}
          />
          <div id="sup-fb" style={{ display: 'none', width: '4rem', height: '4rem', borderRadius: '0.75rem', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
            <FiUsers style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', fontFamily: FONT_DISPLAY, margin: 0 }}>
            <span style={{ background: 'linear-gradient(135deg, #059669, #0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>InternPulse</span>
          </h1>
        </div>

        {/* Transparent Split Card */}
        <div style={{
          borderRadius: '1.5rem',
          overflow: 'hidden',
          background: 'rgba(10,8,16,0.55)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        }}>
          <div className="sup-flex-col" style={{ display: 'flex', flexDirection: 'row', minHeight: '380px' }}>

            {/* Left Side: Hero */}
            <div className="sup-left-half" style={{
              width: '50%', padding: '2.5rem',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}>

              {/* Gradient blob */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '12rem', height: '12rem', borderRadius: '50%', filter: 'blur(48px)', opacity: 0.2, pointerEvents: 'none', background: 'linear-gradient(135deg, #059669, #0891b2)' }} />

              {/* Badge */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.75rem', borderRadius: '9999px',
                  background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.18)',
                }}>
                  <span style={{ position: 'relative', display: 'flex', width: '0.5rem', height: '0.5rem' }}>
                    <span className="animate-ping" style={{ position: 'absolute', display: 'inline-flex', width: '100%', height: '100%', borderRadius: '50%', opacity: 0.75, background: '#34d399' }} />
                    <span style={{ position: 'relative', display: 'inline-flex', width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#34d399' }} />
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: '#6ee7b7', fontFamily: FONT_BODY }}>
                    Supervisor Portal
                  </span>
                </div>
              </div>

              {/* Headline + sentence + pills */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'white', lineHeight: 1.1, letterSpacing: '-0.025em', fontFamily: FONT_DISPLAY, margin: 0 }}>
                  Lead your<br />
                  <span style={{ WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(90deg, #34d399 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text' }}>
                    team forward.
                  </span>
                </h1>

                <p style={{ fontSize: '0.875rem', lineHeight: 1.625, maxWidth: '20rem', color: 'white', fontFamily: FONT_BODY, margin: 0 }}>
                  Assign tasks, review submissions, and guide your interns to success.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[
                    { icon: '◆', label: 'Task assignments' },
                    { icon: '▲', label: 'Review submissions' },
                    { icon: '●', label: 'Track progress' },
                  ].map(({ icon, label }) => (
                    <span key={label} style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                      color: 'white', fontFamily: FONT_BODY,
                    }}>
                      <span style={{ fontWeight: 700, color: '#34d399' }}>{icon}</span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'white', fontFamily: FONT_BODY, margin: 0 }}>
                  "A great leader empowers others to achieve more."
                </p>
              </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="sup-right-half" style={{ width: '50%', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', fontFamily: FONT_DISPLAY, margin: 0 }}>
                    Welcome back
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'white', fontFamily: FONT_BODY, margin: 0, marginTop: '0.25rem' }}>
                    Sign in to access your supervisor dashboard
                  </p>
                </div>

                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.875rem', borderRadius: '0.75rem',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)',
                  }}>
                    <svg style={{ width: '1rem', height: '1rem', color: '#f87171', marginTop: '0.125rem', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p style={{ color: '#f87171', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', fontFamily: FONT_BODY }}>
                      Email
                    </label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                           required placeholder="supervisor@internpulse.com"
                           style={{
                             width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                             color: 'white', fontSize: '0.875rem', outline: 'none',
                             background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                             transition: 'all 0.2s',
                           }}
                           onFocus={e => { e.target.style.borderColor = 'rgba(5,150,105,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.08)'; }}
                           onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', fontFamily: FONT_BODY }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} name="password"
                             value={form.password} onChange={handleChange}
                             required placeholder="••••••••"
                             style={{
                               width: '100%', padding: '0.75rem 2.75rem 0.75rem 1rem', borderRadius: '0.75rem',
                               color: 'white', fontSize: '0.875rem', outline: 'none',
                               background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                               transition: 'all 0.2s',
                             }}
                             onFocus={e => { e.target.style.borderColor = 'rgba(5,150,105,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.08)'; }}
                             onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }} />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                              style={{
                                position: 'absolute', inset: 0, left: 'auto', right: 0,
                                width: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'white', transition: 'color 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#6ee7b7'}
                              onMouseLeave={e => e.currentTarget.style.color = 'white'}>
                        {showPass ? <FiEyeOff style={{ width: '1rem', height: '1rem' }} /> : <FiEye style={{ width: '1rem', height: '1rem' }} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                          style={{
                            width: '100%', padding: '0.75rem', marginTop: '0.25rem',
                            borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.875rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            opacity: loading ? 0.5 : 1,
                            background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(5,150,105,0.25)',
                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                          }}>
                    {loading ? (
                      <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <>
                        <FiUsers style={{ width: '1rem', height: '1rem' }} />
                        Sign In
                        <FiArrowRight style={{ width: '1rem', height: '1rem', transition: 'transform 0.2s' }} />
                      </>
                    )}
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', paddingTop: '0.25rem', fontFamily: FONT_BODY }}>
                  <a href="/login" style={{ color: 'white', textDecoration: 'none', transition: 'opacity 0.2s' }}
                     onMouseEnter={e => e.target.style.opacity = 0.7}
                     onMouseLeave={e => e.target.style.opacity = 1}>Intern Portal</a>
                  <span style={{ color: 'white' }}>|</span>
                  <a href="/sa-login" style={{ color: 'white', textDecoration: 'none', transition: 'opacity 0.2s' }}
                     onMouseEnter={e => e.target.style.opacity = 0.7}
                     onMouseLeave={e => e.target.style.opacity = 1}>Admin Portal</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1.5rem', color: 'white', fontFamily: FONT_BODY }}>
          Restricted area · Unauthorised access attempts are logged
        </p>
      </div>
    </div>
  );
}
