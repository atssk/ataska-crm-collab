import { useState, useRef, useEffect } from 'react'

const CATEGORIES = [
  {
    label: 'Work',
    icon: '💼',
    emojis: ['📋','✅','📊','📈','📉','💼','🗂','📁','📂','📌','🔖','📝','✏️','📎','🔗','📏','🗃','🗄','💡','🔍','🔎','📣','📢','🏷','📦','🚀','🎯','🏆','🥇','⭐','✨','💫','🔥'],
  },
  {
    label: 'Tech',
    icon: '💻',
    emojis: ['💻','🖥','🖱','⌨️','📱','💾','💿','🖨','🔌','🔋','📡','⚙️','🔧','🔨','🛠','⚡','🤖','🧠','🧬','🔬','🔭','📟','☎️','📞','🖲','🗜','💽','📲'],
  },
  {
    label: 'Security',
    icon: '🔑',
    emojis: ['🔑','🗝','🔐','🔒','🔓','🛡','⚔️','🔏','🪪','👁','🕵️','🧩','🪤','🔮','🎲','🃏','🀄'],
  },
  {
    label: 'Map & Nav',
    icon: '🗺',
    emojis: ['🗺','🌍','🌎','🌏','🏔','🗻','🏕','🌊','🏝','🌐','📍','📌','🧭','🛤','🛣','🏙','🌆','🌇','🌃','🌉','⛺','🚩','🏁','🎌','🚀','✈️','🛸','🚁'],
  },
  {
    label: 'People',
    icon: '👤',
    emojis: ['👤','👥','🧑‍💻','👨‍💼','👩‍💼','🧑‍🎨','👨‍🔬','🦸','🦄','🐦','🦅','🦁','🐯','🐻','🐼','🦊','🐺','🐝','🦋','🐙'],
  },
  {
    label: 'Symbols',
    icon: '🔴',
    emojis: ['⚡','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','♾','✅','❌','⭕','🔷','🔶','🔹','🔸','▶️','⏩','🔃','🔄','💤','🆕','🆓','🆙','🔝','🔛','🔜'],
  },
]

export default function EmojiPicker({ onSelect, onClose, anchorRect }) {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const ref = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.trim()
    ? CATEGORIES.flatMap(c => c.emojis).filter(e => {
        const q = query.toLowerCase()
        return e.includes(q)
      })
    : CATEGORIES[activeTab].emojis

  // Position: below the anchor, aligned left
  const top = anchorRect ? anchorRect.bottom + 8 : 100
  const left = anchorRect ? anchorRect.left : 60

  return (
    <div ref={ref} style={{
      position: 'fixed', top, left, zIndex: 2000,
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      width: 280, overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Search */}
      <div style={{ padding: '10px 10px 0' }}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search emoji…"
          style={{
            width: '100%', boxSizing: 'border-box',
            border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '7px 10px', fontSize: 13, outline: 'none',
            fontFamily: 'inherit', background: '#f9fafb',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#fff' }}
          onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb' }}
        />
      </div>

      {/* Category tabs */}
      {!query.trim() && (
        <div style={{ display: 'flex', padding: '8px 10px 0', gap: 2, borderBottom: '1px solid #f0f0f0' }}>
          {CATEGORIES.map((cat, i) => (
            <button key={cat.label} onClick={() => setActiveTab(i)} title={cat.label} style={{
              flex: 1, padding: '5px 0', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 16, borderRadius: '6px 6px 0 0',
              borderBottom: i === activeTab ? '2px solid #2563eb' : '2px solid transparent',
              opacity: i === activeTab ? 1 : 0.5,
              transition: 'opacity 0.1s',
            }}
              onMouseEnter={e => { if (i !== activeTab) e.currentTarget.style.opacity = '0.8' }}
              onMouseLeave={e => { if (i !== activeTab) e.currentTarget.style.opacity = '0.5' }}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 2, padding: 10, maxHeight: 200, overflowY: 'auto',
      }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '12px 0' }}>
            No results
          </div>
        )}
        {filtered.map((emoji, i) => (
          <button key={i} onClick={() => { onSelect(emoji); onClose() }} style={{
            width: '100%', aspectRatio: '1', border: 'none', background: 'none',
            cursor: 'pointer', fontSize: 20, borderRadius: 6, display: 'flex',
            alignItems: 'center', justifyContent: 'center', transition: 'background 0.1s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
