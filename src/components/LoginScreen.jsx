import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { sha256hex } from '../lib/crypto'

// ── Request access modal ──────────────────────────────────────────────────────

function RequestAccessModal({ onClose }) {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  const handle = async () => {
    const trimEmail = email.trim()
    if (!trimEmail.includes('@')) { setStatus('error'); setErrMsg('Enter a valid email'); return }
    setStatus('sending')
    const { error } = await supabase.rpc('add_access_request', { p_email: trimEmail })
    if (error) { setStatus('error'); setErrMsg(error.message); return }
    // Notify admin by email (fire-and-forget)
    supabase.functions.invoke('send-invite', { body: { type: 'access_request', email: trimEmail } })
    setStatus('done')
  }

  const iStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.08)', transition: 'border-color 0.15s' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 901, background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: '28px', width: 320, boxShadow: '0 24px 64px rgba(0,0,0,0.7)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {status === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🦇</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Request sent!</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 22 }}>
              Batman will review your request and send an invite link if approved.
            </div>
            <button onClick={onClose} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: '#FCD34D', color: '#111827', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Got it →</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#FCD34D', marginBottom: 6 }}>Request Batcave access</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
              Enter your email — Batman will review and send an invite if approved.
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setStatus(null) }}
                onKeyDown={e => e.key === 'Enter' && handle()}
                placeholder="hero@example.com" autoFocus style={iStyle}
                onFocus={e => e.currentTarget.style.borderColor = '#FCD34D'}
                onBlur={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
              {status === 'error' && <div style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>{errMsg}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'none', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >Cancel</button>
              <button onClick={handle} disabled={status === 'sending'} style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: '#FCD34D', color: '#111827', fontSize: 13, fontWeight: 700, cursor: status === 'sending' ? 'default' : 'pointer', fontFamily: 'inherit', opacity: status === 'sending' ? 0.7 : 1 }}>
                {status === 'sending' ? 'Sending…' : 'Send request →'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── Hero silhouettes ──────────────────────────────────────────────────────────

function IronMan() {
  return (
    <svg width="72" height="110" viewBox="0 0 72 110" fill="none">
      {/* Body */}
      <rect x="20" y="52" width="32" height="38" rx="4" fill="#B91C1C"/>
      {/* Chest arc reactor */}
      <circle cx="36" cy="66" r="5" fill="#FCD34D" opacity="0.9"/>
      {/* Legs */}
      <rect x="20" y="88" width="13" height="20" rx="3" fill="#991B1B"/>
      <rect x="39" y="88" width="13" height="20" rx="3" fill="#991B1B"/>
      {/* Arms */}
      <rect x="6" y="54" width="12" height="28" rx="4" fill="#B91C1C"/>
      <rect x="54" y="54" width="12" height="28" rx="4" fill="#B91C1C"/>
      {/* Helmet */}
      <ellipse cx="36" cy="36" rx="18" ry="20" fill="#B91C1C"/>
      {/* Faceplate */}
      <rect x="22" y="36" width="28" height="14" rx="3" fill="#991B1B"/>
      {/* Eye slits */}
      <rect x="24" y="31" width="9" height="4" rx="2" fill="#FCD34D"/>
      <rect x="39" y="31" width="9" height="4" rx="2" fill="#FCD34D"/>
      {/* Neck */}
      <rect x="29" y="52" width="14" height="6" rx="2" fill="#991B1B"/>
    </svg>
  )
}

function Superman() {
  return (
    <svg width="72" height="120" viewBox="0 0 72 120" fill="none">
      {/* Cape */}
      <path d="M22 50 Q4 70 8 110 Q36 90 64 110 Q68 70 50 50Z" fill="#DC2626"/>
      {/* Body */}
      <rect x="22" y="50" width="28" height="38" rx="4" fill="#1D4ED8"/>
      {/* S Shield */}
      <polygon points="36,56 44,62 36,74 28,62" fill="#FCD34D"/>
      <text x="36" y="69" textAnchor="middle" fontSize="10" fontWeight="900" fill="#DC2626">S</text>
      {/* Legs */}
      <rect x="22" y="86" width="12" height="22" rx="3" fill="#1D4ED8"/>
      <rect x="38" y="86" width="12" height="22" rx="3" fill="#1D4ED8"/>
      {/* Boots */}
      <rect x="21" y="104" width="14" height="8" rx="3" fill="#DC2626"/>
      <rect x="37" y="104" width="14" height="8" rx="3" fill="#DC2626"/>
      {/* Arms */}
      <rect x="8" y="52" width="12" height="26" rx="4" fill="#1D4ED8"/>
      <rect x="52" y="52" width="12" height="26" rx="4" fill="#1D4ED8"/>
      {/* Head */}
      <ellipse cx="36" cy="30" rx="14" ry="16" fill="#FBBF24"/>
      {/* Hair */}
      <path d="M22 26 Q24 16 36 14 Q48 16 50 26 Q46 20 36 20 Q26 20 22 26Z" fill="#1C1917"/>
      {/* S curl */}
      <path d="M34 14 Q30 10 32 14" stroke="#1C1917" strokeWidth="2" fill="none"/>
    </svg>
  )
}

function WonderWoman() {
  return (
    <svg width="68" height="118" viewBox="0 0 68 118" fill="none">
      {/* Skirt */}
      <path d="M18 78 L10 115 L34 105 L58 115 L50 78Z" fill="#DC2626"/>
      {/* Body */}
      <rect x="18" y="50" width="32" height="32" rx="4" fill="#DC2626"/>
      {/* Chest armor */}
      <path d="M18 50 L34 60 L50 50 L50 54 L34 64 L18 54Z" fill="#D97706"/>
      {/* WW symbol */}
      <text x="34" y="72" textAnchor="middle" fontSize="11" fontWeight="900" fill="#D97706">WW</text>
      {/* Arms — bracers */}
      <rect x="4" y="52" width="12" height="22" rx="4" fill="#92400E"/>
      <rect x="52" y="52" width="12" height="22" rx="4" fill="#92400E"/>
      <rect x="3" y="66" width="14" height="5" rx="2" fill="#D97706"/>
      <rect x="51" y="66" width="14" height="5" rx="2" fill="#D97706"/>
      {/* Boots */}
      <rect x="10" y="105" width="16" height="8" rx="3" fill="#92400E"/>
      <rect x="42" y="105" width="16" height="8" rx="3" fill="#92400E"/>
      {/* Head */}
      <ellipse cx="34" cy="30" rx="14" ry="16" fill="#FBBF24"/>
      {/* Hair */}
      <path d="M20 30 Q20 14 34 12 Q48 14 48 30 Q48 36 46 38 L48 44 Q42 40 34 42 Q26 40 20 44 L22 38 Q20 36 20 30Z" fill="#1C1917"/>
      {/* Tiara */}
      <path d="M22 22 L34 16 L46 22" stroke="#D97706" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <polygon points="34,14 38,20 34,18 30,20" fill="#DC2626"/>
    </svg>
  )
}

function SpiderMan() {
  return (
    <svg width="68" height="118" viewBox="0 0 68 118" fill="none">
      {/* Web lines from hands */}
      <line x1="6" y1="64" x2="20" y2="64" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,2"/>
      <line x1="62" y1="64" x2="48" y2="64" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,2"/>
      {/* Body */}
      <rect x="20" y="50" width="28" height="36" rx="4" fill="#DC2626"/>
      {/* Spider symbol */}
      <ellipse cx="34" cy="62" rx="5" ry="7" fill="#1C1917"/>
      <line x1="34" y1="56" x2="34" y2="70" stroke="#1C1917" strokeWidth="1"/>
      <line x1="28" y1="59" x2="40" y2="65" stroke="#1C1917" strokeWidth="1"/>
      <line x1="40" y1="59" x2="28" y2="65" stroke="#1C1917" strokeWidth="1"/>
      {/* Legs */}
      <rect x="20" y="84" width="12" height="22" rx="3" fill="#1D4ED8"/>
      <rect x="36" y="84" width="12" height="22" rx="3" fill="#1D4ED8"/>
      {/* Arms — outstretched */}
      <rect x="4" y="52" width="14" height="10" rx="4" fill="#DC2626"/>
      <rect x="50" y="52" width="14" height="10" rx="4" fill="#DC2626"/>
      {/* Fists */}
      <circle cx="6" cy="64" r="5" fill="#DC2626"/>
      <circle cx="62" cy="64" r="5" fill="#DC2626"/>
      {/* Head */}
      <ellipse cx="34" cy="30" rx="15" ry="17" fill="#DC2626"/>
      {/* Mask web lines */}
      <line x1="34" y1="13" x2="34" y2="47" stroke="#1C1917" strokeWidth="1"/>
      <line x1="19" y1="28" x2="49" y2="32" stroke="#1C1917" strokeWidth="1"/>
      <line x1="21" y1="20" x2="47" y2="40" stroke="#1C1917" strokeWidth="1"/>
      <line x1="21" y1="38" x2="47" y2="20" stroke="#1C1917" strokeWidth="1"/>
      {/* Eyes */}
      <ellipse cx="28" cy="28" rx="6" ry="4" fill="white" opacity="0.9"/>
      <ellipse cx="40" cy="28" rx="6" ry="4" fill="white" opacity="0.9"/>
    </svg>
  )
}

function Joker() {
  return (
    <svg width="68" height="124" viewBox="0 0 68 124" fill="none">
      {/* Coat tails */}
      <path d="M16 80 L8 124 L34 108 L60 124 L52 80Z" fill="#7C3AED"/>
      {/* Body */}
      <rect x="16" y="52" width="36" height="32" rx="4" fill="#7C3AED"/>
      {/* Lapels */}
      <path d="M16 52 L34 68 L52 52 L52 56 L34 72 L16 56Z" fill="#059669"/>
      {/* Flower */}
      <circle cx="44" cy="58" r="4" fill="#DC2626"/>
      <circle cx="44" cy="54" r="2" fill="#FCD34D"/>
      {/* Legs */}
      <rect x="16" y="80" width="14" height="22" rx="3" fill="#1C1917"/>
      <rect x="38" y="80" width="14" height="22" rx="3" fill="#1C1917"/>
      {/* Shoes */}
      <ellipse cx="23" cy="103" rx="9" ry="4" fill="#1C1917"/>
      <ellipse cx="45" cy="103" rx="9" ry="4" fill="#1C1917"/>
      {/* Arms */}
      <rect x="4" y="54" width="10" height="24" rx="4" fill="#7C3AED"/>
      <rect x="54" y="54" width="10" height="24" rx="4" fill="#7C3AED"/>
      {/* Head */}
      <ellipse cx="34" cy="28" rx="15" ry="18" fill="#D1FAE5"/>
      {/* Green hair */}
      <path d="M19 22 Q22 8 34 10 Q46 8 49 22 Q44 14 34 14 Q24 14 19 22Z" fill="#059669"/>
      <path d="M22 10 Q28 2 34 6" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M46 10 Q40 2 34 6" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M22 34 Q34 46 46 34" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <circle cx="27" cy="26" r="3" fill="#FCD34D"/>
      <circle cx="41" cy="26" r="3" fill="#FCD34D"/>
      {/* Hat */}
      <rect x="16" y="12" width="36" height="5" rx="2" fill="#1C1917"/>
      <rect x="22" y="2" width="24" height="12" rx="3" fill="#1C1917"/>
    </svg>
  )
}

function Batman() {
  return (
    <svg width="80" height="124" viewBox="0 0 80 124" fill="none">
      {/* Cape */}
      <path d="M16 52 Q2 20 0 0 Q16 30 40 36 Q64 30 80 0 Q78 20 64 52Z" fill="#1C1917"/>
      <path d="M16 52 Q4 80 8 124 Q40 100 72 124 Q76 80 64 52Z" fill="#111827"/>
      {/* Body */}
      <rect x="20" y="52" width="40" height="36" rx="4" fill="#1C1917"/>
      {/* Bat symbol */}
      <path d="M28 66 Q34 58 40 66 Q46 58 52 66 Q48 74 40 70 Q32 74 28 66Z" fill="#374151"/>
      {/* Belt */}
      <rect x="20" y="80" width="40" height="8" rx="2" fill="#D97706"/>
      <rect x="36" y="79" width="8" height="10" rx="2" fill="#92400E"/>
      {/* Legs */}
      <rect x="20" y="86" width="17" height="24" rx="3" fill="#1C1917"/>
      <rect x="43" y="86" width="17" height="24" rx="3" fill="#1C1917"/>
      {/* Boots */}
      <rect x="18" y="104" width="21" height="9" rx="3" fill="#111827"/>
      <rect x="41" y="104" width="21" height="9" rx="3" fill="#111827"/>
      {/* Arms */}
      <rect x="6" y="54" width="12" height="28" rx="4" fill="#1C1917"/>
      <rect x="62" y="54" width="12" height="28" rx="4" fill="#1C1917"/>
      {/* Head */}
      <ellipse cx="40" cy="36" rx="16" ry="16" fill="#1C1917"/>
      {/* Cowl */}
      <path d="M24 36 Q26 20 40 18 Q54 20 56 36 Q54 26 40 24 Q26 26 24 36Z" fill="#111827"/>
      {/* Ears */}
      <polygon points="28,22 24,6 34,18" fill="#111827"/>
      <polygon points="52,22 56,6 46,18" fill="#111827"/>
      {/* Eyes */}
      <rect x="30" y="34" width="8" height="3" rx="1.5" fill="white" opacity="0.85"/>
      <rect x="42" y="34" width="8" height="3" rx="1.5" fill="white" opacity="0.85"/>
    </svg>
  )
}

// ── Cityscape backdrop ────────────────────────────────────────────────────────

function Cityscape() {
  return (
    <svg viewBox="0 0 900 180" style={{ width: '100%', display: 'block' }} preserveAspectRatio="xMidYMax slice">
      {/* Moon */}
      <circle cx="750" cy="40" r="28" fill="#FEF3C7" opacity="0.5"/>
      {/* Buildings — back layer */}
      <rect x="0"   y="80"  width="70"  height="100" fill="#1e293b"/>
      <rect x="60"  y="50"  width="50"  height="130" fill="#1e2a3a"/>
      <rect x="100" y="70"  width="40"  height="110" fill="#172033"/>
      <rect x="130" y="30"  width="60"  height="150" fill="#1e2a3a"/>
      <rect x="180" y="60"  width="45"  height="120" fill="#1e293b"/>
      <rect x="215" y="40"  width="55"  height="140" fill="#172033"/>
      <rect x="260" y="55"  width="50"  height="125" fill="#1e2a3a"/>
      <rect x="300" y="20"  width="70"  height="160" fill="#1e293b"/>
      <rect x="360" y="50"  width="45"  height="130" fill="#172033"/>
      <rect x="395" y="35"  width="65"  height="145" fill="#1e2a3a"/>
      <rect x="450" y="55"  width="50"  height="125" fill="#1e293b"/>
      <rect x="490" y="25"  width="60"  height="155" fill="#172033"/>
      <rect x="540" y="60"  width="45"  height="120" fill="#1e2a3a"/>
      <rect x="575" y="40"  width="55"  height="140" fill="#1e293b"/>
      <rect x="620" y="70"  width="40"  height="110" fill="#172033"/>
      <rect x="650" y="30"  width="70"  height="150" fill="#1e2a3a"/>
      <rect x="710" y="55"  width="50"  height="125" fill="#1e293b"/>
      <rect x="750" y="40"  width="60"  height="140" fill="#172033"/>
      <rect x="800" y="65"  width="45"  height="115" fill="#1e2a3a"/>
      <rect x="835" y="30"  width="65"  height="150" fill="#1e293b"/>
      {/* Windows — scattered lit */}
      {[[80,60],[82,72],[82,84],[95,55],[95,67],[142,40],[142,52],[155,38],[155,50],[310,30],[310,42],[322,28],[390,18],[392,42],[460,64],[472,58],[500,35],[502,47],[660,40],[662,52],[762,50],[764,62],[840,40]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="5" height="4" rx="1" fill="#FEF3C7" opacity={0.4 + (i%3)*0.2}/>
      ))}
      {/* Ground */}
      <rect x="0" y="172" width="900" height="8" fill="#0f172a"/>
    </svg>
  )
}

// ── Login Screen ──────────────────────────────────────────────────────────────

export default function LoginScreen({ onLogin }) {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState(false)
  const [loading, setLoading]     = useState(false)
  const [showRequest, setShowRequest] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    const hash = await sha256hex(password)
    const { data: name } = await supabase.rpc('verify_hero_by_email', { p_email: email.trim(), p_hash: hash })
    setLoading(false)
    if (name) {
      sessionStorage.setItem('ataska_user', name)
      sessionStorage.setItem('ataska_auth', '1')
      onLogin(name)
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 50%, #111827 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[...Array(60)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 137.5) % 100}%`,
            top: `${(i * 97.3) % 55}%`,
            width: i % 5 === 0 ? 2.5 : 1.5,
            height: i % 5 === 0 ? 2.5 : 1.5,
            borderRadius: '50%',
            background: 'white',
            opacity: 0.2 + (i % 4) * 0.15,
          }} />
        ))}
      </div>

      {/* Top tagline */}
      <div style={{ textAlign: 'center', paddingTop: 52, paddingBottom: 8, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FCD34D', marginBottom: 10, opacity: 0.85 }}>
          🦇 &nbsp; Batcave CRM
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>
          The Internal CRM
        </h1>
        <p style={{ fontSize: 15, color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>
          for real superheroes only. No capes required&nbsp;🦸
        </p>
      </div>

      {/* Login card */}
      <div style={{ display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center', position: 'relative', zIndex: 1, paddingBottom: 40 }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20, padding: '36px 32px',
          width: 320, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Identify yourself, hero</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(false) }}
                placeholder="hero@batcave.com"
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 14,
                  color: '#fff', outline: 'none', fontFamily: 'inherit',
                  background: 'rgba(255,255,255,0.08)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#FCD34D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(252,211,77,0.1)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Secret code
              </label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: 10, fontSize: 14, color: '#fff', outline: 'none',
                  fontFamily: 'inherit', background: error ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.08)',
                }}
                onFocus={e => { if (!error) { e.currentTarget.style.borderColor = '#FCD34D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(252,211,77,0.1)' } }}
                onBlur={e => { if (!error) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = 'none' } }}
              />
              {error && <p style={{ fontSize: 12, color: '#f87171', margin: '5px 0 0' }}>Wrong code, villain detected 🚨</p>}
            </div>

            <button type="submit" style={{
              marginTop: 4, padding: '11px', background: '#FCD34D', color: '#111827',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FCD34D'; e.currentTarget.style.transform = 'none' }}
            >
              {loading ? 'Verifying…' : 'Enter Batcave →'}
            </button>
          </form>

          {/* Request access */}
          <div style={{ textAlign: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => setShowRequest(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#475569', fontFamily: 'inherit', padding: 0, textDecoration: 'underline', textDecorationColor: 'rgba(71,85,105,0.4)', textUnderlineOffset: 3 }}
              onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
              Request Batcave access
            </button>
          </div>
        </div>
      </div>

      {showRequest && <RequestAccessModal onClose={() => setShowRequest(false)} />}

      {/* Hero collage */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Cityscape */}
        <Cityscape />

        {/* Heroes standing on the skyline */}
        <div style={{
          position: 'absolute', bottom: 6, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
          padding: '0 40px',
        }}>
          <div style={{ opacity: 0.9, filter: 'drop-shadow(0 0 12px rgba(185,28,28,0.5))' }}><IronMan /></div>
          <div style={{ opacity: 0.9, filter: 'drop-shadow(0 0 12px rgba(29,78,216,0.5))' }}><Superman /></div>
          <div style={{ opacity: 0.9, filter: 'drop-shadow(0 0 12px rgba(217,119,6,0.5))' }}><WonderWoman /></div>
          <div style={{ opacity: 0.9, filter: 'drop-shadow(0 0 12px rgba(220,38,38,0.5))' }}><SpiderMan /></div>
          <div style={{ opacity: 0.9, filter: 'drop-shadow(0 0 12px rgba(124,58,237,0.5))' }}><Joker /></div>
          <div style={{ opacity: 0.9, filter: 'drop-shadow(0 0 16px rgba(252,211,77,0.4))' }}><Batman /></div>
        </div>
      </div>

    </div>
  )
}
