import { useRef, useEffect } from 'react'

export default function BatmanLoader() {
  const lRef = useRef(null)
  const rRef = useRef(null)
  const raf  = useRef(null)

  useEffect(() => {
    const CYCLE = 680
    let t0 = null

    const tick = (ts) => {
      if (!t0) t0 = ts
      const phase = ((ts - t0) % CYCLE) / CYCLE
      const s = Math.sin(phase * Math.PI * 2)
      const u = s * 14
      const m = s * 6

      if (lRef.current) lRef.current.setAttribute('d',
        `M43,40 C34,${36+m} 22,${32+m} 2,${24+u}` +
        ` C14,${38+m*0.4} 30,43 43,45 Z`
      )
      if (rRef.current) rRef.current.setAttribute('d',
        `M57,40 C66,${36+m} 78,${32+m} 98,${24+u}` +
        ` C86,${38+m*0.4} 70,43 57,45 Z`
      )

      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(243,244,246,0.82)',
      backdropFilter: 'blur(3px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <svg viewBox="0 0 100 64" width="96" height="62" style={{ overflow: 'visible' }}>
        <path ref={lRef} fill="#111827" />
        <path ref={rRef} fill="#111827" />
        {/* Body */}
        <ellipse cx="50" cy="42" rx="6.5" ry="8.5" fill="#111827" />
        {/* Head */}
        <ellipse cx="50" cy="30" rx="6" ry="5.5" fill="#111827" />
        {/* Ears */}
        <polygon points="45,26 43,15 49,24" fill="#111827" />
        <polygon points="55,26 57,15 51,24" fill="#111827" />
        {/* Eyes */}
        <circle cx="47.5" cy="30" r="1.3" fill="#FCD34D" opacity="0.95" />
        <circle cx="52.5" cy="30" r="1.3" fill="#FCD34D" opacity="0.95" />
        {/* Feet */}
        <line x1="46" y1="50" x2="44" y2="57" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="48" y1="50" x2="47" y2="58" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="52" y1="50" x2="53" y2="58" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="54" y1="50" x2="56" y2="57" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
