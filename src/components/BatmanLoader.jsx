export default function BatmanLoader() {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(243,244,246,0.82)',
      backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Scoped keyframes (project uses inline styles only) */}
      <style>{`
        @keyframes batSpin   { to { transform: rotate(360deg) } }
        @keyframes batPulse  {
          0%, 100% { opacity: 1;    transform: scale(1)    }
          50%      { opacity: 0.45; transform: scale(0.88) }
        }
      `}</style>

      <div style={{
        position: 'relative', width: 72, height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Spinner ring running around the logo */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '3px solid rgba(17,24,39,0.10)',
          borderTopColor: '#F59E0B',
          animation: 'batSpin 0.8s linear infinite',
        }} />

        {/* Logo from Header — bat, with shimmer */}
        <span style={{
          fontSize: 30, lineHeight: 1,
          animation: 'batPulse 1.4s ease-in-out infinite',
        }}>🦇</span>
      </div>
    </div>
  )
}
