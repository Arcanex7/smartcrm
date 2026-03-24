import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { Sidebar } from './Dashboard'
import api from '../services/api'
import toast from 'react-hot-toast'

const formatValue = (val, currency = '₹') => {
  if (!val || val === 0) return null
  if (val >= 10000000) return `${currency}${(val / 10000000).toFixed(1)}Cr`
  if (val >= 100000) return `${currency}${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `${currency}${(val / 1000).toFixed(0)}K`
  return `${currency}${val}`
}

const timeAgo = (date) => {
  if (!date) return 'Never'
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const SVG = {
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  fire: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7 7 7 0 01-7-7c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>,
  whatsapp: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  bell: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  close: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
}

const Leads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [hotFilter, setHotFilter] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderLead, setReminderLead] = useState(null)
  const [reminder, setReminder] = useState({ date: '', note: '' })
  const [addForm, setAddForm] = useState({})
  const [adding, setAdding] = useState(false)
  const [activityNote, setActivityNote] = useState('')
  const [activityType, setActivityType] = useState('note')
  const [addingActivity, setAddingActivity] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const term = user?.nicheConfig?.terminology
  const stages = user?.nicheConfig?.pipelineStages || []
  const leadFields = user?.nicheConfig?.leadFields || []

  useEffect(() => { fetchLeads() }, [search, stageFilter, hotFilter])

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (stageFilter !== 'all') params.append('stage', stageFilter)
      const res = await api.get(`/leads?${params}`)
      let data = res.data.leads
      if (hotFilter) data = data.filter(l => l.isHot)
      setLeads(data)
    } catch { toast.error('Failed to fetch leads') }
    finally { setLoading(false) }
  }

  const getCustomFields = (lead) => {
    const cf = lead.customFields || lead.customfields
    if (!cf) return {}
    if (cf instanceof Map) return Object.fromEntries(cf)
    if (typeof cf === 'object') return cf
    return {}
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!addForm.name) return toast.error('Name is required')
    setAdding(true)
    try {
      const payload = {
        name: addForm.name,
        phone: addForm.phone || '',
        email: addForm.email || '',
        value: parseInt(addForm.value) || 0,
        source: addForm.source || 'other',
        customFields: {}
      }
      leadFields.forEach(f => {
        if (addForm[f.key]) payload.customFields[f.key] = addForm[f.key]
      })
      if (addForm.followUpDate) payload.nextFollowUpAt = addForm.followUpDate
      await api.post('/leads', payload)
      toast.success(`${term?.lead || 'Lead'} added!`)
      setShowAddModal(false)
      setAddForm({})
      fetchLeads()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add')
    } finally { setAdding(false) }
  }

  const handleToggleHot = async (lead, e) => {
    e.stopPropagation()
    try {
      await api.patch(`/leads/${lead._id}/hot`, {})
      toast.success(lead.isHot ? 'Removed from hot leads' : '🔥 Marked as hot!')
      fetchLeads()
      if (selectedLead?._id === lead._id) {
        setSelectedLead({ ...selectedLead, isHot: !selectedLead.isHot })
      }
    } catch { toast.error('Failed to update') }
  }

  const handleStageChange = async (leadId, stage) => {
    try {
      await api.patch(`/leads/${leadId}/stage`, { stage })
      toast.success('Stage updated!')
      fetchLeads()
      if (selectedLead?._id === leadId) {
        setSelectedLead({ ...selectedLead, stage })
      }
    } catch { toast.error('Failed to update stage') }
  }

  const handleAddActivity = async (e) => {
    e.preventDefault()
    if (!activityNote.trim()) return
    setAddingActivity(true)
    try {
      await api.post(`/leads/${selectedLead._id}/activity`, { type: activityType, content: activityNote })
      toast.success('Activity logged!')
      setActivityNote('')
      const res = await api.get(`/leads/${selectedLead._id}`)
      setSelectedLead(res.data.lead)
      fetchLeads()
    } catch { toast.error('Failed to log activity') }
    finally { setAddingActivity(false) }
  }

  const handleAddReminder = async (e) => {
    e.preventDefault()
    if (!reminder.date) return toast.error('Please set a date')
    try {
      await api.post(`/leads/${reminderLead._id}/reminder`, reminder)
      toast.success('Reminder set! 🔔')
      setShowReminderModal(false)
      setReminder({ date: '', note: '' })
      fetchLeads()
    } catch { toast.error('Failed to set reminder') }
  }

  const handleWhatsApp = async (lead, e) => {
    e.stopPropagation()
    try {
      const res = await api.get(`/leads/${lead._id}/whatsapp`)
      window.open(res.data.waUrl, '_blank')
    } catch { toast.error('Failed to open WhatsApp') }
  }

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Archive this lead?')) return
    try {
      await api.delete(`/leads/${leadId}`)
      toast.success('Lead archived')
      setShowDetailModal(false)
      fetchLeads()
    } catch { toast.error('Failed to archive') }
  }

  const openDetail = async (lead) => {
    setSelectedLead(lead)
    setShowDetailModal(true)
    try {
      const res = await api.get(`/leads/${lead._id}`)
      setSelectedLead(res.data.lead)
    } catch {}
  }

  const getStage = (id) => stages.find(s => s.id === id) || { label: id, color: '#6B7280', emoji: '' }

  const hotLeads = leads.filter(l => l.isHot)
  const followUpToday = leads.filter(l => {
    if (!l.nextFollowUpAt) return false
    return new Date(l.nextFollowUpAt).toDateString() === new Date().toDateString()
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08090E', fontFamily: "'Inter', system-ui, sans-serif", color: '#F0EEE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        .lead-card { transition: all 0.2s ease; cursor: pointer; }
        .lead-card:hover { transform: translateY(-2px); border-color: rgba(139,92,246,0.3) !important; }
        .hot-btn { transition: all 0.15s ease; }
        .hot-btn:hover { transform: scale(1.1); }
        .inp-l { width:100%; background:#0C0E16; border:1px solid rgba(255,255,255,0.07); border-radius:8px; padding:10px 12px; color:#F0EEE9; font-size:13px; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .inp-l:focus { border-color:#8B5CF6; }
        .inp-l::placeholder { color:rgba(240,238,233,0.2); }
        .sel-l { background:#0C0E16; border:1px solid rgba(255,255,255,0.07); border-radius:8px; padding:9px 12px; color:#F0EEE9; font-size:13px; font-family:inherit; outline:none; cursor:pointer; }
        .sel-l:focus { border-color:#8B5CF6; }
        .act-type { padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-family:inherit; font-weight:500; transition:all 0.15s; border:none; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:300; padding:20px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .fa { animation:fadeUp 0.3s ease both; }
        .sr { animation:slideRight 0.3s ease both; }
        @media(max-width:768px){
          .sidebar-d{display:none!important}
          .leads-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      <div className="sidebar-d"><Sidebar active="/leads" /></div>

      <div style={{ flex: 1, padding: '24px 28px', overflowX: 'hidden', maxHeight: '100vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="fa" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '3px' }}>
              {term?.leads || 'Leads'}
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>
              {leads.length} total · {hotLeads.length} 🔥 hot · {followUpToday.length} follow-ups today
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#5B21B6)', color: '#fff', border: 'none', borderRadius: '9px', padding: '10px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
            {SVG.plus} Add {term?.lead || 'Lead'}
          </button>
        </div>

        {/* Follow-up alert */}
        {followUpToday.length > 0 && (
          <div className="fa" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>🔔</span>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#F59E0B' }}>
              {followUpToday.length} follow-up{followUpToday.length > 1 ? 's' : ''} due today —{' '}
              <span style={{ fontWeight: 400, color: 'rgba(240,238,233,0.6)' }}>
                {followUpToday.map(l => l.name).join(', ')}
              </span>
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="fa" style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,238,233,0.25)' }}>{SVG.search}</div>
            <input className="inp-l" type="text" placeholder={`Search ${term?.leads || 'leads'}...`}
              value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '32px' }} />
          </div>
          <select className="sel-l" value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
            <option value="all">All Stages</option>
            {stages.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
          </select>
          <button onClick={() => setHotFilter(!hotFilter)}
            style={{ background: hotFilter ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${hotFilter ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '9px 14px', cursor: 'pointer', color: hotFilter ? '#F59E0B' : 'rgba(240,238,233,0.5)', fontSize: '12px', fontFamily: 'inherit', fontWeight: hotFilter ? 600 : 400, display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}>
            {SVG.fire} Hot Only
          </button>
        </div>

        {/* Leads Grid */}
        {loading ? (
          <div className="leads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ background: '#0F111A', borderRadius: '14px', padding: '16px', height: '180px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '10px', width: '60%', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)', animation: 'shimmer 1.5s infinite' }} />
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '40%' }} />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(240,238,233,0.12)" strokeWidth="1" strokeLinecap="round" style={{ margin: '0 auto 16px', display: 'block' }}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <p style={{ fontSize: '15px', color: 'rgba(240,238,233,0.35)', marginBottom: '6px' }}>
              No {term?.leads || 'leads'} found
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.2)', fontWeight: 300 }}>
              {search || stageFilter !== 'all' ? 'Try adjusting your filters' : `Add your first ${term?.lead || 'lead'} to get started`}
            </p>
            {!search && stageFilter === 'all' && (
              <button onClick={() => setShowAddModal(true)}
                style={{ marginTop: '16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '9px', padding: '9px 18px', color: '#8B5CF6', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>
                + Add first {term?.lead || 'lead'}
              </button>
            )}
          </div>
        ) : (
          <div className="leads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {leads.map(lead => {
              const stage = getStage(lead.stage)
              const cf = getCustomFields(lead)
              const isOverdue = lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date()
              return (
                <div key={lead._id} className="lead-card fa"
                  onClick={() => openDetail(lead)}
                  style={{ background: '#0F111A', border: `1px solid ${lead.isHot ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '14px', padding: '16px', position: 'relative', overflow: 'hidden' }}>

                  {lead.isHot && <div style={{ position: 'absolute', top: 0, right: 0, width: '70px', height: '70px', background: 'radial-gradient(circle, rgba(245,158,11,0.1), transparent 70%)', pointerEvents: 'none' }} />}

                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '9px', alignItems: 'center', minWidth: 0 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${stage.color}18`, border: `1px solid ${stage.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: stage.color, flexShrink: 0 }}>
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</p>
                        {lead.phone && <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>{lead.phone}</p>}
                      </div>
                    </div>
                    <button className="hot-btn" onClick={e => handleToggleHot(lead, e)}
                      style={{ background: lead.isHot ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${lead.isHot ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '6px', padding: '4px 7px', cursor: 'pointer', color: lead.isHot ? '#F59E0B' : 'rgba(240,238,233,0.3)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: lead.isHot ? 700 : 400 }}>
                      {SVG.fire}{lead.isHot ? ' Hot' : ''}
                    </button>
                  </div>

                  {/* Stage + value */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: `${stage.color}15`, color: stage.color, fontWeight: 600 }}>
                      {stage.emoji} {stage.label}
                    </span>
                    {lead.value > 0 && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', fontFamily: "'Syne', sans-serif" }}>
                        {formatValue(lead.value)}
                      </span>
                    )}
                  </div>

                  {/* Custom fields preview */}
                  {Object.keys(cf).length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      {Object.entries(cf).slice(0, 2).map(([key, val]) => {
                        const field = leadFields.find(f => f.key === key)
                        return val ? (
                          <p key={key} style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)', fontWeight: 300, marginBottom: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ color: 'rgba(240,238,233,0.5)' }}>{field?.label || key}:</span> {val}
                          </p>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Bottom row */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {lead.phone && (
                        <button onClick={e => handleWhatsApp(lead, e)}
                          style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: '#25D366', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, transition: 'all 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.18)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.1)'}>
                          {SVG.whatsapp} WA
                        </button>
                      )}
                      <button onClick={e => { e.stopPropagation(); setReminderLead(lead); setShowReminderModal(true) }}
                        style={{ background: isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: isOverdue ? '#EF4444' : 'rgba(240,238,233,0.4)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', transition: 'all 0.15s' }}>
                        {SVG.bell} {isOverdue ? 'Overdue' : 'Remind'}
                      </button>
                    </div>
                    <p style={{ fontSize: '10px', color: 'rgba(240,238,233,0.25)', fontWeight: 300 }}>{timeAgo(lead.updatedAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
          <div className="fa" style={{ background: '#0F111A', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px', padding: '26px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px' }}>
                Add {term?.lead || 'Lead'}
              </h3>
              <button onClick={() => setShowAddModal(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '7px', padding: '6px', cursor: 'pointer', color: 'rgba(240,238,233,0.5)', display: 'flex' }}>
                {SVG.close}
              </button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '4px', fontWeight: 500 }}>Name *</p>
                  <input className="inp-l" type="text" placeholder="Full name"
                    value={addForm.name || ''} onChange={e => setAddForm({ ...addForm, name: e.target.value })} required />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '4px', fontWeight: 500 }}>Phone / WhatsApp</p>
                  <input className="inp-l" type="tel" placeholder="e.g. 9876543210"
                    value={addForm.phone || ''} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '4px', fontWeight: 500 }}>Email</p>
                  <input className="inp-l" type="email" placeholder="Email address"
                    value={addForm.email || ''} onChange={e => setAddForm({ ...addForm, email: e.target.value })} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '4px', fontWeight: 500 }}>Deal Value (₹)</p>
                  <input className="inp-l" type="number" placeholder="e.g. 7500000"
                    value={addForm.value || ''} onChange={e => setAddForm({ ...addForm, value: e.target.value })} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '2px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.3)', marginBottom: '10px', fontWeight: 500 }}>
                  {user?.nicheConfig?.label} Details
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {leadFields.map(field => (
                    <div key={field.key} style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1' }}>
                      <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '4px', fontWeight: 500 }}>{field.label}</p>
                      {field.type === 'select' ? (
                        <select className="sel-l" style={{ width: '100%' }}
                          value={addForm[field.key] || ''} onChange={e => setAddForm({ ...addForm, [field.key]: e.target.value })}>
                          <option value="">Select...</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea className="inp-l" placeholder={field.placeholder || ''} rows={3}
                          value={addForm[field.key] || ''} onChange={e => setAddForm({ ...addForm, [field.key]: e.target.value })}
                          style={{ resize: 'vertical' }} />
                      ) : (
                        <input className="inp-l" type={field.type || 'text'} placeholder={field.placeholder || ''}
                          value={addForm[field.key] || ''} onChange={e => setAddForm({ ...addForm, [field.key]: e.target.value })} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={adding}
                style={{ background: adding ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg,#8B5CF6,#5B21B6)', color: '#fff', border: 'none', borderRadius: '9px', padding: '12px', cursor: adding ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {adding ? 'Adding...' : `Add ${term?.lead || 'Lead'}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showDetailModal && selectedLead && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowDetailModal(false) }}>
          <div className="sr" style={{ background: '#0F111A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#8B5CF6' }}>
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 800 }}>{selectedLead.name}</h3>
                    {selectedLead.isHot && <span style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '20px', padding: '2px 8px', fontSize: '10px', color: '#F59E0B', fontWeight: 700 }}>🔥 HOT</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', fontWeight: 300 }}>{selectedLead.phone}{selectedLead.email ? ` · ${selectedLead.email}` : ''}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleDeleteLead(selectedLead._id)}
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '7px', padding: '7px', cursor: 'pointer', color: '#EF4444', display: 'flex' }}>
                  {SVG.trash}
                </button>
                <button onClick={() => setShowDetailModal(false)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '7px', padding: '7px', cursor: 'pointer', color: 'rgba(240,238,233,0.5)', display: 'flex' }}>
                  {SVG.close}
                </button>
              </div>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Stage + actions */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="sel-l" value={selectedLead.stage} onChange={e => handleStageChange(selectedLead._id, e.target.value)}>
                  {stages.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                </select>
                {selectedLead.value > 0 && (
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 800, color: '#10B981' }}>
                    {formatValue(selectedLead.value)}
                  </span>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedLead.phone && (
                    <button onClick={e => handleWhatsApp(selectedLead, e)}
                      style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: '#25D366', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>
                      {SVG.whatsapp} WhatsApp
                    </button>
                  )}
                  <button onClick={e => handleToggleHot(selectedLead, e)}
                    style={{ background: selectedLead.isHot ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedLead.isHot ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: selectedLead.isHot ? '#F59E0B' : 'rgba(240,238,233,0.4)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontFamily: 'inherit' }}>
                    {SVG.fire} {selectedLead.isHot ? 'Hot' : 'Mark Hot'}
                  </button>
                  <button onClick={() => { setReminderLead(selectedLead); setShowReminderModal(true) }}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: 'rgba(240,238,233,0.5)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontFamily: 'inherit' }}>
                    {SVG.bell} Remind
                  </button>
                </div>
              </div>

              {/* Custom fields detail */}
              {(() => {
                const cf = getCustomFields(selectedLead)
                const entries = Object.entries(cf).filter(([, v]) => v)
                if (!entries.length) return null
                return (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px 16px' }}>
                    <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.3)', marginBottom: '10px', fontWeight: 500 }}>Details</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {entries.map(([key, val]) => {
                        const field = leadFields.find(f => f.key === key)
                        return (
                          <div key={key}>
                            <p style={{ fontSize: '10px', color: 'rgba(240,238,233,0.3)', marginBottom: '2px', fontWeight: 300 }}>{field?.label || key}</p>
                            <p style={{ fontSize: '12px', fontWeight: 500 }}>{val}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Activity timeline */}
              <div>
                <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,238,233,0.3)', marginBottom: '10px', fontWeight: 500 }}>
                  Activity Timeline
                </p>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 14px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {['note', 'call', 'email', 'meeting'].map(type => (
                      <button key={type} className="act-type" onClick={() => setActivityType(type)}
                        style={{ background: activityType === type ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activityType === type ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`, color: activityType === type ? '#8B5CF6' : 'rgba(240,238,233,0.4)' }}>
                        {type === 'note' ? '📝' : type === 'call' ? '📞' : type === 'email' ? '📧' : '🤝'} {type}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleAddActivity} style={{ display: 'flex', gap: '8px' }}>
                    <input className="inp-l" type="text" placeholder="Log a note, call outcome, meeting..."
                      value={activityNote} onChange={e => setActivityNote(e.target.value)} style={{ flex: 1 }} />
                    <button type="submit" disabled={addingActivity}
                      style={{ background: 'linear-gradient(135deg,#8B5CF6,#5B21B6)', border: 'none', borderRadius: '8px', padding: '0 14px', cursor: 'pointer', color: '#fff', fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      {addingActivity ? '...' : 'Log'}
                    </button>
                  </form>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                  {(selectedLead.activities || []).slice().reverse().map((act, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: '14px', flexShrink: 0 }}>
                        {act.type === 'call' ? '📞' : act.type === 'email' ? '📧' : act.type === 'meeting' ? '🤝' : act.type === 'status_change' ? '🔄' : act.type === 'ai_followup' ? '🤖' : '📝'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', color: '#F0EEE9', lineHeight: 1.5 }}>{act.content}</p>
                        <p style={{ fontSize: '10px', color: 'rgba(240,238,233,0.3)', marginTop: '2px', fontWeight: 300 }}>{timeAgo(act.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && reminderLead && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowReminderModal(false) }}>
          <div className="fa" style={{ background: '#0F111A', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '18px', padding: '24px', width: '100%', maxWidth: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 800 }}>🔔 Set Reminder</h3>
              <button onClick={() => setShowReminderModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,238,233,0.4)', display: 'flex' }}>{SVG.close}</button>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', marginBottom: '14px', fontWeight: 300 }}>
              For: <span style={{ color: '#F0EEE9', fontWeight: 500 }}>{reminderLead.name}</span>
            </p>
            <form onSubmit={handleAddReminder} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '4px', fontWeight: 500 }}>Date & Time</p>
                <input className="inp-l" type="datetime-local"
                  value={reminder.date} onChange={e => setReminder({ ...reminder, date: e.target.value })} required />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.4)', marginBottom: '4px', fontWeight: 500 }}>Note (optional)</p>
                <input className="inp-l" type="text" placeholder="e.g. Call to discuss site visit"
                  value={reminder.note} onChange={e => setReminder({ ...reminder, note: e.target.value })} />
              </div>
              <button type="submit"
                style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#fff', border: 'none', borderRadius: '9px', padding: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', marginTop: '4px' }}>
                Set Reminder 🔔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leads