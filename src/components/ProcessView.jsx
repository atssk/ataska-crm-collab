import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import BatmanLoader from './BatmanLoader'

// ── Constants ─────────────────────────────────────────────────────────────────
const USERS = ['Batman', 'Robin']

const DEFAULT_GROUPS = [
  { label: 'New',         color: '#6b7280' },
  { label: 'In Progress', color: '#3b82f6' },
  { label: 'Testing',     color: '#f59e0b' },
  { label: 'Done',        color: '#10b981' },
  { label: 'Deployed',    color: '#8b5cf6' },
]
const GROUP_COLORS = ['#6b7280','#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444','#ec4899','#0891b2']

const DEFAULT_STATUSES = [
  { key: 'pending',   label: 'Pending',      color: '#9ca3af', bg: '#f3f4f6' },
  { key: 'requested', label: 'Requested',    color: '#3b82f6', bg: '#eff6ff' },
  { key: 'draft',     label: 'Draft',        color: '#d97706', bg: '#fffbeb' },
  { key: 'uploaded',  label: 'Uploaded',     color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'reviewing', label: 'Under Review', color: '#0891b2', bg: '#ecfeff' },
  { key: 'approved',  label: 'Approved',     color: '#059669', bg: '#ecfdf5' },
  { key: 'n_a',       label: 'N/A',          color: '#6b7280', bg: '#f9fafb' },
]

function statusConf(key) {
  return DEFAULT_STATUSES.find(s => s.key === key) || DEFAULT_STATUSES[0]
}

function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function DaysChip({ dueDate }) {
  if (!dueDate) return null
  const days = Math.ceil((new Date(dueDate) - new Date()) / 86400000)
  const overdue = days < 0, urgent = days >= 0 && days <= 3
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99, whiteSpace: 'nowrap',
      background: overdue ? '#fef2f2' : urgent ? '#fffbeb' : '#f3f4f6',
      color: overdue ? '#dc2626' : urgent ? '#d97706' : '#6b7280',
    }}>
      {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'due today' : `${days}d left`}
    </span>
  )
}

function AssigneeAvatar({ name, size = 22 }) {
  const colors = ['#3b82f6', '#059669', '#d97706', '#7c3aed', '#0891b2', '#ef4444']
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  const color = colors[Math.abs(h) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color, color: '#fff',
      fontSize: Math.round(size * 0.42), fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, userSelect: 'none',
    }}>{name[0]?.toUpperCase()}</div>
  )
}

