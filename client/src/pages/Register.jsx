import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const NICHE_ICONS = {
  realEstate: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  saas: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  healthcare: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  education: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  freelance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  finance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  retail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  restaurant: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
}

const Register = () => {
  const [step, setStep] = useState(1)
  const [niches, setNiches] = useState([])
  const [selectedNiche, setSelectedNiche] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '', city: '', monthlyTarget: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/niches').then(res => setNiches(res.data.niches)).catch(() => toast.error('Failed to load niches'))
  }, [])

  const handleSubmit = async () => {
    if (!form.organizationName) return toast.error('Please enter your business name')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { ...form, niche: selectedNiche, monthlyTarget: parseInt(form.monthlyTarget) || 0 })
      login(res.data.user, res.data.token)
      toast.success('Welcome to SmartCRM!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08090E', fontFamily: "'Inter', system-ui, sans-serif", color: '#F0EEE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .inp-r {
          width: 100%; background: #0C0E16;
          border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
          padding: 12px 14px; color: #F0EEE9;
          font-size: 14px; font-family: 'Inter', inherit; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .inp-r:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139,92,246,0.12); }
        .inp-r::placeholder { color: rgba(240,238,233,0.2); }
        .niche-card {
          background: #0F111A; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 14px; cursor: pointer;
          transition: all 0.2s; display: flex; flex-direction: column; gap: 6px;
        }
        .niche-card:hover { border-color: rgba(139,92,246,0.35); transform: translateY(-2px); }
        .niche-card.sel { border-color: #8B5CF6; background: rgba(139,92,246,0.07); }
        .step-btn {
          background: linear-gradient(135deg, #8B5CF6, #6D28D9);
          color: #fff; border: none; border-radius: 10px; padding: 12px 28px;
          cursor: pointer; font-size: 14px; font-weight: 600;
          font-family: 'Inter', inherit; transition: all 0.25s; letter-spacing: 0.2px;
        }
        .step-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(139,92,246,0.35); }
        .step-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .back-btn {
          background: none; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 12px 22px; color: rgba(240,238,233,0.45);
          cursor: pointer; font-size: 14px; font-family: 'Inter', inherit;
          transition: all 0.2s;
        }
        .back-btn:hover { border-color: rgba(255,255,255,0.2); color: #F0EEE9; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fa { animation: fadeUp 0.35s ease; }
        .niche-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        @media (max-width: 600px) {
          .niche-grid { grid-template-columns: repeat(2,1fr) !important; }
          .reg-container { padding: 24px 16px !important; }
          .reg-header { padding: 14px 16px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="reg-header" style={{ padding: '18px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 600, letterSpacing: '-0.3px' }}>
            Smart<span style={{ color: '#8B5CF6' }}>CRM</span>
          </span>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['Niche', 'Account', 'Workspace'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, background: step > i + 1 ? '#8B5CF6' : step === i + 1 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)', color: step >= i + 1 ? '#8B5CF6' : 'rgba(240,238,233,0.25)', border: step === i + 1 ? '1px solid #8B5CF6' : 'none' }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '12px', color: step === i + 1 ? '#F0EEE9' : 'rgba(240,238,233,0.3)', fontWeight: step === i + 1 ? 500 : 300 }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: '24px', height: '1px', background: step > i + 1 ? '#8B5CF6' : 'rgba(255,255,255,0.08)' }} />}
            </div>
          ))}
        </div>

        <Link to="/login" style={{ color: 'rgba(240,238,233,0.35)', fontSize: '13px', textDecoration: 'none', fontWeight: 300 }}>
          Sign in instead
        </Link>
      </div>

      {/* Content */}
      <div className="reg-container" style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Step 1 */}
        {step === 1 && (
          <div className="fa">
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.5px' }}>
              What's your industry?
            </h1>
            <p style={{ color: 'rgba(240,238,233,0.35)', fontSize: '13px', marginBottom: '24px', fontWeight: 300 }}>
              Your CRM — pipeline stages, fields, metrics — will be personalized for your industry.
            </p>
            <div className="niche-grid" style={{ marginBottom: '28px' }}>
              {niches.map(niche => (
                <div key={niche.id}
                  className={`niche-card ${selectedNiche === niche.id ? 'sel' : ''}`}
                  onClick={() => setSelectedNiche(niche.id)}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: selectedNiche === niche.id ? `${niche.color}18` : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedNiche === niche.id ? niche.color + '35' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedNiche === niche.id ? niche.color : 'rgba(240,238,233,0.35)' }}>
                    {NICHE_ICONS[niche.id]}
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: selectedNiche === niche.id ? '#F0EEE9' : 'rgba(240,238,233,0.6)' }}>{niche.label}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.28)', fontWeight: 300, lineHeight: 1.4 }}>{niche.description}</p>
                </div>
              ))}
            </div>
            <button className="step-btn" onClick={() => { if (!selectedNiche) return toast.error('Please select your industry'); setStep(2) }}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="fa" style={{ maxWidth: '440px' }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Create your account
            </h1>
            <p style={{ color: 'rgba(240,238,233,0.35)', fontSize: '13px', marginBottom: '24px', fontWeight: 300 }}>
              Your personal login credentials
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              <input className="inp-r" type="text" placeholder="Full name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="inp-r" type="email" placeholder="Email address"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="inp-r" type="password" placeholder="Password (min 6 characters)"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
              <button className="step-btn" onClick={() => {
                if (!form.name || !form.email || !form.password) return toast.error('Fill all fields')
                if (form.password.length < 6) return toast.error('Password too short')
                setStep(3)
              }}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="fa" style={{ maxWidth: '440px' }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Set up your workspace
            </h1>
            <p style={{ color: 'rgba(240,238,233,0.35)', fontSize: '13px', marginBottom: '24px', fontWeight: 300 }}>
              Almost there — tell us about your business
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <input className="inp-r" type="text" placeholder="Business name"
                value={form.organizationName} onChange={e => setForm({ ...form, organizationName: e.target.value })} />
              <input className="inp-r" type="text" placeholder="City (optional)"
                value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              <input className="inp-r" type="number" placeholder="Monthly revenue target ₹ (optional)"
                value={form.monthlyTarget} onChange={e => setForm({ ...form, monthlyTarget: e.target.value })} />
            </div>

            {/* Preview card */}
            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.14)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(139,92,246,0.6)', marginBottom: '7px', fontWeight: 500 }}>Your workspace preview</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)', marginBottom: '2px' }}>Industry</p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>{niches.find(n => n.id === selectedNiche)?.label || '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)', marginBottom: '2px' }}>Workspace</p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>{form.organizationName || '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)', marginBottom: '2px' }}>Role</p>
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>Admin</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
              <button className="step-btn" disabled={loading} onClick={handleSubmit}>
                {loading ? 'Creating workspace...' : 'Launch my CRM →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Register