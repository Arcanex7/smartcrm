import { useState, useEffect } from 'react'
import { useAuth } from '../Context/AuthContext'
import { Sidebar } from './Dashboard'
import api from '../services/api'
import toast from 'react-hot-toast'

const SVG = {
  send: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/></svg>,
  copy: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  whatsapp: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23,4 23,11 16,11"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 11"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/></svg>,
  ai: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  zap: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>,
}

const AIAssistant = () => {
  const [leads, setLeads] = useState([])
  const [selectedLead, setSelectedLead] = useState('')
  const [activeMode, setActiveMode] = useState('followup')
  const [messageType, setMessageType] = useState('WhatsApp message')
  const [customPrompt, setCustomPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [digest, setDigest] = useState('')
  const [digestLoading, setDigestLoading] = useState(false)
  const [scoreResult, setScoreResult] = useState(null)
  const { user } = useAuth()
  const term = user?.nicheConfig?.terminology

  useEffect(() => {
    api.get('/leads').then(res => setLeads(res.data.leads)).catch(() => {})
    generateDigest()
  }, [])

  const generate = async () => {
    if (!['digest', 'custom'].includes(activeMode) && !selectedLead) {
      return toast.error('Please select a lead first')
    }
    setLoading(true)
    setOutput('')
    setScoreResult(null)
    try {
      const res = await api.post('/leads/ai/generate', {
        type: activeMode,
        leadId: selectedLead || null,
        customPrompt: activeMode === 'followup' ? messageType : customPrompt
      })
      setOutput(res.data.content)
      if (res.data.parsed) setScoreResult(res.data.parsed)
      toast.success('Generated!')
    } catch (err) {
      const msg = err.response?.data?.message || 'AI generation failed'
      toast.error(msg)
      setOutput(msg.includes('API key')
        ? '⚠️ OpenAI API key not configured. Add OPENAI_API_KEY to your server .env file.'
        : `Error: ${msg}`)
    } finally { setLoading(false) }
  }

  const generateDigest = async () => {
    setDigestLoading(true)
    try {
      await axios.post('/api/leads/ai/generate', {
  type: 'digest'
})
      setDigest(res.data.content)
    } catch { }
    finally { setDigestLoading(false) }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const openWhatsApp = () => {
    const lead = leads.find(l => l._id === selectedLead)
    if (!lead?.phone) return toast.error('No phone number for this lead')
    const phone = lead.phone.replace(/\D/g, '')
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(output)}`, '_blank')
  }

  const modes = [
    { id: 'followup', label: 'Follow-up message', emoji: '💬', desc: 'WhatsApp or call script' },
    { id: 'email',    label: 'Email draft',        emoji: '📧', desc: 'Professional email' },
    { id: 'brief',    label: 'Meeting brief',      emoji: '📋', desc: 'Prep notes before a call' },
    { id: 'score',    label: 'Lead score',         emoji: '⭐', desc: 'AI scores this lead 0-100' },
    { id: 'custom',   label: 'Ask AI anything',    emoji: '🤖', desc: 'Open-ended question' },
  ]

  const lead = leads.find(l => l._id === selectedLead)

  const getScoreColor = (score) => {
    if (score >= 70) return '#10B981'
    if (score >= 40) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08090E', fontFamily: "'Inter', system-ui, sans-serif", color: '#F0EEE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        .mode-btn { transition:all 0.2s; cursor:pointer; border-radius:10px; padding:11px 14px; border:1px solid rgba(255,255,255,0.06); background:#0F111A; text-align:left; width:100%; }
        .mode-btn:hover { border-color:rgba(139,92,246,0.3); background:rgba(139,92,246,0.04); }
        .mode-btn.active { border-color:#8B5CF6; background:rgba(139,92,246,0.1); }
        .inp-a { width:100%; background:#0C0E16; border:1px solid rgba(255,255,255,0.07); border-radius:9px; padding:11px 14px; color:#F0EEE9; font-size:13px; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .inp-a:focus { border-color:#8B5CF6; box-shadow:0 0 0 3px rgba(139,92,246,0.08); }
        .inp-a::placeholder { color:rgba(240,238,233,0.2); }
        .sel-a { width:100%; background:#0C0E16; border:1px solid rgba(255,255,255,0.07); border-radius:9px; padding:11px 14px; color:#F0EEE9; font-size:13px; font-family:inherit; outline:none; cursor:pointer; }
        .gen-btn { background:linear-gradient(135deg,#8B5CF6,#5B21B6); color:#fff; border:none; border-radius:10px; padding:12px 24px; cursor:pointer; font-size:14px; font-weight:600; font-family:inherit; display:flex; align-items:center; gap:8px; transition:all 0.25s; }
        .gen-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(139,92,246,0.4); }
        .gen-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; box-shadow:none; }
        .out-action { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:7px 12px; cursor:pointer; font-size:12px; color:rgba(240,238,233,0.6); font-family:inherit; display:flex; align-items:center; gap:5px; transition:all 0.15s; }
        .out-action:hover { background:rgba(255,255,255,0.1); color:#F0EEE9; }
        .msg-pill { padding:6px 12px; border-radius:20px; font-size:12px; cursor:pointer; font-family:inherit; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:rgba(240,238,233,0.5); transition:all 0.15s; }
        .msg-pill.active { background:rgba(139,92,246,0.15); border-color:rgba(139,92,246,0.3); color:#A78BFA; font-weight:500; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fa { animation:fadeUp 0.3s ease both; }
        .typing-dot { width:6px; height:6px; border-radius:50%; background:#8B5CF6; animation:pulse 1s ease infinite; display:inline-block; margin:0 2px; }
        .typing-dot:nth-child(2) { animation-delay:0.2s; }
        .typing-dot:nth-child(3) { animation-delay:0.4s; }
        @media(max-width:768px){ .sidebar-d{display:none!important} .ai-layout{flex-direction:column!important} .modes-col{width:100%!important;flex-direction:row!important;flex-wrap:wrap!important;} }
      `}</style>

      <div className="sidebar-d"><Sidebar active="/ai" /></div>

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', maxHeight: '100vh' }}>

        {/* Header */}
        <div className="fa" style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '3px' }}>
            AI Assistant
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>
            Powered by GPT-4 · Context-aware for {user?.nicheConfig?.label}
          </p>
        </div>

        {/* Morning digest */}
        <div className="fa" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6', animation: 'pulse 2s infinite' }} />
                <p style={{ fontSize: '10px', fontWeight: 600, color: '#8B5CF6', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  AI Morning Brief
                </p>
              </div>
              {digestLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0' }}>
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              ) : digest ? (
                <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.7)', lineHeight: 1.7, fontWeight: 300, whiteSpace: 'pre-line' }}>
                  {digest}
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.4)', fontWeight: 300 }}>
                  Add your OpenAI key to see your AI morning brief here.
                </p>
              )}
            </div>
            <button className="out-action" onClick={generateDigest} style={{ flexShrink: 0 }}>
              {SVG.refresh} Refresh
            </button>
          </div>
        </div>

        <div className="ai-layout" style={{ display: 'flex', gap: '20px' }}>

          {/* Modes sidebar */}
          <div className="modes-col" style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.3)', marginBottom: '4px', fontWeight: 500 }}>
              What do you need?
            </p>
            {modes.map(mode => (
              <button key={mode.id} className={`mode-btn ${activeMode === mode.id ? 'active' : ''}`}
                onClick={() => { setActiveMode(mode.id); setOutput(''); setScoreResult(null) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '15px' }}>{mode.emoji}</span>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: activeMode === mode.id ? '#A78BFA' : '#F0EEE9' }}>{mode.label}</p>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)', fontWeight: 300, paddingLeft: '23px' }}>{mode.desc}</p>
              </button>
            ))}
          </div>

          {/* Main panel */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Lead selector */}
            {!['digest', 'custom'].includes(activeMode) && (
              <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px 18px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '8px', fontWeight: 500, letterSpacing: '0.5px' }}>
                  SELECT {term?.lead?.toUpperCase() || 'LEAD'}
                </p>
                <select className="sel-a" value={selectedLead} onChange={e => setSelectedLead(e.target.value)}>
                  <option value="">Choose a {term?.lead || 'lead'}...</option>
                  {leads.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.isHot ? '🔥 ' : ''}{l.name} {l.phone ? `· ${l.phone}` : ''} · {l.stage}
                    </option>
                  ))}
                </select>

                {/* Lead preview */}
                {lead && (
                  <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '9px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600 }}>{lead.name}</p>
                        <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', fontWeight: 300 }}>
                          {lead.phone} · {lead.stage} {lead.value ? `· ₹${(lead.value/100000).toFixed(1)}L` : ''}
                        </p>
                      </div>
                      {lead.aiScore > 0 && (
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, color: getScoreColor(lead.aiScore) }}>{lead.aiScore}</p>
                          <p style={{ fontSize: '9px', color: 'rgba(240,238,233,0.35)' }}>AI score</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode-specific options */}
            {activeMode === 'followup' && (
              <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px 18px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '10px', fontWeight: 500, letterSpacing: '0.5px' }}>MESSAGE TYPE</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['WhatsApp message', 'Call script', 'SMS', 'Follow-up email'].map(type => (
                    <button key={type} className={`msg-pill ${messageType === type ? 'active' : ''}`}
                      onClick={() => setMessageType(type)}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeMode === 'custom' && (
              <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px 18px' }}>
                <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '8px', fontWeight: 500, letterSpacing: '0.5px' }}>YOUR QUESTION</p>
                <textarea className="inp-a" rows={3} placeholder="e.g. How should I handle price objections for real estate leads? What's the best follow-up strategy for idle leads?"
                  value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
                  style={{ resize: 'vertical' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {[
                    'How to handle price objections?',
                    'Best time to call leads?',
                    'How to re-engage cold leads?',
                    'Tips to close deals faster',
                  ].map(q => (
                    <button key={q} onClick={() => setCustomPrompt(q)}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '5px 11px', cursor: 'pointer', fontSize: '11px', color: 'rgba(240,238,233,0.45)', fontFamily: 'inherit', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.color = '#8B5CF6' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(240,238,233,0.45)' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generate button */}
            <button className="gen-btn" onClick={generate} disabled={loading}>
              {loading ? (
                <>
                  <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Generating...
                </>
              ) : (
                <>{SVG.zap} Generate</>
              )}
            </button>

            {/* Output */}
            {output && (
              <div className="fa" style={{ background: '#0F111A', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#10B981' }}>AI Output</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="out-action" onClick={() => copyToClipboard(output)}>
                      {SVG.copy} {copied ? 'Copied!' : 'Copy'}
                    </button>
                    {activeMode === 'followup' && messageType === 'WhatsApp message' && lead?.phone && (
                      <button className="out-action" onClick={openWhatsApp}
                        style={{ color: '#25D366', borderColor: 'rgba(37,211,102,0.2)', background: 'rgba(37,211,102,0.08)' }}>
                        {SVG.whatsapp} Send on WhatsApp
                      </button>
                    )}
                    <button className="out-action" onClick={generate}>
                      {SVG.refresh} Regenerate
                    </button>
                  </div>
                </div>

                {/* Score display */}
                {activeMode === 'score' && scoreResult && (
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `${getScoreColor(scoreResult.score)}15`, border: `3px solid ${getScoreColor(scoreResult.score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: getScoreColor(scoreResult.score) }}>{scoreResult.score}</span>
                      </div>
                      <p style={{ fontSize: '10px', color: 'rgba(240,238,233,0.35)', marginTop: '5px', fontWeight: 300 }}>Lead score</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: getScoreColor(scoreResult.score), marginBottom: '4px' }}>
                        {scoreResult.score >= 70 ? '🔥 Hot lead' : scoreResult.score >= 40 ? '⚡ Warm lead' : '❄️ Cold lead'}
                      </p>
                      <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.6)', lineHeight: 1.6, fontWeight: 300 }}>{scoreResult.reason}</p>
                      {scoreResult.nextAction && (
                        <div style={{ marginTop: '8px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '7px', padding: '7px 10px' }}>
                          <p style={{ fontSize: '11px', color: '#A78BFA', fontWeight: 500 }}>Recommended: {scoreResult.nextAction}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.8)', lineHeight: 1.8, fontWeight: 300, whiteSpace: 'pre-line' }}>
                    {output}
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!output && !loading && (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#0F111A', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: '14px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
                <p style={{ fontSize: '14px', color: 'rgba(240,238,233,0.4)', marginBottom: '6px' }}>
                  Select a mode and click Generate
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.2)', fontWeight: 300 }}>
                  AI will use your {term?.lead || 'lead'}'s full context to generate personalized content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant