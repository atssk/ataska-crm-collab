import { useState, useEffect } from 'react'
import { HERO_LIBRARY } from './CharacterProfile'
import { supabase } from '../lib/supabase'
import { sha256hex } from '../lib/crypto'

function getTeam() {
  try { return JSON.parse(localStorage.getItem('batcave_heroes') || '["Batman","Robin"]') }
  catch { return ['Batman', 'Robin'] }
}

// Read URL params once
const _params   = new URLSearchParams(window.location.search)
const URL_EMAIL = _params.get('email') || ''
const URL_HERO  = _params.get('hero')  || ''

// ── Hero grid card ────────────────────────────────────────────────────────────

function HeroCard({ name, char, inTeam, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onClick(name)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 18,
        background: char.bg,
        border: '2px solid ' + (hovered && !inTeam ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)'),
        cursor: 'pointer',
        opacity: inTeam ? 0.5 : 1,
        transition: 'all 0.18s',
        transform: hovered && !inTeam ? 'scale(1.03)' : 'scale(1)',
        boxShadow: hovered && !inTeam ? '0 12px 40px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 16px 18px', overflow: 'hidden',
      }}
    >
      {/* In-team chip */}
      {inTeam && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 99,
          background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)',
        }}>
          In team
        </div>
      )}

      {/* SVG figure */}
      <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', width: 80 }}>
        <div style={{ transform: 'scale(0.75)', transformOrigin: 'bottom center' }}>
          {char.svg}
        </div>
      </div>

      {/* Name */}
      <div style={{ marginTop: 12, fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
        {name}
      </div>

      {/* Role */}
      <div style={{ marginTop: 3, fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {char.role}
      </div>
    </div>
  )
}

// ── Hero info modal (step 1) ──────────────────────────────────────────────────

function HeroInfoModal({ name, char, inTeam, onConfirm, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 1001,
        transform: 'translate(-50%, -50%)',
        width: 340, borderRadius: 28,
        background: char.bg,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 60px ${char.color}22`,
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {/* Hero figure — large */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          height: 180, overflow: 'hidden',
          background: `radial-gradient(ellipse at 50% 120%, ${char.color}18 0%, transparent 70%)`,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            transform: 'scale(1.15)', transformOrigin: 'bottom center',
            filter: `drop-shadow(0 0 24px ${char.color}66)`,
          }}>
            {char.svg}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Name + role */}
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: char.color, letterSpacing: '-0.01em' }}>{name}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>
              {char.role}
            </div>
          </div>

          {/* Tagline */}
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.5 }}>
            "{char.tagline}"
          </div>

          {/* Stats row */}
          {char.stats?.length > 0 && (
            <div style={{ display: 'flex', gap: 0, marginTop: 4, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
              {char.stats.map((s, i) => (
                <div key={s.label} style={{ flex: 1, padding: '10px 4px', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: char.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* CTA / in-team message */}
          {inTeam ? (
            <div style={{ marginTop: 8, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              This hero is already in the team
            </div>
          ) : (
            <button
              onClick={onConfirm}
              style={{
                marginTop: 8, padding: '14px 0', borderRadius: 14, border: 'none',
                background: char.color, color: '#000',
                fontSize: 15, fontWeight: 900, cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: '0.01em',
                boxShadow: `0 4px 20px ${char.color}55`,
                transition: 'opacity 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.02)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              That's me! 🦸
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ── Setup modal (step 2) — set email + create password ───────────────────────

function SetupModal({ hero, char, preEmail, onSuccess, onBack }) {
  const [email, setEmail]     = useState(preEmail || '')
  const [pass, setPass]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)

  const iStyle = (hasErr) => ({
    width: '100%', boxSizing: 'border-box',
    border: '2px solid ' + (hasErr ? '#ef4444' : 'rgba(255,255,255,0.12)'),
    borderRadius: 12, padding: '12px 16px', fontSize: 14,
    background: 'rgba(255,255,255,0.05)', color: '#fff',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
  })

  const handle = async () => {
    if (!email.includes('@'))   { setError('Enter a valid email'); return }
    if (pass.length < 4)        { setError('Password must be 4+ characters'); return }
    if (pass !== confirm)       { setError('Passwords do not match'); return }
    setSaving(true)
    const hash = await sha256hex(pass)
    const { error: dbErr } = await supabase.rpc('upsert_hero', {
      p_name: hero, p_email: email.trim(), p_role: 'user', p_hash: hash
    })
    if (dbErr) { setSaving(false); setError(dbErr.message); return }
    // Remove from pending invites
    await supabase.rpc('remove_invite', { p_email: email.trim() })
    onSuccess(hero)
  }

  return (
    <>
      <div onClick={onBack} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 1001,
        transform: 'translate(-50%, -50%)',
        width: 340, borderRadius: 28,
        background: char.bg,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 60px ${char.color}33`,
        padding: '32px 28px 28px',
        display: 'flex', flexDirection: 'column', gap: 14,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        {/* Mini hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ height: 64, overflow: 'hidden', flexShrink: 0, filter: `drop-shadow(0 0 12px ${char.color}88)` }}>
            <div style={{ transform: 'scale(0.52)', transformOrigin: 'top center' }}>{char.svg}</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: char.color }}>{hero}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>Set up your account</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Your email</div>
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="hero@batcave.com" autoFocus style={iStyle(false)}
            onFocus={e => e.currentTarget.style.borderColor = char.color}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Create password</div>
          <input type="password" value={pass} onChange={e => { setPass(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="••••••••" style={iStyle(false)}
            onFocus={e => e.currentTarget.style.borderColor = char.color}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Confirm password</div>
          <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="••••••••" style={iStyle(!!error && pass !== confirm)}
            onFocus={e => e.currentTarget.style.borderColor = char.color}
            onBlur={e => e.currentTarget.style.borderColor = (error && pass !== confirm) ? '#ef4444' : 'rgba(255,255,255,0.12)'}
          />
        </div>

        {error && <div style={{ fontSize: 12, color: '#f87171' }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handle} disabled={saving} style={{
            width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
            background: char.color, color: '#000', fontSize: 14, fontWeight: 900,
            cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
            boxShadow: `0 4px 20px ${char.color}44`, opacity: saving ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}>
            {saving ? 'Joining…' : `Join as ${hero} →`}
          </button>
          <button onClick={onBack} style={{
            width: '100%', padding: '10px 0', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.35)', fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >← Not me</button>
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InvitePage({ onLogin }) {
  // step: null | 'info' | 'code'
  const [step, setStep]         = useState(null)
  const [selected, setSelected] = useState(null)
  const team = getTeam()
  const allHeroes = Object.keys(HERO_LIBRARY)

  // Auto-open pre-selected hero from invite URL
  useEffect(() => {
    if (URL_HERO && HERO_LIBRARY[URL_HERO]) {
      setSelected(URL_HERO)
      setStep('info')
    }
  }, [])

  const handleCardClick  = (name) => { setSelected(name); setStep('info') }
  const handleConfirmMe  = ()     => setStep('code')
  const handleClose      = ()     => { setStep(null); setSelected(null) }

  const handleSuccess = (name) => {
    sessionStorage.setItem('ataska_auth', '1')
    sessionStorage.setItem('ataska_user', name)
    if (!team.includes(name)) {
      localStorage.setItem('batcave_heroes', JSON.stringify([...team, name]))
    }
    onLogin(name)
  }

  const char = selected ? HERO_LIBRARY[selected] : null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #060912 0%, #0c1020 50%, #0a0f1a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overflowX: 'hidden',
    }}>
      {/* Stars */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%', background: '#fff',
            width: Math.random() > 0.7 ? 2 : 1, height: Math.random() > 0.7 ? 2 : 1,
            opacity: 0.15 + Math.random() * 0.5,
            left: `${(i * 37 + i * i * 3) % 100}%`,
            top: `${(i * 53 + i * 7) % 70}%`,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🦇</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            You've been invited to the Batcave
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
            Every team needs a hero. Who are you by spirit?
          </p>
        </div>

        {/* Hero grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
          {allHeroes.map(name => (
            <HeroCard
              key={name}
              name={name}
              char={HERO_LIBRARY[name]}
              inTeam={team.includes(name)}
              onClick={handleCardClick}
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>
          You'll need the secret code to enter
        </div>
      </div>

      {/* Step 1 — hero info */}
      {step === 'info' && char && (
        <HeroInfoModal
          name={selected}
          char={char}
          inTeam={team.includes(selected)}
          onConfirm={handleConfirmMe}
          onClose={handleClose}
        />
      )}

      {/* Step 2 — account setup */}
      {step === 'code' && char && (
        <SetupModal
          hero={selected}
          char={char}
          preEmail={URL_EMAIL}
          onSuccess={handleSuccess}
          onBack={() => setStep('info')}
        />
      )}
    </div>
  )
}
