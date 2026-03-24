import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#08090E', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .inp-l {
          width: 100%; background: #0C0E16;
          border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
          padding: 12px 14px 12px 40px; color: #F0EEE9;
          font-size: 14px; font-family: 'Inter', inherit; outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .inp-l:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139,92,246,0.12); }
        .inp-l::placeholder { color: rgba(240,238,233,0.2); }
        .btn-sub {
          width: 100%; background: linear-gradient(135deg, #8B5CF6, #6D28D9);
          color: #fff; border: none; padding: 13px; border-radius: 10px;
          cursor: pointer; font-size: 14px; font-weight: 600;
          font-family: 'Inter', inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.25s ease; letter-spacing: 0.3px;
        }
        .btn-sub:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(139,92,246,0.4); }
        .btn-sub:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .left-panel {
          flex: 1; background: #0D0F18;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column; justify-content: center;
          padding: 60px; position: relative; overflow: hidden;
        }
        .right-panel {
          width: 460px; display: flex; flex-direction: column;
          justify-content: center; padding: 60px 52px;
        }
        .feature-row { display: flex; gap: 12px; margin-bottom: 20px; align-items: flex-start; }
        .feature-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #8B5CF6;
        }
        @media (max-width: 768px) {
          .left-panel { display: none !important; }
          .right-panel { width: 100% !important; padding: 40px 24px !important; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease; }
      `}</style>

      {/* Left Panel */}
      <div className="left-panel">
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)', top: '-200px', left: '-200px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.04), transparent 70%)', bottom: '-100px', right: '-100px', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '52px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 600, color: '#F0EEE9', letterSpacing: '-0.3px' }}>
            Smart<span style={{ color: '#8B5CF6' }}>CRM</span>
          </span>
        </div>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '40px', fontWeight: 700, color: '#F0EEE9', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-1px' }}>
          Close more deals.<br />
          <span style={{ color: '#8B5CF6' }}>Powered by AI.</span>
        </h1>
        <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '14px', lineHeight: 1.8, maxWidth: '360px', marginBottom: '44px', fontWeight: 300 }}>
          A niche-personalized CRM that adapts to your industry. Real estate, SaaS, healthcare and more.
        </p>

        {[
          { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, title: 'AI lead scoring', sub: 'Every lead scored 0-100 automatically' },
          { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>, title: 'Real-time pipeline', sub: 'Team updates sync live across devices' },
          { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, title: 'AI follow-up generator', sub: 'Context-aware messages for every lead' },
          { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, title: 'Niche-aware dashboard', sub: 'Personalised for your industry' },
        ].map((f, i) => (
          <div key={i} className="feature-row">
            <div className="feature-icon">{f.icon}</div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#F0EEE9', marginBottom: '2px' }}>{f.title}</p>
              <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>{f.sub}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '44px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.18)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500 }}>
            Real Estate · SaaS · Healthcare · Education · Finance
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel fade-up">
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 600, color: '#F0EEE9' }}>SmartCRM</span>
        </div>

        <div style={{ marginBottom: '32px', marginTop: '28px' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 700, color: '#F0EEE9', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Welcome back
          </h2>
          <p style={{ color: 'rgba(240,238,233,0.35)', fontSize: '13px', fontWeight: 300 }}>
            Sign in to your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,238,233,0.25)', display: 'flex' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <input className="inp-l" type="email" placeholder="Email address"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,238,233,0.25)', display: 'flex' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <input className="inp-l" type={showPass ? 'text' : 'password'} placeholder="Password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
              style={{ paddingRight: '46px' }} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,238,233,0.25)', display: 'flex', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#8B5CF6'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,238,233,0.25)'}>
              {showPass
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>

          <button type="submit" className="btn-sub" disabled={loading} style={{ marginTop: '6px' }}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(240,238,233,0.35)', fontSize: '13px', fontWeight: 300 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 500 }}>
            Create workspace
          </Link>
        </p>

        <div style={{ marginTop: '48px', padding: '14px 16px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '10px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.3)', fontWeight: 300, lineHeight: 1.6 }}>
            Demo account: <span style={{ color: 'rgba(240,238,233,0.6)' }}>aryan@smartcrm.com</span> / <span style={{ color: 'rgba(240,238,233,0.6)' }}>123456</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login