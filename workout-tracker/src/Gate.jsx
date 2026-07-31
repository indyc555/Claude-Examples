import { useState } from 'react'

// Same shared passcode gates Iron Log, World Travel Tracker, and the Hindi app.
const GATE_SALT = 'personalapps_gate_salt_v1'
const GATE_HASH = 'f480f1208bc3846d96c8aa1d81e01f9ef080fc0a10fba6ff4270557da8135020'
const GATE_LS_KEY = 'personalapps_gate_ok'

async function hashGate(pw) {
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pw + GATE_SALT))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function gatePassed() {
  return localStorage.getItem(GATE_LS_KEY) === '1'
}

export default function Gate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    const hash = await hashGate(value)
    if (hash === GATE_HASH) {
      localStorage.setItem(GATE_LS_KEY, '1')
      onUnlock()
    } else {
      setError('Wrong passcode')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#15151f', padding: 20, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>🏋️ Iron Log</div>
      <div style={{ color: 'rgba(255,255,255,.6)', marginBottom: 22, fontSize: '.9rem' }}>Enter passcode to continue</div>
      <input
        type="password"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="Passcode"
        style={{
          width: '100%', maxWidth: 280, padding: '12px 14px', borderRadius: 10,
          border: '2px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)',
          color: '#fff', fontSize: '1rem', textAlign: 'center', marginBottom: 12,
        }}
      />
      <div style={{ color: '#e94560', fontSize: '.85rem', minHeight: '1.2em', marginBottom: 8 }}>{error}</div>
      <button
        onClick={submit}
        style={{
          width: '100%', maxWidth: 280, padding: 12, border: 'none', borderRadius: 10,
          background: '#e94560', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
        }}
      >
        Unlock
      </button>
    </div>
  )
}
