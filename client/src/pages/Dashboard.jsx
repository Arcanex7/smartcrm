import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const formatValue = (val, currency = '₹') => {
  if (!val || val === 0) return `${currency}0`
  if (val >= 10000000) return `${currency}${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `${currency}${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `${currency}${(val / 1000).toFixed(0)}K`
  return `${currency}${val}`
}

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const getHour = () => new Date().getHours()
const getGreeting = (name) => {
  const h = getHour()
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${g}, ${name?.split(' ')[0]}`
}

const SVG = {
  revenue: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  fire: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7 7 7 0 01-7-7c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>,
  trend: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
  clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  phone: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.22 4.18 2 2 0 012.18 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  calendar: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  bell: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  ai: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  logout: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  grid: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  users: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  wave: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
  bar: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  alert: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

export const Sidebar = ({ active }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const term = user?.nicheConfig?.terminology

  const items = [
    { path: '/dashboard', label: 'Dashboard',                   icon: SVG.grid },
    { path: '/leads',     label: term?.leads || 'Leads',        icon: SVG.users },
    { path: '/pipeline',  label: term?.pipeline || 'Pipeline',  icon: SVG.wave },
    { path: '/ai',        label: 'AI Assistant',                icon: SVG.ai },
    { path: '/analytics', label: 'Analytics',                   icon: SVG.bar },
    { path: '/settings',  label: 'Settings',                    icon: SVG.settings },
  ]

  return (
    <div style={{ width: '216px', background: '#0A0B12', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, #8B5CF6, #5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, color: '#F0EEE9', letterSpacing: '-0.2px' }}>
            Smart<span style={{ color: '#8B5CF6' }}>CRM</span>
          </span>
        </div>
        <div style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '8px', padding: '8px 10px' }}>
          <p style={{ fontSize: '10px', color: 'rgba(240,238,233,0.35)', marginBottom: '2px', fontWeight: 300 }}>Workspace</p>
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#F0EEE9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.organizationName}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8B5CF6' }} />
            <p style={{ fontSize: '10px', color: '#8B5CF6', fontWeight: 500 }}>{user?.nicheConfig?.label}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {items.map(item => {
          const isActive = active === item.path
          return (
            <div key={item.path} onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '1px', transition: 'all 0.15s ease', background: isActive ? 'rgba(139,92,246,0.1)' : 'none', color: isActive ? '#A78BFA' : 'rgba(240,238,233,0.4)', fontSize: '13px', fontWeight: isActive ? 500 : 400, borderLeft: isActive ? '2px solid #8B5CF6' : '2px solid transparent' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; if (!isActive) e.currentTarget.style.color = 'rgba(240,238,233,0.7)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; if (!isActive) e.currentTarget.style.color = 'rgba(240,238,233,0.4)' }}>
              {item.icon}{item.label}
            </div>
          )
        })}
      </div>

      <div style={{ padding: '10px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#F0EEE9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize: '10px', color: 'rgba(240,238,233,0.3)', textTransform: 'capitalize', fontWeight: 300 }}>{user?.role}</p>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,238,233,0.25)', display: 'flex', padding: '4px', borderRadius: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,238,233,0.25)'; e.currentTarget.style.background = 'none' }}>
            {SVG.logout}
          </button>
        </div>
      </div>
    </div>
  )
}

const SkeletonCard = () => (
  <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '18px', overflow: 'hidden', position: 'relative' }}>
    <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
    <div style={{ height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '10px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)', animation: 'shimmer 1.5s infinite' }} />
    </div>
    <div style={{ height: '32px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', width: '60%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)', animation: 'shimmer 1.5s infinite 0.2s' }} />
    </div>
  </div>
)

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddLead, setShowAddLead] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', phone: '', email: '', value: '' })
  const [adding, setAdding] = useState(false)
  const [activeAI, setActiveAI] = useState(0)
  const { user } = useAuth()
  const navigate = useNavigate()
  const term = user?.nicheConfig?.terminology

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/leads/dashboard')
      setData(res.data)
    } catch { toast.error('Failed to load dashboard') }
    finally { setLoading(false) }
  }

  const handleAddLead = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await api.post('/leads', { ...addForm, value: parseInt(addForm.value) || 0 })
      toast.success(`${term?.lead || 'Lead'} added!`)
      setShowAddLead(false)
      setAddForm({ name: '', phone: '', email: '', value: '' })
      fetchDashboard()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add') }
    finally { setAdding(false) }
  }

  const stats = data?.stats
  const currency = data?.currency || '₹'

  const conversionRate = stats?.totalLeads > 0
    ? Math.round((stats.closedThisMonth / stats.totalLeads) * 100)
    : 0

  const hotLeads = data?.recentLeads?.filter(l => l.aiScore > 70) || []

  const kpiCards = [
    {
      label: 'Revenue This Month',
      value: formatValue(stats?.closedValue || 0, currency),
      sub: stats?.monthlyTarget > 0 ? `${stats.targetProgress}% of target` : 'No target set',
      color: '#10B981',
      glowColor: 'rgba(16,185,129,0.15)',
      icon: SVG.revenue,
      trend: stats?.closedThisMonth > 0 ? '+' + stats.closedThisMonth + ' deals' : 'No deals yet',
      trendUp: stats?.closedThisMonth > 0,
    },
    {
      label: 'Hot Leads',
      value: hotLeads.length || stats?.totalLeads || 0,
      sub: `${stats?.totalLeads || 0} total ${term?.leads || 'leads'}`,
      color: '#F59E0B',
      glowColor: 'rgba(245,158,11,0.15)',
      icon: SVG.fire,
      trend: stats?.thisMonthLeads > 0 ? `+${stats.thisMonthLeads} this month` : 'None added',
      trendUp: stats?.thisMonthLeads > 0,
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      sub: `${stats?.closedThisMonth || 0} closed of ${stats?.totalLeads || 0}`,
      color: '#8B5CF6',
      glowColor: 'rgba(139,92,246,0.15)',
      icon: SVG.trend,
      trend: conversionRate > 20 ? 'Above average' : 'Needs improvement',
      trendUp: conversionRate > 20,
    },
    {
      label: 'Pending Follow-ups',
      value: stats?.overdueFollowUps || stats?.idleLeads || 0,
      sub: `${stats?.idleLeads || 0} idle 7+ days`,
      color: stats?.overdueFollowUps > 0 ? '#EF4444' : '#6B7280',
      glowColor: stats?.overdueFollowUps > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.1)',
      icon: SVG.clock,
      trend: stats?.overdueFollowUps > 0 ? 'Action needed!' : 'All caught up',
      trendUp: stats?.overdueFollowUps === 0,
    },
  ]

  const aiInsights = [
    ...(stats?.idleLeads > 0 ? [{
      type: 'warning',
      emoji: '⚠️',
      title: "You're about to lose leads",
      body: `${stats.idleLeads} ${term?.leads || 'leads'} haven't been contacted in 7+ days. Deals go cold fast — follow up today.`,
      action: `Follow up now`,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.07)',
      border: 'rgba(245,158,11,0.2)',
    }] : []),
    ...(conversionRate < 20 && stats?.totalLeads > 2 ? [{
      type: 'insight',
      emoji: '💡',
      title: `${conversionRate}% conversion rate — room to grow`,
      body: `Industry average for ${user?.nicheConfig?.label} is 25-35%. Focus on moving leads from ${term?.pipeline || 'pipeline'} to closed.`,
      action: 'View pipeline',
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.07)',
      border: 'rgba(139,92,246,0.2)',
    }] : []),
    {
      type: 'tip',
      emoji: '🎯',
      title: 'Best time to reach prospects',
      body: `Based on industry data for ${user?.nicheConfig?.label}, the best time to call is between 10AM–12PM and 4PM–6PM on weekdays.`,
      action: 'Schedule call',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.07)',
      border: 'rgba(16,185,129,0.2)',
    },
    ...(stats?.monthlyTarget > 0 && stats?.targetProgress < 100 ? [{
      type: 'goal',
      emoji: '🔥',
      title: `${100 - stats.targetProgress}% away from your monthly target`,
      body: `You need ${formatValue(stats.monthlyTarget - stats.closedValue, currency)} more to hit your target. You have ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} days left this month.`,
      action: 'Add lead',
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.07)',
      border: 'rgba(239,68,68,0.2)',
    }] : []),
  ]

  const currentInsight = aiInsights[activeAI % aiInsights.length]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08090E', fontFamily: "'Inter', system-ui, sans-serif", color: '#F0EEE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .kpi-card {
          position: relative; overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: default;
        }
        .kpi-card:hover { transform: translateY(-4px); }

        .lead-row { transition: background 0.12s ease; cursor: pointer; border-radius: 10px; }
        .lead-row:hover { background: rgba(255,255,255,0.04) !important; }

        .quick-action {
          transition: all 0.2s ease; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 14px 16px;
          background: #0F111A;
        }
        .quick-action:hover { transform: translateY(-3px); border-color: rgba(139,92,246,0.35); background: rgba(139,92,246,0.05); }
        .quick-action:active { transform: translateY(-1px); }

        .ai-dot {
          width: 7px; height: 7px; border-radius: 50%;
          cursor: pointer; transition: all 0.2s ease;
          background: rgba(255,255,255,0.15);
        }
        .ai-dot.active { background: #8B5CF6; transform: scale(1.3); }

        .inp-m {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 9px;
          padding: 10px 12px; color: #F0EEE9;
          font-size: 13px; font-family: inherit; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .inp-m:focus { border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
        .inp-m::placeholder { color: rgba(240,238,233,0.2); font-weight: 300; }

        .pipeline-bar { transition: width 1s cubic-bezier(0.4,0,0.2,1); }

        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideIn { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }

        .s1{animation:fadeUp 0.3s ease both}
        .s2{animation:fadeUp 0.3s ease 0.05s both}
        .s3{animation:fadeUp 0.3s ease 0.1s both}
        .s4{animation:fadeUp 0.3s ease 0.15s both}
        .s5{animation:fadeUp 0.3s ease 0.2s both}
        .s6{animation:fadeUp 0.3s ease 0.25s both}
        .slide-in{animation:slideIn 0.25s ease both}

        @media(max-width:768px){
          .sidebar-d{display:none!important}
          .main-pad{padding:16px!important}
          .kpi-g{grid-template-columns:repeat(2,1fr)!important}
          .two-c{grid-template-columns:1fr!important}
          .qa-g{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar-d"><Sidebar active="/dashboard" /></div>

      {/* Main */}
      <div className="main-pad" style={{ flex: 1, padding: '24px 28px', overflowX: 'hidden', maxHeight: '100vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="s1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>
              {getGreeting(user?.name)}
            </h1>
            {stats?.monthlyTarget > 0 && stats?.targetProgress < 100 ? (
              <p style={{ fontSize: '13px', color: '#A78BFA', fontWeight: 500 }}>
                🔥 You're {formatValue(stats.monthlyTarget - stats.closedValue, currency)} away from your monthly target
              </p>
            ) : stats?.closedThisMonth > 0 ? (
              <p style={{ fontSize: '13px', color: '#10B981', fontWeight: 500 }}>
                ✅ Monthly target achieved! Great work.
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>
                {data?.organizationName} · {user?.nicheConfig?.label}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: `Add ${term?.lead || 'Lead'}`, icon: SVG.plus, primary: true, onClick: () => setShowAddLead(true) },
              { label: 'Pipeline', icon: SVG.wave, primary: false, onClick: () => navigate('/pipeline') },
              { label: 'AI', icon: SVG.ai, primary: false, onClick: () => navigate('/ai') },
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} style={{
                background: btn.primary ? 'linear-gradient(135deg, #8B5CF6, #5B21B6)' : 'rgba(255,255,255,0.04)',
                color: btn.primary ? '#fff' : 'rgba(240,238,233,0.6)',
                border: btn.primary ? 'none' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '9px', padding: '9px 14px', cursor: 'pointer',
                fontSize: '13px', fontWeight: btn.primary ? 600 : 400,
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; if (btn.primary) e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                {btn.icon}{btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-g s2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '18px' }}>
          {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : kpiCards.map((kpi, i) => (
            <div key={i} className="kpi-card" style={{ background: '#0F111A', border: `1px solid ${kpi.glowColor}`, borderRadius: '14px', padding: '16px 18px' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', borderRadius: '50%', background: kpi.glowColor, filter: 'blur(20px)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ color: kpi.color, opacity: 0.85 }}>{kpi.icon}</div>
                <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: kpi.trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: kpi.trendUp ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                  {kpi.trend}
                </span>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, color: kpi.color, lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.5px' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#F0EEE9', marginBottom: '2px', letterSpacing: '0.3px' }}>{kpi.label}</div>
              <div style={{ fontSize: '11px', color: 'rgba(240,238,233,0.3)', fontWeight: 300 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Monthly target bar */}
        {!loading && stats?.monthlyTarget > 0 && (
          <div className="s3" style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px 18px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(240,238,233,0.7)' }}>Monthly target</p>
              <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', fontWeight: 300 }}>
                {formatValue(stats.closedValue, currency)} / {formatValue(stats.monthlyTarget, currency)}
                <span style={{ color: '#8B5CF6', fontWeight: 600, marginLeft: '8px' }}>{stats.targetProgress}%</span>
              </p>
            </div>
            <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div className="pipeline-bar" style={{ height: '100%', width: `${Math.min(stats.targetProgress, 100)}%`, background: stats.targetProgress >= 100 ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #8B5CF6, #5B21B6)', borderRadius: '3px' }} />
            </div>
          </div>
        )}

        {/* AI Insight Card */}
        {!loading && aiInsights.length > 0 && (
          <div className="s3" style={{ background: currentInsight.bg, border: `1px solid ${currentInsight.border}`, borderRadius: '14px', padding: '16px 18px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${currentInsight.color}15`, border: `1px solid ${currentInsight.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentInsight.color, flexShrink: 0 }}>
                {SVG.ai}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 600, color: currentInsight.color, letterSpacing: '1px', textTransform: 'uppercase' }}>AI Insight</p>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: currentInsight.color, animation: 'pulse 2s infinite' }} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#F0EEE9', marginBottom: '3px' }}>{currentInsight.title}</p>
                <p className="slide-in" style={{ fontSize: '12px', color: 'rgba(240,238,233,0.55)', lineHeight: 1.6, fontWeight: 300 }}>{currentInsight.body}</p>
              </div>
              <button onClick={() => { if (currentInsight.action === 'Add lead') setShowAddLead(true); else if (currentInsight.action === 'View pipeline') navigate('/pipeline'); }}
                style={{ background: currentInsight.color, border: 'none', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, fontFamily: 'inherit', color: '#fff', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                {currentInsight.action} →
              </button>
            </div>
            {aiInsights.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
                {aiInsights.map((_, i) => (
                  <div key={i} className={`ai-dot ${i === activeAI % aiInsights.length ? 'active' : ''}`}
                    onClick={() => setActiveAI(i)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pipeline + Recent Leads */}
        <div className="two-c s4" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '14px' }}>

          {/* Pipeline */}
          <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '-0.2px' }}>
                {term?.pipeline || 'Pipeline'}
              </p>
              <button onClick={() => navigate('/pipeline')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B5CF6', fontSize: '11px', fontFamily: 'inherit', fontWeight: 500 }}>
                Full view →
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ height: '36px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data && Object.entries(data.pipeline).map(([key, stage]) => {
                  const maxCount = Math.max(...Object.values(data.pipeline).map(s => s.count), 1)
                  const pct = (stage.count / maxCount) * 100
                  return (
                    <div key={key} onClick={() => navigate('/pipeline')} style={{ cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                          <p style={{ fontSize: '12px', color: stage.count > 0 ? 'rgba(240,238,233,0.75)' : 'rgba(240,238,233,0.25)', fontWeight: stage.count > 0 ? 400 : 300 }}>{stage.label}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.3)', fontWeight: 300 }}>{formatValue(stage.value, currency)}</p>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: stage.count > 0 ? '#F0EEE9' : 'rgba(240,238,233,0.2)', fontFamily: "'Syne', sans-serif", minWidth: '14px', textAlign: 'right' }}>{stage.count}</p>
                        </div>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div className="pipeline-bar" style={{ height: '100%', width: `${pct}%`, background: stage.color, borderRadius: '2px', opacity: stage.count > 0 ? 0.8 : 0.15 }} />
                      </div>
                    </div>
                  )
                })}
                <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.3)', fontWeight: 300 }}>Total pipeline value</p>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#8B5CF6', fontFamily: "'Syne', sans-serif" }}>
                    {formatValue(stats?.totalValue || 0, currency)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent leads */}
          <div style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '-0.2px' }}>
                Recent {term?.leads || 'Leads'}
              </p>
              <button onClick={() => navigate('/leads')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B5CF6', fontSize: '11px', fontFamily: 'inherit', fontWeight: 500 }}>
                View all →
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ height: '44px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }} />
                ))}
              </div>
            ) : !data?.recentLeads?.length ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.3 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(240,238,233,0.3)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>No {term?.leads || 'leads'} yet</p>
                <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.2)', marginTop: '4px', fontWeight: 300 }}>Add your first deal to get started 🚀</p>
                <button onClick={() => setShowAddLead(true)} style={{ marginTop: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', padding: '7px 14px', color: '#8B5CF6', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>
                  + Add first {term?.lead || 'lead'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {data.recentLeads.slice(0, 7).map(lead => {
                  const stage = user?.nicheConfig?.pipelineStages?.find(s => s.id === lead.stage)
                  const initials = lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <div key={lead._id} className="lead-row"
                      onClick={() => navigate('/leads')}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 8px' }}>
                      <div style={{ display: 'flex', gap: '9px', alignItems: 'center', minWidth: 0 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${stage?.color || '#8B5CF6'}18`, border: `1px solid ${stage?.color || '#8B5CF6'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: stage?.color || '#8B5CF6', flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</p>
                          <p style={{ fontSize: '10px', color: 'rgba(240,238,233,0.3)', fontWeight: 300 }}>{timeAgo(lead.updatedAt)}</p>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {lead.value > 0 && (
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', fontFamily: "'Syne', sans-serif" }}>
                            {formatValue(lead.value, currency)}
                          </p>
                        )}
                        <div style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: `${stage?.color || '#8B5CF6'}15`, color: stage?.color || '#8B5CF6', fontWeight: 500 }}>
                          {stage?.label || lead.stage}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="qa-g s5" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
          {[
            { label: `Add ${term?.lead || 'Lead'}`,  sub: 'New opportunity',       color: '#8B5CF6', icon: SVG.plus,     onClick: () => setShowAddLead(true) },
            { label: 'Schedule Call',                 sub: 'Set follow-up',         color: '#3B82F6', icon: SVG.phone,    onClick: () => navigate('/leads') },
            { label: 'View Pipeline',                 sub: term?.pipeline || 'Pipeline', color: '#10B981', icon: SVG.wave, onClick: () => navigate('/pipeline') },
            { label: 'AI Assistant',                  sub: 'Generate follow-ups',   color: '#F59E0B', icon: SVG.ai,       onClick: () => navigate('/ai') },
          ].map((action, i) => (
            <div key={i} className="quick-action" onClick={action.onClick}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${action.color}12`, border: `1px solid ${action.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color, marginBottom: '10px' }}>
                {action.icon}
              </div>
              <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '2px', fontFamily: "'Syne', sans-serif" }}>{action.label}</p>
              <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.3)', fontWeight: 300 }}>{action.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLead && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddLead(false) }}>
          <div style={{ background: '#0F111A', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '18px', padding: '26px', width: '100%', maxWidth: '400px', animation: 'fadeUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px' }}>
                Add {term?.lead || 'Lead'}
              </h3>
              <button onClick={() => setShowAddLead(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '7px', padding: '6px', cursor: 'pointer', color: 'rgba(240,238,233,0.5)', display: 'flex', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                {SVG.close}
              </button>
            </div>
            <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <input className="inp-m" type="text" placeholder={`${term?.lead || 'Lead'} name *`}
                value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} required autoFocus />
              <input className="inp-m" type="tel" placeholder="Phone number"
                value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} />
              <input className="inp-m" type="email" placeholder="Email address"
                value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} />
              <input className="inp-m" type="number" placeholder={`Deal value (${currency}) — e.g. 7500000`}
                value={addForm.value} onChange={e => setAddForm({ ...addForm, value: e.target.value })} />
              <button type="submit" disabled={adding} style={{ background: adding ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8B5CF6, #5B21B6)', color: '#fff', border: 'none', borderRadius: '9px', padding: '12px', cursor: adding ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', marginTop: '4px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {adding ? (
                  <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Adding...</>
                ) : (
                  <>{SVG.plus} Add {term?.lead || 'Lead'}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard