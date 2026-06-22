import { useState, useRef, useEffect, useCallback } from 'react'
import LoginScreen from './components/LoginScreen'
import ProcessView from './components/ProcessView'
import EmojiPicker from './components/EmojiPicker'
import CharacterProfile, { ControlsPanel } from './components/CharacterProfile'
import InvitePage from './components/InvitePage'

const DASHBOARDS = [
  { key: 'stayte',   label: 'Stayte',   active: true  },
  { key: 'spiriq',   label: 'Spiriq',   active: false },
  { key: 'stimul8',  label: 'Stimul8',  active: false },
  { key: 'navian',   label: 'Navian',   active: false },
]

function DashboardDropdown() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('stayte')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const conf = DASHBOARDS.find(d => d.key === current) || DASHBOARDS[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px 5px 12px',
        background: open ? '#f3f4f6' : 'transparent',
        border: '1px solid ' + (open ? '#e5e7eb' : 'transparent'),
        borderRadius: 8, cursor: 'pointer',
        fontSize: 14, fontWeight: 700, color: '#111827',
        fontFamily: 'inherit', transition: 'all 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#e5e7eb' }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
      >
        {conf.label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 500,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)', overflow: 'hidden', minWidth: 180,
        }}>
          {DASHBOARDS.map(d => (
            <div key={d.key}
              onClick={() => { if (d.active) { setCurrent(d.key); setOpen(false) } }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 10, padding: '9px 14px',
                cursor: d.active ? 'pointer' : 'default',
                background: d.key === current ? '#eff6ff' : '#fff',
                opacity: d.active ? 1 : 0.4,
              }}
              onMouseEnter={e => { if (d.active && d.key !== current) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={e => { if (d.active && d.key !== current) e.currentTarget.style.background = '#fff' }}
            >
              <span style={{
                fontSize: 13, fontWeight: d.key === current ? 600 : 400,
                color: d.key === current ? '#2563eb' : '#111827',
              }}>{d.label}</span>
              {d.key === current && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
              )}
              {!d.active && (
                <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>soon</span>
              )}
            </div>
          ))}

          <div style={{ height: 1, background: '#f0f0f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#111827' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Add new
          </div>
        </div>
      )}
    </div>
  )
}

const DEFAULT_EMOJIS = { Workflow: '⚡', Roadmap: '🗺', Credentials: '🔑' }
const NAV_SECTION_NAMES = ['Workflow', 'Roadmap', 'Credentials']

// Batman = admin, Robin = user
function roleOf(name) { return name === 'Batman' ? 'admin' : 'user' }

export default function App() {
  const [user, setUser] = useState(() => {
    const auth = sessionStorage.getItem('ataska_auth')
    const name = sessionStorage.getItem('ataska_user')
    return auth === '1' && name ? name : null
  })
  const role = roleOf(user)
  const [activeSection, setActiveSection] = useState(() => localStorage.getItem('ataska_section') || 'Workflow')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('ataska_sidebar') === '1')
  const [emojis, setEmojis] = useState(() => {
    try { return { ...DEFAULT_EMOJIS, ...JSON.parse(localStorage.getItem('ataska_emojis') || '{}') } }
    catch { return DEFAULT_EMOJIS }
  })
  const [pickerFor, setPickerFor] = useState(null) // { name, rect }
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showCharacter, setShowCharacter] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    if (!userMenuOpen) return
    const h = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [userMenuOpen])

  const updateEmoji = (name, emoji) => {
    const next = { ...emojis, [name]: emoji }
    setEmojis(next)
    localStorage.setItem('ataska_emojis', JSON.stringify(next))
  }

  const handleLogin = (name) => setUser(name)

  const handleLogout = () => {
    sessionStorage.removeItem('ataska_auth')
    sessionStorage.removeItem('ataska_user')
    setUser(null)
  }

  const handleSwitchUser = (name) => {
    sessionStorage.setItem('ataska_user', name)
    setUser(name)
    setShowCharacter(false)
  }

  const toggleSidebar = () => setSidebarCollapsed(v => {
    localStorage.setItem('ataska_sidebar', v ? '0' : '1')
    return !v
  })

  const navigateTo = (name) => {
    setActiveSection(name)
    localStorage.setItem('ataska_section', name)
  }

  const sw = sidebarCollapsed ? 52 : 200

  const isInvite = new URLSearchParams(window.location.search).has('invite')

  if (!user) {
    if (isInvite) return <InvitePage onLogin={handleLogin} />
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f3f4f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Top bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>🦇</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginRight: 4 }}>Batcave CRM</span>
          <div style={{ width: 1, height: 18, background: '#e5e7eb', margin: '0 4px' }} />
          <DashboardDropdown />
        </div>
        {/* User menu */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px 5px 8px',
              background: userMenuOpen ? '#f3f4f6' : 'transparent',
              border: '1px solid ' + (userMenuOpen ? '#e5e7eb' : 'transparent'),
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#e5e7eb' }}
            onMouseLeave={e => { if (!userMenuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
          >
            {/* Avatar circle */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#1e293b', color: '#fcd34d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.[0] ?? '?'}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: '#9ca3af' }}>
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {userMenuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 500,
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)', overflow: 'hidden', minWidth: 180,
            }}>
              {/* Profile info header */}
              <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#1e293b', color: '#fcd34d',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, flexShrink: 0,
                  }}>
                    {user?.[0] ?? '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{user}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                        padding: '1px 6px', borderRadius: 99,
                        background: role === 'admin' ? '#fef9c3' : '#f3f4f6',
                        color: role === 'admin' ? '#92400e' : '#6b7280',
                        textTransform: 'uppercase',
                      }}>{role}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Character */}
              <div
                onClick={() => { setShowCharacter(true); setUserMenuOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: '#374151' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <span style={{ fontSize: 16 }}>🦇</span>
                Character
              </div>

              {/* Controls — admin only */}
              {role === 'admin' && (
                <div
                  onClick={() => { setShowControls(true); setUserMenuOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: '#374151', borderBottom: '1px solid #f0f0f0' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{ fontSize: 16 }}>⚙️</span>
                  Controls
                </div>
              )}

              {/* Log out */}
              <div
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', cursor: 'pointer',
                  fontSize: 13, color: '#ef4444',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M5.5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2.5M10 10.5L13 7.5M13 7.5L10 4.5M13 7.5H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Log out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>

        {/* Sidebar */}
        <div style={{
          width: sw, flexShrink: 0, height: '100%',
          background: '#fff', borderRight: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.2s ease', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 12px 10px', display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'flex-end' }}>
            <button onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand' : 'Collapse'} style={{
              width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 7,
              background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9ca3af', flexShrink: 0, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#9ca3af' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_SECTION_NAMES.map(name => {
              const active = activeSection === name
              const emoji = emojis[name] || DEFAULT_EMOJIS[name]
              return (
                <div key={name} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  {/* Emoji button — opens picker */}
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      const rect = e.currentTarget.getBoundingClientRect()
                      setPickerFor(pickerFor?.name === name ? null : { name, rect })
                    }}
                    title="Change icon"
                    style={{
                      flexShrink: 0, width: 30, height: 30,
                      border: 'none', borderRadius: 6, background: 'none',
                      cursor: 'pointer', fontSize: 17, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {emoji}
                  </button>

                  {/* Label / nav button */}
                  {!sidebarCollapsed && (
                    <button onClick={() => navigateTo(name)} style={{
                      flex: 1, padding: '9px 10px 9px 4px',
                      border: 'none', borderRadius: 8, cursor: 'pointer',
                      background: active ? '#eff6ff' : 'none',
                      color: active ? '#2563eb' : '#374151',
                      fontFamily: 'inherit', fontWeight: active ? 600 : 400,
                      fontSize: 13, transition: 'all 0.12s',
                      textAlign: 'left', whiteSpace: 'nowrap',
                    }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f3f4f6' }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none' }}
                    >
                      {name}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Emoji picker portal */}
          {pickerFor && (
            <EmojiPicker
              anchorRect={pickerFor.rect}
              onSelect={emoji => updateEmoji(pickerFor.name, emoji)}
              onClose={() => setPickerFor(null)}
            />
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <ProcessView key={activeSection} currentUser={user} projectName={activeSection} />
        </div>
      </div>

      {showCharacter && (
        <CharacterProfile
          user={user}
          role={role}
          onClose={() => setShowCharacter(false)}
          onSwitchUser={handleSwitchUser}
        />
      )}

      {showControls && role === 'admin' && (
        <ControlsPanel user={user} onClose={() => setShowControls(false)} />
      )}
    </div>
  )
}
