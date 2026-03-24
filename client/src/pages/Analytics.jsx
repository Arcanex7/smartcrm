import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../Context/AuthContext'
import { Sidebar } from './Dashboard'
import api from '../services/api'
import toast from 'react-hot-toast'

const formatValue = (val, currency = '₹') => {
  if (!val || val === 0) return `${currency}0`
  if (val >= 10000000) return `${currency}${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `${currency}${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `${currency}${(val / 1000).toFixed(0)}K`
  return `${currency}${val}`
}

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const term = user?.nicheConfig?.terminology
  const stages = user?.nicheConfig?.pipelineStages || []
  const canvasRef = useRef(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [dash, leads] = await Promise.all([
        api.get('/leads/dashboard'),
        api.get('/leads')
      ])
      setData({ ...dash.data, leads: leads.data.leads })
    } catch { toast.error('Failed to load analytics') }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08090E', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar active="/analytics" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,238,233,0.3)', fontSize: '14px' }}>
        Loading analytics...
      </div>
    </div>
  )

  const leads = data?.leads || []
  const stats = data?.stats || {}
  const pipeline = data?.pipeline || {}
  const currency = data?.currency || '₹'

  const totalValue = leads.reduce((s, l) => s + (l.value || 0), 0)
  const hotLeads = leads.filter(l => l.isHot)
  const closedStages = ['closed', 'closedWon', 'issued', 'completed', 'confirmed']
  const closedLeads = leads.filter(l => closedStages.includes(l.stage))
  const conversionRate = leads.length > 0 ? Math.round((closedLeads.length / leads.length) * 100) : 0
  const lostLeads = leads.filter(l => l.stage === 'lost')
  const avgDealValue = closedLeads.length > 0
    ? Math.round(closedLeads.reduce((s, l) => s + (l.value || 0), 0) / closedLeads.length)
    : 0

  // Source breakdown
  const sourceCounts = {}
  leads.forEach(l => {
    const src = l.source || 'other'
    sourceCounts[src] = (sourceCounts[src] || 0) + 1
  })

  // Stage breakdown for bar chart
  const stageData = stages.map(s => ({
    label: s.label,
    count: pipeline[s.id]?.count || 0,
    value: pipeline[s.id]?.value || 0,
    color: s.color,
    emoji: s.emoji,
  }))

  const maxCount = Math.max(...stageData.map(s => s.count), 1)

  // Hot vs normal
  const hotCount = hotLeads.length
  const normalCount = leads.length - hotCount

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08090E', fontFamily: "'Inter', system-ui, sans-serif", color: '#F0EEE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        .stat-card { background:#0F111A; border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px 20px; transition:transform 0.2s; }
        .stat-card:hover { transform:translateY(-2px); }
        .chart-bar { transition:height 0.8s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fa { animation:fadeUp 0.3s ease both; }
        .s1{animation-delay:0s} .s2{animation-delay:0.05s} .s3{animation-delay:0.1s} .s4{animation-delay:0.15s}
        @media(max-width:768px){ .sidebar-d{display:none!important} .kpi-g{grid-template-columns:repeat(2,1fr)!important} .two-c{grid-template-columns:1fr!important} }
      `}</style>

      <div className="sidebar-d"><Sidebar active="/analytics" /></div>

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', maxHeight: '100vh' }}>

        {/* Header */}
        <div className="fa" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '3px' }}>Analytics</h1>
            <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>
              {user?.nicheConfig?.label} · {leads.length} total {term?.leads || 'leads'}
            </p>
          </div>
          <button onClick={fetchData} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '9px 14px', cursor: 'pointer', color: 'rgba(240,238,233,0.5)', fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.color = '#8B5CF6' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(240,238,233,0.5)' }}>
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="kpi-g fa s1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
          {[
            { label: 'Total Pipeline Value', value: formatValue(totalValue, currency), sub: `${leads.length} ${term?.leads || 'leads'}`, color: '#8B5CF6' },
            { label: 'Closed This Month', value: formatValue(stats.closedValue || 0, currency), sub: `${stats.closedThisMonth || 0} deals closed`, color: '#10B981' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, sub: `${closedLeads.length} of ${leads.length} converted`, color: '#3B82F6' },
            { label: 'Avg Deal Value', value: formatValue(avgDealValue, currency), sub: 'Per closed deal', color: '#F59E0B' },
          ].map((kpi, i) => (
            <div key={i} className="stat-card">
              <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', fontWeight: 300, marginBottom: '8px' }}>{kpi.label}</p>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: kpi.color, letterSpacing: '-0.5px', marginBottom: '4px' }}>{kpi.value}</p>
              <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.3)', fontWeight: 300 }}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Monthly target */}
        {stats.monthlyTarget > 0 && (
          <div className="fa s2 stat-card" style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>Monthly Target Progress</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', fontWeight: 300 }}>
                  {formatValue(stats.closedValue || 0, currency)} / {formatValue(stats.monthlyTarget, currency)}
                </p>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 800, color: stats.targetProgress >= 100 ? '#10B981' : '#8B5CF6' }}>
                  {stats.targetProgress || 0}%
                </span>
              </div>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(stats.targetProgress || 0, 100)}%`, background: stats.targetProgress >= 100 ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#8B5CF6,#5B21B6)', borderRadius: '4px', transition: 'width 1s ease' }} />
            </div>
            {stats.targetProgress >= 100 && (
              <p style={{ fontSize: '12px', color: '#10B981', marginTop: '8px', fontWeight: 500 }}>🎉 Monthly target achieved!</p>
            )}
          </div>
        )}

        <div className="two-c" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px', marginBottom: '14px' }}>

          {/* Pipeline bar chart */}
          <div className="fa s3 stat-card">
            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 700, marginBottom: '18px' }}>
              {term?.pipeline || 'Pipeline'} Breakdown
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stageData.map((stage, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px' }}>{stage.emoji}</span>
                      <p style={{ fontSize: '12px', color: stage.count > 0 ? 'rgba(240,238,233,0.7)' : 'rgba(240,238,233,0.25)', fontWeight: stage.count > 0 ? 400 : 300 }}>{stage.label}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {stage.value > 0 && <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.3)' }}>{formatValue(stage.value, currency)}</p>}
                      <p style={{ fontSize: '12px', fontWeight: 700, color: stage.count > 0 ? '#F0EEE9' : 'rgba(240,238,233,0.2)', fontFamily: "'Syne', sans-serif", minWidth: '16px', textAlign: 'right' }}>{stage.count}</p>
                    </div>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(stage.count / maxCount) * 100}%`, background: stage.color, borderRadius: '2px', opacity: stage.count > 0 ? 0.8 : 0.1, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Hot vs normal donut */}
            <div className="fa s4 stat-card">
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>Lead Quality</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                    {leads.length > 0 && (
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#F59E0B" strokeWidth="10"
                        strokeDasharray={`${(hotCount / leads.length) * 201} 201`}
                        strokeDashoffset="50" strokeLinecap="round" transform="rotate(-90 40 40)" />
                    )}
                    <text x="40" y="44" textAnchor="middle" fill="#F0EEE9" fontSize="14" fontWeight="700" fontFamily="Syne, sans-serif">
                      {leads.length > 0 ? Math.round((hotCount / leads.length) * 100) : 0}%
                    </text>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                    <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.6)' }}>Hot leads</p>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B', marginLeft: 'auto', fontFamily: "'Syne', sans-serif" }}>{hotCount}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                    <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.6)' }}>Normal leads</p>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(240,238,233,0.5)', marginLeft: 'auto', fontFamily: "'Syne', sans-serif" }}>{normalCount}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                    <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.6)' }}>Lost</p>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444', marginLeft: 'auto', fontFamily: "'Syne', sans-serif" }}>{lostLeads.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lead sources */}
            <div className="stat-card" style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Lead Sources</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).map(([src, count], i) => {
                  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']
                  const pct = Math.round((count / leads.length) * 100)
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.6)', textTransform: 'capitalize', fontWeight: 300 }}>{src.replace('_', ' ')}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.3)' }}>{pct}%</p>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: colors[i % colors.length], fontFamily: "'Syne', sans-serif" }}>{count}</p>
                        </div>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: '2px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  )
                })}
                {Object.keys(sourceCounts).length === 0 && (
                  <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.25)', fontWeight: 300 }}>No source data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top leads by value */}
        <div className="stat-card fa" style={{ marginBottom: '14px' }}>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>
            Top {term?.leads || 'Leads'} by Value
          </p>
          {leads.filter(l => l.value > 0).sort((a, b) => b.value - a.value).slice(0, 5).length === 0 ? (
            <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.25)', fontWeight: 300 }}>No leads with deal value yet. Add values when creating leads.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {leads.filter(l => l.value > 0).sort((a, b) => b.value - a.value).slice(0, 5).map((lead, i) => {
                const stage = stages.find(s => s.id === lead.stage)
                const maxVal = leads[0]?.value || 1
                return (
                  <div key={lead._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 800, color: 'rgba(240,238,233,0.2)', width: '18px', flexShrink: 0 }}>#{i + 1}</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${stage?.color || '#8B5CF6'}18`, border: `1px solid ${stage?.color || '#8B5CF6'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: stage?.color || '#8B5CF6', flexShrink: 0 }}>
                      {lead.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lead.name} {lead.isHot ? '🔥' : ''}
                        </p>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', fontFamily: "'Syne', sans-serif", flexShrink: 0, marginLeft: '8px' }}>
                          {formatValue(lead.value, currency)}
                        </p>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(lead.value / leads.filter(l => l.value > 0).sort((a, b) => b.value - a.value)[0].value) * 100}%`, background: stage?.color || '#8B5CF6', borderRadius: '2px', opacity: 0.7 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: `${stage?.color || '#8B5CF6'}15`, color: stage?.color || '#8B5CF6', fontWeight: 600, flexShrink: 0 }}>
                      {stage?.label || lead.stage}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Summary insights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {[
            {
              emoji: '🎯',
              title: 'Win rate',
              value: `${conversionRate}%`,
              desc: conversionRate >= 25 ? 'Above industry average' : 'Below average — focus on qualification',
              color: conversionRate >= 25 ? '#10B981' : '#F59E0B'
            },
            {
              emoji: '💰',
              title: 'Revenue potential',
              value: formatValue(leads.filter(l => !closedStages.includes(l.stage)).reduce((s, l) => s + (l.value || 0), 0), currency),
              desc: 'Value of active pipeline',
              color: '#8B5CF6'
            },
            {
              emoji: '⚠️',
              title: 'At risk',
              value: stats.idleLeads || 0,
              desc: `${term?.leads || 'Leads'} idle for 7+ days`,
              color: (stats.idleLeads || 0) > 0 ? '#EF4444' : '#10B981'
            },
          ].map((insight, i) => (
            <div key={i} className="stat-card" style={{ border: `1px solid ${insight.color}18` }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px' }}>{insight.emoji}</span>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '4px', fontWeight: 300 }}>{insight.title}</p>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800, color: insight.color, marginBottom: '4px', letterSpacing: '-0.5px' }}>{insight.value}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', fontWeight: 300 }}>{insight.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics