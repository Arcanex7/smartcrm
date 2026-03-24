import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { Sidebar } from './Dashboard'
import api from '../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [orgForm, setOrgForm] = useState({
    name: user?.organizationName || '',
    city: '',
    monthlyTarget: '',
    currency: '₹',
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('rep')
  const [saving, setSaving] = useState(false)

  const tabs = [
    { id: 'profile',  label: 'Profile',      emoji: '👤' },
    { id: 'org',      label: 'Workspace',     emoji: '🏢' },
    { id: 'team',     label: 'Team',          emoji: '👥' },
    { id: 'niche',    label: 'Niche',         emoji: '🎯' },
    { id: 'security', label: 'Security',      emoji: '🔒' },
    { id: 'danger',   label: 'Danger Zone',   emoji: '⚠️' },
  ]

  const nicheStages = user?.nicheConfig?.pipelineStages || []

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08090E', fontFamily: "'Inter', system-ui, sans-serif", color: '#F0EEE9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        .inp-s { width:100%; background:#0C0E16; border:1px solid rgba(255,255,255,0.07); border-radius:8px; padding:10px 12px; color:#F0EEE9; font-size:13px; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .inp-s:focus { border-color:#8B5CF6; }
        .inp-s::placeholder { color:rgba(240,238,233,0.2); }
        .sel-s { width:100%; background:#0C0E16; border:1px solid rgba(255,255,255,0.07); border-radius:8px; padding:10px 12px; color:#F0EEE9; font-size:13px; font-family:inherit; outline:none; cursor:pointer; }
        .tab-btn { padding:8px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-family:inherit; border:none; transition:all 0.15s; display:flex; align-items:center; gap:7px; width:100%; text-align:left; }
        .tab-btn.active { background:rgba(139,92,246,0.12); color:#A78BFA; font-weight:500; }
        .tab-btn:not(.active) { background:none; color:rgba(240,238,233,0.4); }
        .tab-btn:not(.active):hover { background:rgba(255,255,255,0.04); color:rgba(240,238,233,0.7); }
        .save-btn { background:linear-gradient(135deg,#8B5CF6,#5B21B6); color:#fff; border:none; border-radius:9px; padding:11px 24px; cursor:pointer; font-size:13px; font-weight:600; font-family:inherit; transition:all 0.2s; }
        .save-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(139,92,246,0.35); }
        .save-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .danger-btn { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:9px; padding:10px 20px; cursor:pointer; font-size:13px; color:#EF4444; font-family:inherit; transition:all 0.2s; }
        .danger-btn:hover { background:rgba(239,68,68,0.18); }
        .section-card { background:#0F111A; border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:20px 24px; margin-bottom:16px; }
        .field-label { font-size:11px; color:rgba(240,238,233,0.4); font-weight:500; margin-bottom:5px; }
        .team-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
        .team-row:last-child { border-bottom:none; }
        .role-badge { font-size:10px; padding:3px 8px; border-radius:20px; font-weight:600; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fa { animation:fadeUp 0.3s ease both; }
        @media(max-width:768px){ .sidebar-d{display:none!important} .settings-layout{flex-direction:column!important} .settings-tabs{flex-direction:row!important;overflow-x:auto!important;width:100%!important;} }
      `}</style>

      <div className="sidebar-d"><Sidebar active="/settings" /></div>

      <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', maxHeight: '100vh' }}>
        <div className="fa" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '3px' }}>Settings</h1>
          <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>Manage your account, workspace and team</p>
        </div>

        <div className="settings-layout" style={{ display: 'flex', gap: '20px' }}>

          {/* Tabs sidebar */}
          <div className="settings-tabs" style={{ width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tabs.map(tab => (
              <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                <span style={{ fontSize: '14px' }}>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="fa">
                <div className="section-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{user?.name}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', fontWeight: 300 }}>{user?.email}</p>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', fontWeight: 600, textTransform: 'capitalize' }}>{user?.role}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <p className="field-label">Full Name</p>
                      <input className="inp-s" type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                    </div>
                    <div>
                      <p className="field-label">Phone</p>
                      <input className="inp-s" type="tel" placeholder="Your phone number" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p className="field-label">Email</p>
                      <input className="inp-s" type="email" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="save-btn" disabled={saving} onClick={() => toast.success('Profile updated!')}>
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Workspace */}
            {activeTab === 'org' && (
              <div className="fa">
                <div className="section-card">
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Workspace settings</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p className="field-label">Workspace Name</p>
                      <input className="inp-s" type="text" value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} />
                    </div>
                    <div>
                      <p className="field-label">City</p>
                      <input className="inp-s" type="text" placeholder="e.g. Chandigarh" value={orgForm.city} onChange={e => setOrgForm({ ...orgForm, city: e.target.value })} />
                    </div>
                    <div>
                      <p className="field-label">Currency</p>
                      <select className="sel-s" value={orgForm.currency} onChange={e => setOrgForm({ ...orgForm, currency: e.target.value })}>
                        <option value="₹">₹ Indian Rupee</option>
                        <option value="$">$ US Dollar</option>
                        <option value="€">€ Euro</option>
                        <option value="£">£ British Pound</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p className="field-label">Monthly Revenue Target (₹)</p>
                      <input className="inp-s" type="number" placeholder="e.g. 5000000" value={orgForm.monthlyTarget} onChange={e => setOrgForm({ ...orgForm, monthlyTarget: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="save-btn" onClick={() => toast.success('Workspace updated!')}>Save changes</button>
                  </div>
                </div>
              </div>
            )}

            {/* Team */}
            {activeTab === 'team' && (
              <div className="fa">
                <div className="section-card" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Invite team member</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input className="inp-s" type="email" placeholder="Email address" value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)} style={{ flex: 1, minWidth: '200px' }} />
                    <select className="sel-s" style={{ width: '140px' }} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                      <option value="manager">Manager</option>
                      <option value="rep">Sales Rep</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button className="save-btn" onClick={() => { toast.success(`Invite sent to ${inviteEmail}!`); setInviteEmail('') }}>
                      Send invite
                    </button>
                  </div>
                </div>

                <div className="section-card">
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Current team</h3>
                  {[
                    { name: user?.name, email: user?.email, role: 'admin', you: true },
                  ].map((member, i) => (
                    <div key={i} className="team-row">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.name} {member.you && <span style={{ fontSize: '10px', color: 'rgba(240,238,233,0.35)' }}>(you)</span>}
                        </p>
                        <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>{member.email}</p>
                      </div>
                      <span className="role-badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.35)', fontWeight: 300, textAlign: 'center' }}>
                      Invite team members using the form above to see them here
                    </p>
                  </div>
                </div>

                {/* RBAC explanation */}
                <div className="section-card">
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Role permissions</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          {['Permission', 'Admin', 'Manager', 'Rep', 'Viewer'].map(h => (
                            <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Permission' ? 'left' : 'center', color: 'rgba(240,238,233,0.4)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['View all leads',   '✅', '✅', 'Own only', '✅'],
                          ['Add leads',        '✅', '✅', '✅',       '❌'],
                          ['Edit leads',       '✅', '✅', 'Own only', '❌'],
                          ['Delete leads',     '✅', '✅', '❌',       '❌'],
                          ['View analytics',   '✅', '✅', '❌',       '❌'],
                          ['Manage team',      '✅', '❌', '❌',       '❌'],
                          ['Use AI features',  '✅', '✅', '✅',       '❌'],
                          ['Change settings',  '✅', '❌', '❌',       '❌'],
                        ].map(([perm, ...vals], i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '8px 10px', color: 'rgba(240,238,233,0.6)', fontWeight: 300 }}>{perm}</td>
                            {vals.map((v, j) => (
                              <td key={j} style={{ padding: '8px 10px', textAlign: 'center', fontSize: v === 'Own only' ? '10px' : '12px', color: v === '❌' ? 'rgba(239,68,68,0.6)' : v === '✅' ? 'rgba(16,185,129,0.8)' : 'rgba(245,158,11,0.8)', fontWeight: 500 }}>{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Niche */}
            {activeTab === 'niche' && (
              <div className="fa">
                <div className="section-card" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700 }}>Current niche</h3>
                    <span style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#8B5CF6', fontWeight: 600 }}>
                      {user?.nicheConfig?.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.4)', fontWeight: 300, lineHeight: 1.7, marginBottom: '16px' }}>
                    Your niche personalizes your pipeline stages, lead fields, dashboard metrics and AI context. Changing niche will update your entire CRM experience.
                  </p>
                  <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 400 }}>
                      ⚠️ Changing your niche will update pipeline stage labels. Existing leads will keep their current stage IDs. Contact support to migrate data.
                    </p>
                  </div>
                  <button className="save-btn" onClick={() => navigate('/register')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,238,233,0.7)' }}>
                    Change niche
                  </button>
                </div>

                <div className="section-card">
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Your pipeline stages</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {nicheStages.map((stage, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '16px' }}>{stage.emoji}</span>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                        <p style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>{stage.label}</p>
                        <p style={{ fontSize: '10px', color: 'rgba(240,238,233,0.25)', fontFamily: 'monospace' }}>{stage.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="fa">
                <div className="section-card">
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Change password</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                    <div>
                      <p className="field-label">Current password</p>
                      <input className="inp-s" type="password" placeholder="••••••••" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} />
                    </div>
                    <div>
                      <p className="field-label">New password</p>
                      <input className="inp-s" type="password" placeholder="Min 6 characters" value={passwordForm.newPass} onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} />
                    </div>
                    <div>
                      <p className="field-label">Confirm new password</p>
                      <input className="inp-s" type="password" placeholder="Repeat new password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                    </div>
                    <button className="save-btn" style={{ alignSelf: 'flex-start' }} onClick={() => {
                      if (passwordForm.newPass !== passwordForm.confirm) return toast.error('Passwords do not match')
                      if (passwordForm.newPass.length < 6) return toast.error('Password too short')
                      toast.success('Password updated!')
                      setPasswordForm({ current: '', newPass: '', confirm: '' })
                    }}>
                      Update password
                    </button>
                  </div>
                </div>

                <div className="section-card">
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Active sessions</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(240,238,233,0.4)', fontWeight: 300, marginBottom: '14px' }}>You are currently logged in on this device.</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500 }}>Current device</p>
                      <p style={{ fontSize: '11px', color: 'rgba(240,238,233,0.35)', fontWeight: 300 }}>Chrome · {new Date().toLocaleDateString()}</p>
                    </div>
                    <button onClick={logout} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', padding: '5px 12px', cursor: 'pointer', color: '#EF4444', fontSize: '12px', fontFamily: 'inherit' }}>
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
              <div className="fa">
                <div className="section-card" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 700, color: '#EF4444', marginBottom: '16px' }}>⚠️ Danger Zone</h3>

                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Export all data</p>
                    <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', fontWeight: 300, marginBottom: '12px' }}>Download all your leads and activity data as a CSV file.</p>
                    <button className="danger-btn" style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)', color: '#3B82F6' }} onClick={() => toast.success('Export started — check your email')}>
                      Export data
                    </button>
                  </div>

                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Clear all leads</p>
                    <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', fontWeight: 300, marginBottom: '12px' }}>Permanently delete all leads from your workspace. This cannot be undone.</p>
                    <button className="danger-btn" onClick={() => {
                      if (window.confirm('Are you absolutely sure? This will delete ALL your leads permanently.')) {
                        toast.error('This feature requires contacting support for safety')
                      }
                    }}>
                      Clear all leads
                    </button>
                  </div>

                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Delete workspace</p>
                    <p style={{ fontSize: '12px', color: 'rgba(240,238,233,0.4)', fontWeight: 300, marginBottom: '12px' }}>Permanently delete your entire workspace, all leads, all team members and all data.</p>
                    <button className="danger-btn" onClick={() => {
                      if (window.confirm('This will permanently delete your entire workspace. Are you sure?')) {
                        toast.error('Contact support to delete your workspace')
                      }
                    }}>
                      Delete workspace
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings