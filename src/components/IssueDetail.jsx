import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function fmtSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fileIcon(type = '') {
  if (type.startsWith('image/')) return '🖼'
  if (type === 'application/pdf') return '📄'
  return '📎'
}

export default function IssueDetail({ issue, currentUser, onUpdate, onDelete, onBack, statuses, priorities, users }) {
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(issue.title)
  const fileInputRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => { loadAttachments() }, [issue.id])
  useEffect(() => { setTitleDraft(issue.title) }, [issue.title])
  useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])

  const loadAttachments = async () => {
    const { data } = await supabase.from('attachments').select('*').eq('issue_id', issue.id).order('created_at')
    setAttachments(data || [])
  }

  const handleFiles = async (files) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      const path = `${issue.id}/${Date.now()}_${file.name}`
      const { error } = await supabase.storage.from('ataska-files').upload(path, file)
      if (!error) {
        const { data: inserted } = await supabase.from('attachments').insert({
          issue_id: issue.id,
          storage_path: path,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        }).select().single()
        if (inserted) setAttachments(prev => [...prev, inserted])
      }
    }
    setUploading(false)
  }

  const removeAttachment = async (att) => {
    await supabase.storage.from('ataska-files').remove([att.storage_path])
    await supabase.from('attachments').delete().eq('id', att.id)
    setAttachments(prev => prev.filter(a => a.id !== att.id))
  }

  const getUrl = (path) => {
    const { data } = supabase.storage.from('ataska-files').getPublicUrl(path)
    return data.publicUrl
  }

  const commitTitle = () => {
    setEditingTitle(false)
    const t = titleDraft.trim()
    if (t && t !== issue.title) onUpdate({ title: t })
    else setTitleDraft(issue.title)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Back */}
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

      {/* Title */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {editingTitle ? (
          <input
            ref={titleRef}
            value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(issue.title) } }}
            style={{
              flex: 1, fontSize: 20, fontWeight: 700, color: '#111827',
              border: 'none', borderBottom: '2px solid #93c5fd', outline: 'none',
              background: 'transparent', fontFamily: 'inherit', padding: '2px 0',
            }}
          />
        ) : (
          <h2
            onClick={() => setEditingTitle(true)}
            style={{ flex: 1, fontSize: 20, fontWeight: 700, color: '#111827', margin: 0, cursor: 'text', lineHeight: 1.35 }}
          >{issue.title}</h2>
        )}
      </div>

      {/* Meta fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {/* Status */}
        <MetaRow label="Status">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {statuses.map(s => (
              <button key={s.key} onClick={() => onUpdate({ status: s.key })} style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${issue.status === s.key ? s.color : '#e5e7eb'}`,
                background: issue.status === s.key ? s.bg : '#fff',
                color: issue.status === s.key ? s.color : '#9ca3af',
              }}>{s.label}</button>
            ))}
          </div>
        </MetaRow>

        {/* Priority */}
        <MetaRow label="Priority">
          <div style={{ display: 'flex', gap: 6 }}>
            {priorities.map(p => (
              <button key={p.key} onClick={() => onUpdate({ priority: p.key })} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${issue.priority === p.key ? p.color : '#e5e7eb'}`,
                background: issue.priority === p.key ? `${p.color}15` : '#fff',
                color: issue.priority === p.key ? p.color : '#9ca3af',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>
        </MetaRow>

        {/* Assignee */}
        <MetaRow label="Assignee">
          <div style={{ display: 'flex', gap: 6 }}>
            {users.map(u => (
              <button key={u} onClick={() => onUpdate({ assignee: u })} style={{
                padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${issue.assignee === u ? '#2563eb' : '#e5e7eb'}`,
                background: issue.assignee === u ? '#eff6ff' : '#fff',
                color: issue.assignee === u ? '#2563eb' : '#9ca3af',
              }}>{u}</button>
            ))}
          </div>
        </MetaRow>

        {/* Due date */}
        <MetaRow label="Due date">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="date"
              value={issue.due_date || ''}
              onChange={e => onUpdate({ due_date: e.target.value || null })}
              style={{
                border: '1px solid #e5e7eb', borderRadius: 7, padding: '4px 8px',
                fontSize: 13, color: '#111827', outline: 'none', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            />
            {issue.due_date && (
              <button onClick={() => onUpdate({ due_date: null })} style={{
                border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af', lineHeight: 1,
              }}>×</button>
            )}
          </div>
        </MetaRow>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Notes
        </div>
        <textarea
          value={issue.notes || ''}
          onChange={e => onUpdate({ notes: e.target.value })}
          placeholder="Add notes…"
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1px solid #e5e7eb', borderRadius: 9, padding: '10px 12px',
            fontSize: 13, color: '#111827', outline: 'none', resize: 'vertical',
            fontFamily: 'inherit', lineHeight: 1.6, background: '#fafafa',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#fff' }}
          onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fafafa' }}
        />
      </div>

      {/* Attachments */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Attachments {attachments.length > 0 && `(${attachments.length})`}
        </div>

        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }}
          onChange={e => { handleFiles(e.target.files); e.target.value = '' }} />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `1.5px ${dragging ? 'solid #2563eb' : 'dashed #d1d5db'}`,
            background: dragging ? '#eff6ff' : '#fafafa',
            borderRadius: 10, padding: '14px', cursor: 'pointer', textAlign: 'center',
            marginBottom: attachments.length ? 8 : 0,
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { if (!dragging) { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.borderStyle = 'solid' } }}
          onMouseLeave={e => { if (!dragging) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.borderStyle = 'dashed' } }}
        >
          {uploading
            ? <span style={{ fontSize: 13, color: '#9ca3af' }}>Uploading…</span>
            : <span style={{ fontSize: 13, color: '#9ca3af' }}>📎 Click or drag & drop files</span>
          }
        </div>

        {attachments.map(att => (
          <div key={att.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 8, marginBottom: 4,
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{fileIcon(att.file_type)}</span>
            <a href={getUrl(att.storage_path)} target="_blank" rel="noopener noreferrer" style={{
              flex: 1, fontSize: 13, color: '#111827', textDecoration: 'none', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#2563eb' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#111827' }}
            >{att.file_name}</a>
            <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{fmtSize(att.file_size || 0)}</span>
            <button onClick={() => removeAttachment(att)} style={{
              border: 'none', background: 'none', cursor: 'pointer',
              color: '#d1d5db', fontSize: 16, lineHeight: 1, padding: '0 2px', flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db' }}
            >×</button>
          </div>
        ))}
      </div>

      {/* Delete */}
      <div style={{ height: 1, background: '#f0f0f0', marginBottom: 16 }} />
      {confirmDelete ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Delete this issue?</span>
          <button onClick={onDelete} style={{
            padding: '5px 12px', background: '#ef4444', color: '#fff',
            border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Delete</button>
          <button onClick={() => setConfirmDelete(false)} style={{
            padding: '5px 12px', background: '#f3f4f6', color: '#374151',
            border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer',
          }}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setConfirmDelete(true)} style={{
          border: 'none', background: 'none', cursor: 'pointer',
          fontSize: 12, color: '#d1d5db', padding: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#d1d5db' }}
        >Delete issue</button>
      )}
    </div>
  )
}

function MetaRow({ label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '10px 14px', background: '#f9fafb', border: '1px solid #f0f0f0', borderRadius: 10,
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', width: 72, flexShrink: 0, paddingTop: 3 }}>{label}</span>
      {children}
    </div>
  )
}
