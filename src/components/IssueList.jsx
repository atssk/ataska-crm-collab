import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import IssueDetail from './IssueDetail'

const STATUSES = [
  { key: 'open',        label: 'Open',        color: '#3b82f6', bg: '#eff6ff' },
  { key: 'in_progress', label: 'In Progress',  color: '#d97706', bg: '#fffbeb' },
  { key: 'review',      label: 'Review',       color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'done',        label: 'Done',         color: '#059669', bg: '#ecfdf5' },
  { key: 'blocked',     label: 'Blocked',      color: '#ef4444', bg: '#fef2f2' },
]

const PRIORITIES = [
  { key: 'low',    label: 'Low',    color: '#9ca3af' },
  { key: 'medium', label: 'Medium', color: '#d97706' },
  { key: 'high',   label: 'High',   color: '#ef4444' },
]

const USERS = ['Batman', 'Robin']

function statusConf(key) {
  return STATUSES.find(s => s.key === key) || STATUSES[0]
}

function priorityConf(key) {
  return PRIORITIES.find(p => p.key === key) || PRIORITIES[1]
}

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
  const colors = ['#3b82f6', '#059669', '#d97706', '#7c3aed', '#0891b2']
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  const color = colors[Math.abs(h) % colors.length]
  const initials = name[0]?.toUpperCase() || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color, color: '#fff',
      fontSize: Math.round(size * 0.42), fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{initials}</div>
  )
}

function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const conf = statusConf(value)
  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 8px 3px 9px', background: conf.bg,
        border: `1.5px solid ${conf.color}`, borderRadius: 99,
        cursor: 'pointer', fontSize: 11, fontWeight: 600, color: conf.color,
      }}>
        {conf.label}
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke={conf.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden', minWidth: 140,
          }}>
            {STATUSES.map(s => (
              <div key={s.key} onClick={() => { onChange(s.key); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  cursor: 'pointer', fontSize: 13,
                  background: s.key === value ? s.bg : '#fff',
                  color: s.key === value ? s.color : '#374151',
                  fontWeight: s.key === value ? 600 : 400,
                }}
                onMouseEnter={e => { if (s.key !== value) e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { if (s.key !== value) e.currentTarget.style.background = '#fff' }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                {s.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function IssueList({ currentUser }) {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterAssignee, setFilterAssignee] = useState('all')

  useEffect(() => { loadIssues() }, [])

  const loadIssues = async () => {
    setLoading(true)
    const { data } = await supabase.from('issues').select('*').order('created_at', { ascending: false })
    setIssues(data || [])
    setLoading(false)
  }

  const createIssue = async () => {
    const title = newTitle.trim()
    if (!title) { setAdding(false); return }
    const { data } = await supabase.from('issues').insert({
      title, status: 'open', priority: 'medium', assignee: currentUser,
    }).select().single()
    if (data) {
      setIssues(prev => [data, ...prev])
      setSelectedId(data.id)
    }
    setNewTitle('')
    setAdding(false)
  }

  const updateIssue = async (id, patch) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
    await supabase.from('issues').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
  }

  const deleteIssue = async (id) => {
    setIssues(prev => prev.filter(i => i.id !== id))
    if (selectedId === id) setSelectedId(null)
    await supabase.from('issues').delete().eq('id', id)
  }

  const filtered = issues.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false
    if (filterAssignee !== 'all' && i.assignee !== filterAssignee) return false
    return true
  })

  const selectedIssue = issues.find(i => i.id === selectedId)

  if (selectedIssue) {
    return (
      <IssueDetail
        issue={selectedIssue}
        currentUser={currentUser}
        onUpdate={(patch) => updateIssue(selectedIssue.id, patch)}
        onDelete={() => deleteIssue(selectedIssue.id)}
        onBack={() => setSelectedId(null)}
        statuses={STATUSES}
        priorities={PRIORITIES}
        users={USERS}
      />
    )
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Issues</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{filtered.length} {filtered.length === 1 ? 'issue' : 'issues'}</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', background: '#111827', color: '#fff',
            border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1f2937' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#111827' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          New issue
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="all">All statuses</option>
          {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} style={selectStyle}>
          <option value="all">All assignees</option>
          {USERS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Add inline */}
      {adding && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: '#f8faff', border: '1px solid #dde6fb',
          borderRadius: 10, marginBottom: 8,
        }}>
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createIssue(); if (e.key === 'Escape') { setAdding(false); setNewTitle('') } }}
            placeholder="Issue title…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14, color: '#111827', fontFamily: 'inherit',
            }}
          />
          <button onMouseDown={e => e.preventDefault()} onClick={createIssue} style={{
            padding: '5px 12px', background: '#111827', color: '#fff',
            border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Add</button>
          <button onMouseDown={e => e.preventDefault()} onClick={() => { setAdding(false); setNewTitle('') }} style={{
            border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af', lineHeight: 1,
          }}>×</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14, color: '#9ca3af' }}>No issues yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(issue => {
            const pConf = priorityConf(issue.priority)
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedId(issue.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                  background: '#fff', border: '1px solid #f0f0f0',
                  transition: 'background 0.1s, border-color 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8faff'; e.currentTarget.style.borderColor = '#dde6fb' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#f0f0f0' }}
              >
                {/* Priority dot */}
                <div title={pConf.label} style={{
                  width: 8, height: 8, borderRadius: '50%', background: pConf.color, flexShrink: 0,
                }} />

                {/* Title */}
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#111827', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {issue.title}
                </span>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <DaysChip dueDate={issue.due_date} />
                  <StatusDropdown value={issue.status} onChange={val => updateIssue(issue.id, { status: val })} />
                  {issue.assignee && <AssigneeAvatar name={issue.assignee} size={24} />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const selectStyle = {
  padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8,
  fontSize: 12, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}