function AssigneeButton({ name, onChange, small }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const size = small ? 20 : 24

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} title={name || 'Assign'} style={{
        width: size, height: size, borderRadius: '50%', padding: 0,
        border: name ? 'none' : '1.5px dashed #d1d5db',
        background: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {name ? <AssigneeAvatar name={name} size={size} /> : (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M4.5 1v7M1 4.5h7" stroke="#d1d5db" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 300,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: 130,
        }}>
          {USERS.map(u => (
            <div key={u} onClick={() => { onChange(u); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                cursor: 'pointer', fontSize: 13,
                background: u === name ? '#eff6ff' : '#fff',
                color: u === name ? '#2563eb' : '#374151',
                fontWeight: u === name ? 600 : 400,
              }}
              onMouseEnter={e => { if (u !== name) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={e => { if (u !== name) e.currentTarget.style.background = '#fff' }}
            >
              <AssigneeAvatar name={u} size={20} />
              {u}
            </div>
          ))}
          {name && (
            <div onClick={() => { onChange(null); setOpen(false) }}
              style={{ padding: '7px 14px', cursor: 'pointer', fontSize: 12, color: '#9ca3af', borderTop: '1px solid #f0f0f0' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af' }}
            >Remove</div>
          )}
        </div>
      )}
    </div>
  )
}

function StatusDropdown({ value, onChange, small }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const conf = statusConf(value)

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: small ? 4 : 6,
        padding: small ? '2px 7px 2px 8px' : '5px 10px 5px 12px',
        background: conf.bg, border: `1.5px solid ${conf.color}`,
        borderRadius: 99, cursor: 'pointer', fontSize: small ? 11 : 12,
        fontWeight: 600, color: conf.color,
      }}>
        {conf.label}
        <svg width={small ? 8 : 10} height={small ? 8 : 10} viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke={conf.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', minWidth: 160,
        }}>
          {DEFAULT_STATUSES.map(s => (
            <div key={s.key} onClick={() => { onChange(s.key); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', cursor: 'pointer',
                fontSize: 13, fontWeight: s.key === value ? 600 : 400,
                background: s.key === value ? s.bg : '#fff', color: s.key === value ? s.color : '#374151',
              }}
              onMouseEnter={e => { if (s.key !== value) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={e => { if (s.key !== value) e.currentTarget.style.background = '#fff' }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InlineEdit({ value, onChange, placeholder = 'Untitled', style = {} }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    const t = draft.trim()
    if (t && t !== value) onChange(t)
    else setDraft(value)
  }

  if (editing) return (
    <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
      style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', fontFamily: 'inherit', padding: 0, margin: 0, width: '100%', ...style }}
    />
  )
  return (
    <span onDoubleClick={() => setEditing(true)} style={{ cursor: 'default', ...style }}>
      {value || <span style={{ color: '#9ca3af' }}>{placeholder}</span>}
    </span>
  )
}

// ── Milestone bar label (rename on double-click, delete on hover) ─────────────
function MilestoneBarLabel({ milestone, active, done, onRename, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(milestone.label)
  const [hov, setHov] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const inputRef = useRef(null)
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => { setDraft(milestone.label) }, [milestone.label])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => {
    if (!menuOpen) return
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  const commit = () => {
    setEditing(false)
    const t = draft.trim()
    if (t && t !== milestone.label) onRename(t)
    else setDraft(milestone.label)
  }

  const textColor = done || active ? '#fff' : '#6b7280'

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4 }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(milestone.label); setEditing(false) } }}
          onClick={e => e.stopPropagation()}
          style={{ flex: 1, border: 'none', background: 'rgba(255,255,255,0.25)', borderRadius: 5, outline: 'none', padding: '2px 6px', fontSize: 11, fontWeight: 600, color: textColor, fontFamily: 'inherit', minWidth: 0 }}
        />
      ) : (
        <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {milestone.label}
        </span>
      )}
      {hov && !editing && (
        <>
          <button ref={btnRef}
            onClick={e => { e.stopPropagation(); const r = btnRef.current.getBoundingClientRect(); setMenuPos({ top: r.bottom + 4, left: r.right - 130 }); setMenuOpen(o => !o) }}
            style={{ width: 18, height: 18, borderRadius: 4, border: 'none', background: 'rgba(255,255,255,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: textColor, padding: 0 }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="2.5" r="1" fill="currentColor"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="9.5" r="1" fill="currentColor"/></svg>
          </button>
          {menuOpen && (
            <div ref={menuRef} style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', overflow: 'hidden', width: 130 }}>
              {[
                { label: 'Rename', icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2L11 4L5 10H3V8L9 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>, action: () => { setMenuOpen(false); setEditing(true) } },
                onDelete ? { label: 'Delete', icon: <svg width="13" height="13" viewBox="0 0 11 11" fill="none"><path d="M2 2.5h7M4.5 2.5V2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v.5M4 9.5h3a1 1 0 0 0 1-1V4H3v4.5a1 1 0 0 0 1 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>, danger: true, action: () => { setMenuOpen(false); onDelete() } } : null,
              ].filter(Boolean).map(item => (
                <div key={item.label} onClick={e => { e.stopPropagation(); item.action() }} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: item.danger ? '#ef4444' : '#374151', background: '#fff' }}
                  onMouseEnter={e => { e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f9fafb' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
                  <span style={{ color: item.danger ? '#ef4444' : '#9ca3af', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Detail view ───────────────────────────────────────────────────────────────
function parseNotes(raw) {
  if (!raw) return []
  try {
    const p = JSON.parse(raw)
    if (Array.isArray(p)) return p
  } catch {}
  return [{ author: 'Legacy', text: raw, ts: null }]
}

function fmtTs(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const day = d.getDate()
  const month = d.toLocaleString('en', { month: 'long' })
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${hh}:${mm}`
}

function DetailView({ nodeId, nodeType, label, statusVal, dueDate, notes, onUpdate, onBack, groups, groupId }) {
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [preview, setPreview] = useState(null) // { url, type, name }
  const chatEndRef = useRef(null)
  const fileRef = useRef(null)
  const currentUser = sessionStorage.getItem('ataska_user') || 'Unknown'
  const messages = parseNotes(notes)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [notes])

  const sendMessage = () => {
    const text = chatInput.trim()
    if (!text) return
    const next = [...messages, { author: currentUser, text, ts: new Date().toISOString() }]
    onUpdate({ notes: JSON.stringify(next) })
    setChatInput('')
  }

  useEffect(() => { loadAttachments() }, [nodeId])

  const getSignedUrl = async (path) => {
    const { data, error } = await supabase.storage.from('ataska-files').createSignedUrl(path, 3600)
    if (error) { console.error('signed url error', error); return null }
    return data.signedUrl
  }

  const loadAttachments = async () => {
    const col = nodeType === 'item' ? 'item_id' : 'subitem_id'
    const { data, error } = await supabase.from('attachments').select('*').eq(col, nodeId).order('created_at')
    if (error) { console.error('load attachments error', error); return }
    const rows = data || []
    // resolve signed URLs in parallel
    const withUrls = await Promise.all(rows.map(async att => ({
      ...att,
      url: await getSignedUrl(att.storage_path)
    })))
    setAttachments(withUrls)
  }

  const handleFiles = async (files) => {
    setUploading(true)
    const col = nodeType === 'item' ? 'item_id' : 'subitem_id'
    for (const file of Array.from(files)) {
      const path = `${nodeId}/${Date.now()}_${file.name}`
      const { error: upErr } = await supabase.storage.from('ataska-files').upload(path, file)
      if (upErr) { console.error('upload error', upErr); continue }
      const { data, error: dbErr } = await supabase.from('attachments').insert({
        [col]: nodeId, storage_path: path,
        file_name: file.name, file_size: file.size, file_type: file.type,
      }).select().single()
      if (dbErr) { console.error('insert error', dbErr); continue }
      if (data) {
        const url = await getSignedUrl(path)
        setAttachments(prev => [...prev, { ...data, url }])
      }
    }
    setUploading(false)
  }

  const removeAttachment = async (att) => {
    await supabase.storage.from('ataska-files').remove([att.storage_path])
    await supabase.from('attachments').delete().eq('id', att.id)
    setAttachments(prev => prev.filter(a => a.id !== att.id))
    if (preview?.url === att.url) setPreview(null)
  }

  const isImage = (type = '') => type.startsWith('image/')
  const isPdf = (type = '') => type === 'application/pdf'

  const fileIcon = (type = '') => {
    if (isImage(type)) return '🖼'
    if (isPdf(type)) return '📄'
    return '📎'
  }

  return (
    <div>
      <input ref={fileRef} type="file" multiple style={{ display: 'none' }}
        onChange={e => { handleFiles(e.target.files); e.target.value = '' }} />

      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px 6px 8px', marginBottom: 20,
        background: '#f3f4f6', border: 'none', borderRadius: 8,
        cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 16px', lineHeight: 1.35 }}>{label}</h2>

        {/* Group chips — shown only for items with groups context */}
        {groups && groups.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Group</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {groups.map(g => {
                const active = groupId === g.id
                return (
                  <button key={g.id} onClick={() => onUpdate({ group_id: g.id })} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${active ? g.color : '#e5e7eb'}`,
                    background: active ? `${g.color}18` : '#fff',
                    color: active ? g.color : '#9ca3af',
                    transition: 'all 0.12s',
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.color = g.color } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af' } }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                    {g.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Due date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 12 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect x="2" y="3" width="12" height="11" rx="2" stroke="#9ca3af" strokeWidth="1.4"/>
          <path d="M2 7h12M5 1v2M11 1v2" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' }}>Due date</span>
        <input type="date" value={dueDate || ''} onChange={e => onUpdate({ due_date: e.target.value || null })}
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: '#111827', outline: 'none', cursor: 'pointer' }} />
        {dueDate && <DaysChip dueDate={dueDate} />}
        {dueDate && <button onClick={() => onUpdate({ due_date: null })} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af', padding: 0, lineHeight: 1 }}>×</button>}
      </div>

      {/* Notes / Chat */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Notes</div>

        {/* Messages */}
        <div style={{
          minHeight: 80, maxHeight: 320, overflowY: 'auto',
          border: '1px solid #e5e7eb', borderRadius: '10px 10px 0 0',
          padding: '10px 12px', background: '#fafafa',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {messages.length === 0 && (
            <div style={{ color: '#d1d5db', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>No messages yet</div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.author === currentUser
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%',
                  background: isMe ? '#dbeafe' : '#fff',
                  border: `1px solid ${isMe ? '#bfdbfe' : '#e5e7eb'}`,
                  borderRadius: isMe ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  padding: '7px 11px',
                }}>
                  {!isMe && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', marginBottom: 2 }}>{msg.author}</div>
                  )}
                  <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</div>
                </div>
                {msg.ts && (
                  <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2, paddingLeft: isMe ? 0 : 2, paddingRight: isMe ? 2 : 0 }}>
                    {fmtTs(msg.ts)}
                  </div>
                )}
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden', background: '#fff' }}>
          <textarea
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Write a message… (Enter to send)"
            rows={2}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              padding: '9px 12px', fontSize: 13, color: '#111827',
              fontFamily: 'inherit', lineHeight: 1.5, background: 'transparent',
            }}
          />
          <button onClick={sendMessage} disabled={!chatInput.trim()} style={{
            padding: '0 14px', border: 'none', background: chatInput.trim() ? '#2563eb' : '#f3f4f6',
            color: chatInput.trim() ? '#fff' : '#9ca3af', cursor: chatInput.trim() ? 'pointer' : 'default',
            fontSize: 13, fontWeight: 600, transition: 'all 0.15s', flexShrink: 0,
          }}>
            Send
          </button>
        </div>
      </div>

      {/* Attachments */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Attachments {attachments.length > 0 && `(${attachments.length})`}
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false) }}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
          style={{
            border: `1.5px ${dragging ? 'solid #2563eb' : 'dashed #d1d5db'}`,
            background: dragging ? '#eff6ff' : '#fafafa',
            borderRadius: 10, padding: '12px', cursor: 'pointer', textAlign: 'center',
            marginBottom: attachments.length ? 10 : 0, transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { if (!dragging) { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.borderStyle = 'solid' } }}
          onMouseLeave={e => { if (!dragging) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.borderStyle = 'dashed' } }}
        >
          <span style={{ fontSize: 13, color: '#9ca3af' }}>
            {uploading ? '⏳ Uploading…' : '📎 Click or drag & drop files'}
          </span>
        </div>

        {/* Image thumbnails grid */}
        {attachments.filter(a => isImage(a.file_type)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {attachments.filter(a => isImage(a.file_type)).map(att => (
              <div key={att.id} style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={att.url}
                  alt={att.file_name}
                  onClick={() => att.url && setPreview({ url: att.url, type: att.file_type, name: att.file_name })}
                  style={{
                    width: 72, height: 72, objectFit: 'cover', borderRadius: 8,
                    border: '1px solid #e5e7eb', cursor: 'pointer', display: 'block',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                />
                <button
                  onClick={e => { e.stopPropagation(); removeAttachment(att) }}
                  style={{
                    position: 'absolute', top: -5, right: -5, width: 18, height: 18,
                    borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff',
                    fontSize: 11, lineHeight: '18px', textAlign: 'center', cursor: 'pointer', padding: 0,
                  }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        {/* Non-image files (PDF + others) */}
        {attachments.filter(a => !isImage(a.file_type)).map(att => (
          <div key={att.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 4,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>{fileIcon(att.file_type)}</span>
            <span style={{ flex: 1, fontSize: 13, color: '#111827', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {att.file_name}
            </span>
            <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{fmtSize(att.file_size)}</span>
            {isPdf(att.file_type) && att.url && (
              <button onClick={() => setPreview({ url: att.url, type: att.file_type, name: att.file_name })} style={{
                border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, padding: '3px 8px',
                fontSize: 12, cursor: 'pointer', color: '#374151', flexShrink: 0,
              }}>View</button>
            )}
            {att.url && (
              <a href={att.url} download={att.file_name} style={{ flexShrink: 0, color: '#9ca3af', fontSize: 13, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                title="Download"
              >↓</a>
            )}
            <button onClick={() => removeAttachment(att)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 16, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
            >×</button>
          </div>
        ))}
      </div>

      {/* Preview lightbox */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '92vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', background: '#1f2937' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#111827' }}>
              <span style={{ fontSize: 13, color: '#d1d5db', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{preview.name}</span>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <a href={preview.url} download={preview.name} style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'none', padding: '4px 8px', border: '1px solid #374151', borderRadius: 6 }}>↓ Download</a>
                <button onClick={() => setPreview(null)} style={{ border: 'none', background: '#374151', color: '#fff', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 16, lineHeight: '28px', padding: 0 }}>×</button>
              </div>
            </div>
            {/* Content */}
            {isImage(preview.type) ? (
              <img src={preview.url} alt={preview.name} style={{ maxWidth: '88vw', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
            ) : isPdf(preview.type) ? (
              <iframe src={preview.url} title={preview.name} style={{ width: '80vw', height: '80vh', border: 'none', display: 'block' }} />
            ) : null}
          </div>
        </div>
      )}

    </div>
  )
}

// ── Credential Detail ─────────────────────────────────────────────────────────
const CRED_COLS = [
  { key: 'title',        label: 'Title',        width: 130 },
  { key: 'login',        label: 'Login',        width: 160 },
  { key: 'password',     label: 'Password',     width: 150, secret: true },
  { key: 'phone',        label: 'Phone',        width: 130 },
  { key: 'purpose',      label: 'Purpose',      width: 150 },
  { key: 'subscription', label: 'Subscription', width: 130 },
  { key: 'card',         label: 'Card',         width: 150 },
  { key: 'notes',        label: 'Notes',        width: 200 },
]

function CredCell({ col, value, onChange }) {
  const [showSecret, setShowSecret] = useState(false)
  const copy = () => navigator.clipboard.writeText(value || '')
  const [hov, setHov] = useState(false)

  return (
    <td style={{ padding: 0, borderRight: '1px solid #f0f0f0', position: 'relative' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', height: 38 }}>
        <input
          type={col.secret && !showSecret ? 'password' : 'text'}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12.5, color: '#111827', outline: 'none', fontFamily: 'inherit', minWidth: 0, width: '100%' }}
        />
        {hov && value && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0, marginLeft: 2 }}>
            {col.secret && (
              <button onClick={() => setShowSecret(s => !s)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 3px', color: '#d1d5db', lineHeight: 1 }}
                onMouseEnter={e => e.currentTarget.style.color = '#6b7280'}
                onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d={showSecret ? 'M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4Z' : 'M1 1l12 12M6 3.1A6 6 0 0 1 7 3c4 0 6 4 6 4a10.6 10.6 0 0 1-1.7 2.3M4.1 4.1A6 6 0 0 0 1 7s2 4 6 4a6 6 0 0 0 2.9-.8'} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>{showSecret && <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.3"/>}</svg>
              </button>
            )}
            <button onClick={copy} title="Copy" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 3px', color: '#d1d5db', lineHeight: 1 }}
              onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
              onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M9 4V2.5A1.5 1.5 0 0 0 7.5 1h-5A1.5 1.5 0 0 0 1 2.5v5A1.5 1.5 0 0 0 2.5 9H4" stroke="currentColor" strokeWidth="1.2"/></svg>
            </button>
          </div>
        )}
      </div>
    </td>
  )
}

function CredentialDetail({ item, onUpdate, onBack }) {
  const rows = Array.isArray(item.credential_data) ? item.credential_data : (item.credential_data ? [item.credential_data] : [])
  const [data, setData] = useState(rows)

  const commit = (next) => {
    setData(next)
    onUpdate({ credential_data: next })
  }

  const updateCell = (rowIdx, key, value) => {
    const next = data.map((r, i) => i === rowIdx ? { ...r, [key]: value } : r)
    commit(next)
  }

  const addRow = () => commit([...data, {}])

  const deleteRow = (idx) => commit(data.filter((_, i) => i !== idx))

  return (
    <div>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px 6px 8px', marginBottom: 20, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11 7A4 4 0 1 0 3 7a4 4 0 0 0 8 0ZM7 10v5M5 13h4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{item.label}</h2>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{data.length} {data.length === 1 ? 'entry' : 'entries'}</span>
          </div>
        </div>
        <button onClick={addRow} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#7c3aed', fontFamily: 'inherit' }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Add entry
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: CRED_COLS.reduce((s, c) => s + c.width, 0) + 40 }}>
          <colgroup>
            {CRED_COLS.map(c => <col key={c.key} style={{ width: c.width }} />)}
            <col style={{ width: 40 }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {CRED_COLS.map(c => (
                <th key={c.key} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.04em', textTransform: 'uppercase', borderRight: '1px solid #f0f0f0' }}>
                  {c.label}
                </th>
              ))}
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={CRED_COLS.length + 1} style={{ padding: '24px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
                  No entries yet — click "Add entry" to start
                </td>
              </tr>
            )}
            {data.map((row, rowIdx) => (
              <CredRow key={rowIdx} row={row} rowIdx={rowIdx} onUpdateCell={updateCell} onDelete={deleteRow} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CredRow({ row, rowIdx, onUpdateCell, onDelete }) {
  const [hov, setHov] = useState(false)
  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6', background: hov ? '#fafbff' : '#fff', transition: 'background 0.1s' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {CRED_COLS.map(col => (
        <CredCell key={col.key} col={col} value={row[col.key]} onChange={val => onUpdateCell(rowIdx, col.key, val)} />
      ))}
      <td style={{ width: 40, textAlign: 'center' }}>
        <button onClick={() => onDelete(rowIdx)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e5e7eb', padding: '4px 6px', lineHeight: 1, opacity: hov ? 1 : 0, transition: 'opacity 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#e5e7eb'}>
          <svg width="12" height="12" viewBox="0 0 11 11" fill="none"><path d="M2 2.5h7M4.5 2.5V2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v.5M4 9.5h3a1 1 0 0 0 1-1V4H3v4.5a1 1 0 0 0 1 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </td>
    </tr>
  )
}

// ── RowContextMenu ────────────────────────────────────────────────────────────
function RowContextMenu({ onRename, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const toggle = (e) => {
    e.stopPropagation()
    if (!open) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.right - 140 })
    }
    setOpen(o => !o)
  }

  const pick = (fn) => { setOpen(false); fn() }

  return (
    <>
      <button ref={btnRef} onClick={toggle} style={{ border: 'none', background: 'none', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, color: '#9ca3af', padding: 0 }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ca3af' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="3" r="1.1" fill="currentColor"/><circle cx="7" cy="7" r="1.1" fill="currentColor"/><circle cx="7" cy="11" r="1.1" fill="currentColor"/></svg>
      </button>
      {open && (
        <div ref={menuRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', overflow: 'hidden', width: 140 }}>
          {[
            { label: 'Rename', icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2L11 4L5 10H3V8L9 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>, action: () => pick(onRename) },
            onDuplicate ? { label: 'Duplicate', icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M9 4V2.5A1.5 1.5 0 0 0 7.5 1h-5A1.5 1.5 0 0 0 1 2.5v5A1.5 1.5 0 0 0 2.5 9H4" stroke="currentColor" strokeWidth="1.2"/></svg>, action: () => pick(onDuplicate) } : null,
            onDelete ? { label: 'Delete', icon: <svg width="13" height="13" viewBox="0 0 11 11" fill="none"><path d="M2 2.5h7M4.5 2.5V2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v.5M4 9.5h3a1 1 0 0 0 1-1V4H3v4.5a1 1 0 0 0 1 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>, danger: true, action: () => pick(onDelete) } : null,
          ].filter(Boolean).map(item => (
            <div key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: item.danger ? '#ef4444' : '#374151', background: '#fff' }}
              onMouseEnter={e => { e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f9fafb' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
              <span style={{ color: item.danger ? '#ef4444' : '#9ca3af', display: 'flex' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ── GroupSection ──────────────────────────────────────────────────────────────
function GroupSection({ group, items, subitems, onUpdateGroup, onDeleteGroup, onAddItem, onUpdateItem, onDeleteItem, onDuplicateItem, onAddSubitem, onUpdateSubitem, onDeleteSubitem, onDuplicateSubitem, onOpenDetail, draggingItemId, onDragStart, onDragEnd, onDropItem }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameDraft, setRenameDraft] = useState(group.label)
  const renameRef = useRef(null)

  useEffect(() => { setRenameDraft(group.label) }, [group.label])
  useEffect(() => { if (renaming) setTimeout(() => renameRef.current?.focus(), 0) }, [renaming])

  const handleDragOver = (e) => { e.preventDefault(); if (draggingItemId) setIsDragOver(true) }
  const handleDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false) }
  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); if (draggingItemId) onDropItem(draggingItemId) }

  const commitRename = () => {
    const v = renameDraft.trim()
    if (v && v !== group.label) onUpdateGroup({ label: v })
    setRenaming(false)
  }

  const c = group.color

  return (
    <div style={{ marginBottom: 8, borderRadius: 10, border: `1px solid ${isDragOver ? c : '#ebebeb'}`, transition: 'border-color 0.15s, background 0.15s', background: isDragOver ? `${c}08` : '#fff', overflow: 'hidden' }}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
    >
      {/* Header */}
      <div onClick={() => setCollapsed(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: `${c}10`, borderBottom: collapsed ? 'none' : `1px solid ${c}20`, cursor: 'pointer', userSelect: 'none' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.15s', color: '#9ca3af', flexShrink: 0 }}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }} />
        {renaming ? (
          <input ref={renameRef} value={renameDraft} onChange={e => setRenameDraft(e.target.value)}
            onBlur={commitRename}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setRenameDraft(group.label); setRenaming(false) } }}
            style={{ flex: 1, fontSize: 13, fontWeight: 700, color: c, border: 'none', borderBottom: `1.5px solid ${c}`, outline: 'none', background: 'transparent', fontFamily: 'inherit', padding: '1px 0' }}
          />
        ) : (
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: c }}>{group.label}</span>
        )}
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{items.length}</span>
        <button onClick={e => { e.stopPropagation(); setAdding(true) }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', border: `1px solid ${c}40`, borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: 12, color: c, fontFamily: 'inherit', fontWeight: 500 }}
          onMouseEnter={e => { e.currentTarget.style.background = `${c}15` }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Add item
        </button>
        <div onClick={e => e.stopPropagation()}>
          <RowContextMenu
            onRename={() => setRenaming(true)}
            onDuplicate={null}
            onDelete={onDeleteGroup}
          />
        </div>
      </div>

      {/* Items */}
      {!collapsed && (
        <div style={{ padding: '4px 0' }}>
          {items.length === 0 && !adding && (
            <div style={{ padding: '12px 20px', fontSize: 12, color: '#d1d5db', fontStyle: 'italic' }}>
              Drop items here or click Add item
            </div>
          )}
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              subitems={subitems.filter(s => s.item_id === item.id)}
              onUpdate={patch => onUpdateItem(item.id, patch)}
              onDelete={() => onDeleteItem(item.id)}
              onDuplicate={() => onDuplicateItem(item)}
              onAddSubitem={label => onAddSubitem(item.id, label)}
              onUpdateSubitem={(subId, patch) => onUpdateSubitem(subId, patch)}
              onDeleteSubitem={subId => onDeleteSubitem(subId)}
              onDuplicateSubitem={sub => onDuplicateSubitem(sub)}
              onOpenDetail={onOpenDetail}
              isDragging={draggingItemId === item.id}
              onDragStart={() => onDragStart(item.id)}
              onDragEnd={onDragEnd}
            />
          ))}
          {adding && (
            <div style={{ padding: '2px 12px' }}>
              <AddingRow placeholder="New item…" onConfirm={label => { onAddItem(label); setAdding(false) }} onCancel={() => setAdding(false)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── AddingRow ──────────────────────────────────────────────────────────────────
function AddingRow({ placeholder, onConfirm, onCancel, indent = 0 }) {
  const [val, setVal] = useState('')
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  const commit = () => { const t = val.trim(); if (t) onConfirm(t); else onCancel() }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: `6px 12px 6px ${12 + indent}px` }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }} />
      <input ref={ref} value={val} onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') onCancel() }}
        placeholder={placeholder}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#111827', fontFamily: 'inherit', borderBottom: '1px dashed #d1d5db', padding: '2px 0' }}
      />
      <button onMouseDown={e => e.preventDefault()} onClick={onCancel} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af', padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
    </div>
  )
}

// ── ItemRow ────────────────────────────────────────────────────────────────────
function ItemRow({ item, subitems, onUpdate, onDelete, onDuplicate, onAddSubitem, onUpdateSubitem, onDeleteSubitem, onDuplicateSubitem, onOpenDetail, isCredentials, isDragging, onDragStart, onDragEnd }) {
  const [expanded, setExpanded] = useState(subitems.length > 0)
  const [addingSub, setAddingSub] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const [renaming, setRenaming] = useState(false)
  const [renamingSubId, setRenamingSubId] = useState(null)
  const [renameDraft, setRenameDraft] = useState('')
  const renameRef = useRef(null)

  useEffect(() => { if (renaming) { setRenameDraft(item.label); setTimeout(() => renameRef.current?.focus(), 0) } }, [renaming])
  useEffect(() => { if (renamingSubId) setTimeout(() => renameRef.current?.focus(), 0) }, [renamingSubId])

  const commitRename = () => {
    const v = renameDraft.trim()
    if (v && v !== item.label) onUpdate({ label: v })
    setRenaming(false)
  }
  const commitSubRename = (sub) => {
    const v = renameDraft.trim()
    if (v && v !== sub.label) onUpdateSubitem(sub.id, { label: v })
    setRenamingSubId(null)
  }

  const approved = item.status === 'approved'
  const conf = statusConf(item.status)
  const credLogin = item.credential_data?.login

  return (
    <div style={{ borderRadius: 8 }}>
      {/* Item row */}
      <div
        draggable={!!onDragStart}
        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart?.() }}
        onDragEnd={onDragEnd}
        onClick={() => onOpenDetail(item.id, 'item', item.label, item.status, item.due_date, item.notes, item)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8, cursor: isDragging ? 'grabbing' : 'pointer', transition: 'background 0.1s, opacity 0.15s', opacity: isDragging ? 0.4 : 1 }}
        onMouseEnter={e => { setHoveredId(item.id); if (!isDragging) e.currentTarget.style.background = '#f8faff' }}
        onMouseLeave={e => { setHoveredId(null); e.currentTarget.style.background = 'transparent' }}
      >
        {/* Drag handle */}
        {onDragStart && (
          <div style={{ color: hoveredId === item.id ? '#d1d5db' : 'transparent', cursor: 'grab', flexShrink: 0, lineHeight: 1, transition: 'color 0.1s' }}>
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
              <circle cx="3" cy="2.5" r="1.2"/><circle cx="7" cy="2.5" r="1.2"/>
              <circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/>
              <circle cx="3" cy="11.5" r="1.2"/><circle cx="7" cy="11.5" r="1.2"/>
            </svg>
          </div>
        )}

        {/* Expand toggle — hidden for credentials */}
        {!isCredentials && (
          <button onClick={e => { e.stopPropagation(); setExpanded(v => !v) }} style={{
            width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'none', cursor: subitems.length > 0 ? 'pointer' : 'default', padding: 0,
            opacity: subitems.length > 0 ? 1 : 0.2,
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
              style={{ transform: expanded && subitems.length > 0 ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Icon for credentials / status dot for tasks */}
        {isCredentials ? (
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M11 7A4 4 0 1 0 3 7a4 4 0 0 0 8 0ZM7 10v5M5 13h4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
        ) : (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: conf.color, flexShrink: 0 }} />
        )}

        {/* Label / rename input */}
        {renaming ? (
          <input ref={renameRef} value={renameDraft} onChange={e => setRenameDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false) }}
            onClick={e => e.stopPropagation()}
            style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#111827', border: 'none', borderBottom: '2px solid #93c5fd', outline: 'none', background: 'transparent', fontFamily: 'inherit', padding: '1px 0' }}
          />
        ) : (
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: approved ? '#9ca3af' : '#111827', textDecoration: approved ? 'line-through' : 'none' }}>
            {item.label}
          </span>
        )}

        {/* Login preview for credentials */}
        {isCredentials && credLogin && !renaming && (
          <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace', flexShrink: 0, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {credLogin}
          </span>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {item.due_date && <DaysChip dueDate={item.due_date} />}
          <div style={{ opacity: !!item.assignee || hoveredId === item.id ? 1 : 0, pointerEvents: !!item.assignee || hoveredId === item.id ? 'auto' : 'none' }}>
            <AssigneeButton name={item.assignee} onChange={a => onUpdate({ assignee: a })} small />
          </div>
          <div style={{ opacity: hoveredId === item.id ? 1 : 0, pointerEvents: hoveredId === item.id ? 'auto' : 'none' }}>
            <RowContextMenu
              onRename={() => setRenaming(true)}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>

      {/* Subitems — hidden for credentials milestone */}
      {!isCredentials && expanded && (
        <div style={{ marginLeft: 28 }}>
          {subitems.map(sub => {
            const subConf = statusConf(sub.status)
            const subApproved = sub.status === 'approved'
            return (
              <div key={sub.id}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 4px', borderRadius: 6, cursor: 'pointer' }}
                onMouseEnter={() => setHoveredId(sub.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onOpenDetail(sub.id, 'subitem', sub.label, sub.status, sub.due_date, sub.notes)}
              >
                <div style={{ width: 6, height: 1, background: '#e5e7eb', flexShrink: 0 }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: subConf.color, flexShrink: 0 }} />
                {renamingSubId === sub.id ? (
                  <input ref={renameRef} value={renameDraft} onChange={e => setRenameDraft(e.target.value)}
                    onBlur={() => commitSubRename(sub)}
                    onKeyDown={e => { if (e.key === 'Enter') commitSubRename(sub); if (e.key === 'Escape') setRenamingSubId(null) }}
                    onClick={e => e.stopPropagation()}
                    style={{ flex: 1, fontSize: 12.5, color: '#374151', border: 'none', borderBottom: '2px solid #93c5fd', outline: 'none', background: 'transparent', fontFamily: 'inherit', padding: '1px 0' }}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: 12.5, color: subApproved ? '#9ca3af' : '#374151', textDecoration: subApproved ? 'line-through' : 'none' }}>
                    {sub.label}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  {sub.due_date && <DaysChip dueDate={sub.due_date} />}
                  <div style={{ opacity: !!sub.assignee || hoveredId === sub.id ? 1 : 0, pointerEvents: !!sub.assignee || hoveredId === sub.id ? 'auto' : 'none' }}>
                    <AssigneeButton name={sub.assignee} onChange={a => onUpdateSubitem(sub.id, { assignee: a })} small />
                  </div>
                  <div style={{ opacity: hoveredId === sub.id ? 1 : 0, pointerEvents: hoveredId === sub.id ? 'auto' : 'none' }}>
                    <RowContextMenu
                      onRename={() => { setRenamingSubId(sub.id); setRenameDraft(sub.label) }}
                      onDuplicate={() => onDuplicateSubitem(sub)}
                      onDelete={() => onDeleteSubitem(sub.id)}
                    />
                  </div>
                </div>
              </div>
            )
          })}

          {addingSub ? (
            <AddingRow placeholder="Add subitem…" onConfirm={label => { onAddSubitem(label); setAddingSub(false) }} onCancel={() => setAddingSub(false)} indent={4} />
          ) : (
            <button onClick={() => setAddingSub(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 4px 4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#9ca3af', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#6b7280' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Add subitem
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProcessView({ projectName }) {
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [groups, setGroups] = useState([])
  const [items, setItems] = useState([])
  const [subitems, setSubitems] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [addingItem, setAddingItem] = useState(false)
  const [addingMilestone, setAddingMilestone] = useState(false)
  const [renamingMilestone, setRenamingMilestone] = useState(false)
  const [milestoneLabelDraft, setMilestoneLabelDraft] = useState('')
  const milestoneRenameRef = useRef(null)
  const [draggingItemId, setDraggingItemId] = useState(null)
  const [detail, setDetail] = useState(null)

  useEffect(() => { load() }, [projectName])

  const load = async () => {
    setLoading(true)
    setActiveIdx(0)
    setDetail(null)
    const query = supabase.from('projects').select('*')
    const { data: proj } = projectName
      ? await query.eq('name', projectName).limit(1).single()
      : await query.limit(1).single()
    const { data: ms }  = await supabase.from('milestones').select('*').eq('project_id', proj?.id).order('ord')
    const { data: grps } = await supabase.from('groups').select('*').order('ord')
    const { data: its } = await supabase.from('items').select('*').order('ord')
    const { data: subs } = await supabase.from('subitems').select('*').order('ord')
    setProject(proj)
    setMilestones(ms || [])
    setGroups(grps || [])
    setItems(its || [])
    setSubitems(subs || [])
    setLoading(false)
  }

  // Auto-init groups for non-credentials milestones
  useEffect(() => {
    const m = milestones[activeIdx]
    if (!m || m.type === 'credentials' || loading) return
    const hasGroups = groups.some(g => g.milestone_id === m.id)
    if (hasGroups) return
    const init = async () => {
      const { data } = await supabase.from('groups').insert(
        DEFAULT_GROUPS.map((d, i) => ({ milestone_id: m.id, label: d.label, color: d.color, ord: i }))
      ).select()
      if (data) setGroups(prev => [...prev, ...data])
    }
    init()
  }, [activeIdx, milestones.length, loading])

  const activeMilestone = milestones[activeIdx]
  const activeItems = items.filter(i => i.milestone_id === activeMilestone?.id)
  const allNodeIds = activeItems.flatMap(i => [i.id, ...subitems.filter(s => s.item_id === i.id).map(s => s.id)])
  const approvedCount = allNodeIds.filter(id => {
    const it = items.find(i => i.id === id)
    const sub = subitems.find(s => s.id === id)
    return (it?.status || sub?.status) === 'approved'
  }).length

  // ── Milestone mutations ───────────────────────────────────────────────────
  const addMilestone = async (label) => {
    const ord = milestones.length
    const { data } = await supabase.from('milestones').insert({ project_id: project.id, label, ord, weight: 1.5 }).select().single()
    if (data) { setMilestones(prev => [...prev, data]); setActiveIdx(milestones.length) }
    setAddingMilestone(false)
  }

  const updateMilestone = async (id, patch) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
    await supabase.from('milestones').update(patch).eq('id', id)
  }

  const deleteMilestone = async (id) => {
    setMilestones(prev => { const next = prev.filter(m => m.id !== id); setActiveIdx(i => Math.min(i, next.length - 1)); return next })
    await supabase.from('milestones').delete().eq('id', id)
  }

  // ── Group mutations ───────────────────────────────────────────────────────
  const addGroup = async () => {
    if (!activeMilestone) return
    const milestoneGroups = groups.filter(g => g.milestone_id === activeMilestone.id)
    const color = GROUP_COLORS[milestoneGroups.length % GROUP_COLORS.length]
    const { data } = await supabase.from('groups').insert({ milestone_id: activeMilestone.id, label: 'New Group', color, ord: milestoneGroups.length }).select().single()
    if (data) setGroups(prev => [...prev, data])
  }

  const updateGroup = async (id, patch) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g))
    await supabase.from('groups').update(patch).eq('id', id)
  }

  const deleteGroup = async (id) => {
    setGroups(prev => prev.filter(g => g.id !== id))
    await supabase.from('groups').delete().eq('id', id)
  }

  // ── Item mutations ────────────────────────────────────────────────────────
  const addItemToGroup = async (label, groupId) => {
    if (!activeMilestone) return
    const groupItems = items.filter(i => i.group_id === groupId)
    const { data } = await supabase.from('items').insert({ milestone_id: activeMilestone.id, group_id: groupId, label, ord: groupItems.length, status: 'pending' }).select().single()
    if (data) setItems(prev => [...prev, data])
  }

  const addItem = async (label) => {
    if (!activeMilestone) return
    const { data } = await supabase.from('items').insert({ milestone_id: activeMilestone.id, label, ord: activeItems.length, status: 'pending' }).select().single()
    if (data) setItems(prev => [...prev, data])
    setAddingItem(false)
  }

  const moveItemToGroup = async (itemId, groupId) => {
    const groupItems = items.filter(i => i.group_id === groupId)
    updateItem(itemId, { group_id: groupId, ord: groupItems.length })
  }

  const updateItem = async (id, patch) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
    await supabase.from('items').update(patch).eq('id', id)
    if (detail?.id === id) setDetail(prev => ({ ...prev, ...patch, status: patch.status || prev.status, dueDate: patch.due_date !== undefined ? patch.due_date : prev.dueDate, notes: patch.notes !== undefined ? patch.notes : prev.notes }))
  }

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('items').delete().eq('id', id)
  }

  const duplicateItem = async (item) => {
    const ord = activeItems.length
    const { id, created_at, ...rest } = item
    const { data } = await supabase.from('items').insert({ ...rest, label: item.label + ' (copy)', ord }).select().single()
    if (data) setItems(prev => [...prev, data])
  }

  // ── Subitem mutations ─────────────────────────────────────────────────────
  const addSubitem = async (itemId, label) => {
    const ord = subitems.filter(s => s.item_id === itemId).length
    const { data } = await supabase.from('subitems').insert({ item_id: itemId, label, ord, status: 'pending' }).select().single()
    if (data) setSubitems(prev => [...prev, data])
  }

  const updateSubitem = async (id, patch) => {
    setSubitems(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
    await supabase.from('subitems').update(patch).eq('id', id)
    if (detail?.id === id) setDetail(prev => ({ ...prev, ...patch, status: patch.status || prev.status, dueDate: patch.due_date !== undefined ? patch.due_date : prev.dueDate, notes: patch.notes !== undefined ? patch.notes : prev.notes }))
  }

  const deleteSubitem = async (id) => {
    setSubitems(prev => prev.filter(s => s.id !== id))
    await supabase.from('subitems').delete().eq('id', id)
  }

  const duplicateSubitem = async (sub) => {
    const ord = subitems.filter(s => s.item_id === sub.item_id).length
    const { id, created_at, ...rest } = sub
    const { data } = await supabase.from('subitems').insert({ ...rest, label: sub.label + ' (copy)', ord }).select().single()
    if (data) setSubitems(prev => [...prev, data])
  }

  const isCredentialsMilestone = activeMilestone?.type === 'credentials'

  const openDetail = (id, type, label, status, dueDate, notes, item) => {
    const groupId = type === 'item' ? item?.group_id : null
    setDetail({ id, type, label, status: status || 'pending', dueDate, notes, isCredential: isCredentialsMilestone && type === 'item', item, groupId })
  }

  const handleDetailUpdate = (patch) => {
    if (detail.type === 'item') updateItem(detail.id, patch)
    else updateSubitem(detail.id, patch)
    const next = { ...detail }
    if (patch.status) next.status = patch.status
    if (patch.due_date !== undefined) next.dueDate = patch.due_date
    if (patch.notes !== undefined) next.notes = patch.notes
    if (patch.credential_data !== undefined) next.item = { ...(next.item || {}), credential_data: patch.credential_data }
    if (patch.group_id !== undefined) next.groupId = patch.group_id
    setDetail(next)
  }

  if (loading) return (
    <div style={{ position: 'relative', flex: 1 }}>
      <BatmanLoader />
    </div>
  )

  if (detail) {
    if (detail.isCredential) return (
      <CredentialDetail
        item={{ ...detail.item, label: detail.label }}
        onUpdate={handleDetailUpdate}
        onBack={() => setDetail(null)}
      />
    )
    return (
      <DetailView
        nodeId={detail.id} nodeType={detail.type} label={detail.label}
        statusVal={detail.status} dueDate={detail.dueDate} notes={detail.notes}
        onUpdate={handleDetailUpdate}
        onBack={() => setDetail(null)}
        groups={detail.type === 'item' && !isCredentialsMilestone ? groups.filter(g => g.milestone_id === activeMilestone?.id) : null}
        groupId={detail.groupId}
      />
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>
          <InlineEdit value={project?.name || 'My Project'} onChange={v => { setProject(p => ({ ...p, name: v })); supabase.from('projects').update({ name: v }).eq('id', project.id) }} />
        </h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Track milestones, tasks and documents.</p>
      </div>

      <div style={{ height: 1, background: '#f0f0f0', marginBottom: 20 }} />

      {projectName === 'Credentials' ? (
        /* Credentials — no milestone bar, show items directly */
        activeMilestone && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeItems.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                subitems={subitems.filter(s => s.item_id === item.id)}
                onUpdate={patch => updateItem(item.id, patch)}
                onDelete={() => deleteItem(item.id)}
                onAddSubitem={label => addSubitem(item.id, label)}
                onUpdateSubitem={(subId, patch) => updateSubitem(subId, patch)}
                onDeleteSubitem={subId => deleteSubitem(subId)}
                onDuplicate={() => duplicateItem(item)}
                onDuplicateSubitem={sub => duplicateSubitem(sub)}
                onOpenDetail={openDetail}
                isCredentials
              />
            ))}
            {addingItem ? (
              <AddingRow placeholder="New credential…" onConfirm={addItem} onCancel={() => setAddingItem(false)} />
            ) : (
              <button onClick={() => setAddingItem(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', marginTop: 4, border: '1px dashed #e5e7eb', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, color: '#9ca3af', fontFamily: 'inherit', width: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Add credential
              </button>
            )}
          </div>
        )
      ) : milestones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🗂</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>No milestones yet</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Add the first milestone to start.</div>
          {addingMilestone ? (
            <AddingRow placeholder="Milestone name…" onConfirm={addMilestone} onCancel={() => setAddingMilestone(false)} />
          ) : (
            <button onClick={() => setAddingMilestone(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', border: '1px dashed #93c5fd', borderRadius: 8, background: '#eff6ff', cursor: 'pointer', fontSize: 13, color: '#2563eb', fontFamily: 'inherit' }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Add milestone
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Timeline bar — clickable, taller, with labels inside */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
            {milestones.map((m, i) => {
              const total = milestones.reduce((s, x) => s + (x.weight || 1.5), 0)
              const w = ((m.weight || 1.5) / total) * 100
              const done = i < activeIdx, active = i === activeIdx
              return (
                <div key={m.id}
                  onClick={() => setActiveIdx(i)}
                  style={{ width: `${w}%`, height: 36, borderRadius: 10, cursor: 'pointer', position: 'relative', overflow: 'hidden', flexShrink: 0, transition: 'opacity 0.15s', background: done ? '#2563eb' : active ? '#93c5fd' : '#e5e7eb' }}
                >
                  {/* Rename input or label */}
                  <MilestoneBarLabel
                    milestone={m}
                    active={active}
                    done={done}
                    onRename={v => updateMilestone(m.id, { label: v })}
                    onDelete={milestones.length > 1 ? () => deleteMilestone(m.id) : null}
                  />
                </div>
              )
            })}
            {/* Add milestone button */}
            {addingMilestone ? (
              <div style={{ display: 'flex', alignItems: 'center', minWidth: 140 }}>
                <AddingRow placeholder="Milestone name…" onConfirm={addMilestone} onCancel={() => setAddingMilestone(false)} />
              </div>
            ) : (
              <button onClick={() => setAddingMilestone(true)} title="Add milestone" style={{ width: 36, height: 36, border: '1.5px dashed #d1d5db', borderRadius: 10, background: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>

          <div style={{ height: 1, background: '#f0f0f0', marginBottom: 16 }} />

          {/* Items — grouped layout for tasks, flat for credentials */}
          {activeMilestone && isCredentialsMilestone && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeItems.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  subitems={subitems.filter(s => s.item_id === item.id)}
                  onUpdate={patch => updateItem(item.id, patch)}
                  onDelete={() => deleteItem(item.id)}
                  onAddSubitem={label => addSubitem(item.id, label)}
                  onUpdateSubitem={(subId, patch) => updateSubitem(subId, patch)}
                  onDeleteSubitem={subId => deleteSubitem(subId)}
                  onDuplicate={() => duplicateItem(item)}
                  onDuplicateSubitem={sub => duplicateSubitem(sub)}
                  onOpenDetail={openDetail}
                  isCredentials
                />
              ))}
              {addingItem ? (
                <AddingRow placeholder="New item…" onConfirm={addItem} onCancel={() => setAddingItem(false)} />
              ) : (
                <button onClick={() => setAddingItem(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', marginTop: 4, border: '1px dashed #e5e7eb', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, color: '#9ca3af', fontFamily: 'inherit', width: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af' }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Add item
                </button>
              )}
            </div>
          )}

          {activeMilestone && !isCredentialsMilestone && (() => {
            const milestoneGroups = groups.filter(g => g.milestone_id === activeMilestone.id).sort((a, b) => a.ord - b.ord)
            return (
              <div>
                {milestoneGroups.map(group => (
                  <GroupSection
                    key={group.id}
                    group={group}
                    items={activeItems.filter(i => i.group_id === group.id).sort((a, b) => a.ord - b.ord)}
                    subitems={subitems}
                    onUpdateGroup={patch => updateGroup(group.id, patch)}
                    onDeleteGroup={milestoneGroups.length > 1 ? () => deleteGroup(group.id) : null}
                    onAddItem={label => addItemToGroup(label, group.id)}
                    onUpdateItem={updateItem}
                    onDeleteItem={deleteItem}
                    onDuplicateItem={duplicateItem}
                    onAddSubitem={addSubitem}
                    onUpdateSubitem={updateSubitem}
                    onDeleteSubitem={deleteSubitem}
                    onDuplicateSubitem={duplicateSubitem}
                    onOpenDetail={openDetail}
                    draggingItemId={draggingItemId}
                    onDragStart={id => setDraggingItemId(id)}
                    onDragEnd={() => setDraggingItemId(null)}
                    onDropItem={itemId => moveItemToGroup(itemId, group.id)}
                  />
                ))}

                {/* Ungrouped items */}
                {activeItems.filter(i => !i.group_id).length > 0 && (
                  <div style={{ marginBottom: 8, padding: '8px 12px', background: '#fafafa', borderRadius: 10, border: '1px solid #ebebeb' }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Ungrouped</div>
                    {activeItems.filter(i => !i.group_id).map(item => (
                      <ItemRow key={item.id} item={item}
                        subitems={subitems.filter(s => s.item_id === item.id)}
                        onUpdate={patch => updateItem(item.id, patch)}
                        onDelete={() => deleteItem(item.id)}
                        onDuplicate={() => duplicateItem(item)}
                        onAddSubitem={label => addSubitem(item.id, label)}
                        onUpdateSubitem={(subId, patch) => updateSubitem(subId, patch)}
                        onDeleteSubitem={subId => deleteSubitem(subId)}
                        onDuplicateSubitem={sub => duplicateSubitem(sub)}
                        onOpenDetail={openDetail}
                        isDragging={draggingItemId === item.id}
                        onDragStart={() => setDraggingItemId(item.id)}
                        onDragEnd={() => setDraggingItemId(null)}
                      />
                    ))}
                  </div>
                )}

                <button onClick={addGroup} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', border: '1px dashed #d1d5db', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 12.5, color: '#9ca3af', fontFamily: 'inherit', marginTop: 4 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af' }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Add group
                </button>
              </div>
            )
          })()}
        </>
      )}
      {/* closes the projectName === 'Credentials' outer ternary */}
      <style>{`.ms-del { opacity: 0 !important } div:hover > .ms-del { opacity: 1 !important }`}</style>
    </div>
  )
}
