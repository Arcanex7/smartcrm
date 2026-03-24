import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { useEffect } from 'react'

const Landing = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  return (
    <div style={{ minHeight: '100vh', background: '#06060E', fontFamily: "'Inter', system-ui, sans-serif", color: '#F0EEE9', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link { color: rgba(240,238,233,0.5); font-size: 14px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .nav-link:hover { color: #F0EEE9; }
        .btn-primary { background: linear-gradient(135deg,#8B5CF6,#5B21B6); color:#fff; border:none; border-radius:10px; padding:13px 28px; cursor:pointer; font-size:14px; font-weight:600; font-family:inherit; transition:all 0.25s; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(139,92,246,0.4); }
        .btn-ghost { background:none; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px 24px; cursor:pointer; font-size:14px; color:rgba(240,238,233,0.6); font-family:inherit; transition:all 0.2s; }
        .btn-ghost:hover { border-color:rgba(139,92,246,0.4); color:#8B5CF6; }
        .feature-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:24px; transition:all 0.25s; }
        .feature-card:hover { border-color:rgba(139,92,246,0.3); background:rgba(139,92,246,0.04); transform:translateY(-3px); }
        .niche-pill { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:8px 16px; font-size:13px; color:rgba(240,238,233,0.5); transition:all 0.2s; cursor:default; white-space:nowrap; }
        .niche-pill:hover { border-color:rgba(139,92,246,0.3); color:#8B5CF6; background:rgba(139,92,246,0.06); }
        .pricing-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:32px; transition:all 0.25s; }
        .pricing-card:hover { transform:translateY(-4px); }
        .pricing-card.popular { background:rgba(139,92,246,0.07); border-color:rgba(139,92,246,0.3); }
        .check-item { display:flex; gap:10px; align-items:flex-start; margin-bottom:12px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fa { animation:fadeUp 0.5s ease both; }
        .fa-2 { animation:fadeUp 0.5s ease 0.1s both; }
        .fa-3 { animation:fadeUp 0.5s ease 0.2s both; }
        .fa-4 { animation:fadeUp 0.5s ease 0.3s both; }
        .glow { position:absolute; border-radius:50%; pointer-events:none; filter:blur(80px); }
        @media(max-width:768px){
          .hero-title { font-size:36px !important; }
          .pricing-grid { grid-template-columns:1fr !important; }
          .features-grid { grid-template-columns:1fr !important; }
          .nav-links { display:none !important; }
          .hero-btns { flex-direction:column !important; align-items:stretch !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,14,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#8B5CF6,#5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px' }}>
            Smart<span style={{ color: '#8B5CF6' }}>CRM</span>
          </span>
        </div>

        <div className="nav-links" style={{ display: 'flex', gap: '32px' }}>
          {['Features', 'Niches', 'Pricing', 'About'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-ghost" onClick={() => navigate('/login')} style={{ padding: '9px 18px', fontSize: '13px' }}>
            Sign in
          </button>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '9px 18px', fontSize: '13px' }}>
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="glow" style={{ width: '600px', height: '600px', background: 'rgba(139,92,246,0.08)', top: '-100px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="glow" style={{ width: '300px', height: '300px', background: 'rgba(59,130,246,0.06)', bottom: '0', right: '10%' }} />

        <div style={{ maxWidth: '780px', position: 'relative' }}>
          <div className="fa" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', padding: '6px 14px', marginBottom: '28px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', animation: 'float 2s ease infinite' }} />
            <span style={{ fontSize: '12px', color: '#A78BFA', fontWeight: 500 }}>AI-powered · Niche-personalized · Built for India</span>
          </div>

          <h1 className="fa-2 hero-title" style={{ fontFamily: "'Syne', sans-serif", fontSize: '58px', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '22px' }}>
            The CRM that knows<br />
            <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              your business
            </span>
          </h1>

          <p className="fa-3" style={{ fontSize: '17px', color: 'rgba(240,238,233,0.45)', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto 36px', fontWeight: 300 }}>
            SmartCRM personalizes itself around your industry. Real estate agents, SaaS founders, doctors, coaches — each gets a completely different experience built for their workflow.
          </p>

          <div className="fa-4 hero-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
            <button className="btn-primary" onClick={() => navigate('/register')} style={{ fontSize: '15px', padding: '14px 32px' }}>
              Start for free →
            </button>
            <button className="btn-ghost" onClick={() => navigate('/login')} style={{ fontSize: '15px', padding: '14px 28px' }}>
              View demo
            </button>
          </div>

          {/* Stats */}
          <div className="fa-4" style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { val: '8+', label: 'Industry niches' },
              { val: 'AI', label: 'Follow-up generator' },
              { val: '∞', label: 'Pipeline stages' },
              { val: '100%', label: 'Personalized' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#8B5CF6', letterSpacing: '-0.5px' }}>{s.val}</p>
                <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niches */}
      <section id="niches" style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8B5CF6', fontWeight: 600, marginBottom: '12px' }}>Built for every industry</p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '14px' }}>
            Your niche. Your CRM.
          </h2>
          <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '15px', fontWeight: 300, marginBottom: '40px', lineHeight: 1.7 }}>
            Choose your industry and get a completely personalized CRM — different pipeline stages, lead fields, dashboard metrics and AI prompts.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '48px' }}>
            {[
              { emoji: '🏠', label: 'Real Estate', desc: 'Site visits, negotiations, token paid' },
              { emoji: '💻', label: 'SaaS / Tech', desc: 'Trials, demos, MRR growth' },
              { emoji: '🏥', label: 'Healthcare', desc: 'Patients, appointments, treatments' },
              { emoji: '🎓', label: 'Education', desc: 'Students, enrolments, courses' },
              { emoji: '💼', label: 'Freelance', desc: 'Projects, proposals, contracts' },
              { emoji: '💰', label: 'Finance', desc: 'Policies, premiums, renewals' },
              { emoji: '🛍️', label: 'Retail', desc: 'Customers, orders, repeat buyers' },
              { emoji: '🍽️', label: 'Restaurant', desc: 'Bookings, tastings, events' },
            ].map((n, i) => (
              <div key={i} className="niche-pill" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{n.emoji}</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#F0EEE9' }}>{n.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8B5CF6', fontWeight: 600, marginBottom: '12px' }}>Everything you need</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '14px' }}>
              Built to close more deals
            </h2>
            <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '15px', fontWeight: 300, maxWidth: '500px', margin: '0 auto' }}>
              Every feature designed around one goal — helping you convert more leads into customers.
            </p>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {[
              { emoji: '🤖', title: 'AI Follow-up Generator', desc: 'Paste any lead context and get a perfectly written follow-up email or WhatsApp message in seconds. Context-aware and personalized.' },
              { emoji: '🔥', title: 'Hot Lead Scoring', desc: 'AI scores every lead 0-100. Know exactly who to call first. Never waste time on cold leads again.' },
              { emoji: '📋', title: 'Niche-specific Fields', desc: 'Real estate agents see BHK and site visit fields. SaaS teams see MRR and trial dates. Every field is relevant to you.' },
              { emoji: '💬', title: 'WhatsApp Click-to-Chat', desc: 'One click opens WhatsApp with a pre-filled message template tailored to that lead\'s specific context.' },
              { emoji: '🔔', title: 'Follow-up Reminders', desc: 'Set reminders on any lead. Get alerts when follow-ups are due. Never let a hot lead go cold.' },
              { emoji: '📊', title: 'Kanban Pipeline', desc: 'Drag and drop leads between stages. See your entire pipeline at a glance. Real-time updates across your team.' },
              { emoji: '⚡', title: 'Real-time Collaboration', desc: 'Your whole team sees updates live. When a rep moves a lead, managers see it instantly via Socket.io.' },
              { emoji: '📈', title: 'Revenue Dashboard', desc: 'Monthly target tracking, pipeline value, conversion rate, hot leads — all in one glance optimized for your niche.' },
              { emoji: '🏢', title: 'Team RBAC', desc: 'Admin, Manager, Rep and Viewer roles. Each person sees exactly what they should — no more, no less.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.emoji}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.2px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.4)', lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8B5CF6', fontWeight: 600, marginBottom: '12px' }}>Simple pricing</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '14px' }}>
              Start free. Scale as you grow.
            </h2>
            <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '15px', fontWeight: 300 }}>
              No hidden fees. No credit card required to start.
            </p>
          </div>

          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              {
                name: 'Free', price: '₹0', period: 'forever',
                desc: 'Perfect for solo agents just getting started.',
                features: ['Up to 50 leads', '1 user', 'All 8 niches', 'Pipeline Kanban', 'WhatsApp integration', 'Basic dashboard'],
                cta: 'Start for free', primary: false,
              },
              {
                name: 'Pro', price: '₹999', period: 'per month',
                desc: 'For growing teams that need AI and collaboration.',
                features: ['Unlimited leads', 'Up to 5 users', 'AI follow-up generator', 'Hot lead scoring', 'Follow-up reminders', 'Analytics dashboard', 'Real-time team sync', 'Priority support'],
                cta: 'Start Pro trial', primary: true, badge: 'Most Popular',
              },
              {
                name: 'Business', price: '₹2,999', period: 'per month',
                desc: 'For established businesses with large teams.',
                features: ['Unlimited everything', 'Unlimited users', 'Advanced AI features', 'Custom pipeline stages', 'API access', 'Dedicated onboarding', 'Custom integrations', 'SLA support'],
                cta: 'Contact sales', primary: false,
              },
            ].map((plan, i) => (
              <div key={i} className={`pricing-card ${plan.primary ? 'popular' : ''}`} style={{ position: 'relative' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#8B5CF6,#5B21B6)', borderRadius: '20px', padding: '4px 14px', fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                <p style={{ fontSize: '13px', fontWeight: 600, color: plan.primary ? '#8B5CF6' : 'rgba(240,238,233,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '40px', fontWeight: 800, letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ fontSize: '13px', color: 'rgba(240,238,233,0.4)', fontWeight: 300 }}>/{plan.period}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.4)', marginBottom: '24px', fontWeight: 300, lineHeight: 1.6 }}>{plan.desc}</p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px', marginBottom: '24px' }}>
                  {plan.features.map((f, j) => (
                    <div key={j} className="check-item">
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: plan.primary ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${plan.primary ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={plan.primary ? '#8B5CF6' : 'rgba(240,238,233,0.4)'} strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                      </div>
                      <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.65)', fontWeight: 300 }}>{f}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate('/register')}
                  style={{ width: '100%', background: plan.primary ? 'linear-gradient(135deg,#8B5CF6,#5B21B6)' : 'rgba(255,255,255,0.06)', border: plan.primary ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '13px', cursor: 'pointer', color: plan.primary ? '#fff' : 'rgba(240,238,233,0.7)', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; if (plan.primary) e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.4)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                  {plan.cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="glow" style={{ width: '500px', height: '500px', background: 'rgba(139,92,246,0.07)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '40px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Ready to close more deals?
          </h2>
          <p style={{ color: 'rgba(240,238,233,0.4)', fontSize: '15px', fontWeight: 300, marginBottom: '32px' }}>
            Join thousands of businesses already using SmartCRM.
          </p>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ fontSize: '15px', padding: '15px 36px' }}>
            Get started free — no credit card required
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg,#8B5CF6,#5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700 }}>Smart<span style={{ color: '#8B5CF6' }}>CRM</span></span>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.25)', fontWeight: 300 }}>
          © 2026 SmartCRM · Built by Aryan Kumar · Chandigarh University
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" className="nav-link" style={{ fontSize: '12px' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}

export default Landing