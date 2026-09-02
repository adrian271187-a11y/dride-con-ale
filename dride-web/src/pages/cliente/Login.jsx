import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/services/firebase'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) navigate('/admin', { replace: true })
    })
    return unsub
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      navigate('/admin', { replace: true })
    } catch {
      setError('Credenciales incorrectas')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A2A1E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, background: '#0A2A1E', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M6 22L13 9L20 16L25 11L27 22H6Z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="25" cy="9" r="2" fill="#9FE1CB"/>
              <path d="M4 26h24" stroke="#9FE1CB" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0A2A1E', letterSpacing: '0.04em' }}>D'RIDE CON ALE</div>
            <div style={{ fontSize: 9, color: '#1D9E75', letterSpacing: '0.14em' }}>AGENCIA DE VIAJES</div>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0A2A1E', textAlign: 'center', marginBottom: 6 }}>Acceso administrador</h1>
        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 }}>Ingresa tus credenciales para continuar</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Correo electrónico</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="Drideale@drideconale.com"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E5E5E3', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••••••"
                style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: '1.5px solid #E5E5E3', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <div style={{ background: '#FCEBEB', border: '1px solid #F09595', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#A32D2D' }}>⚠️ {error}</div>}

          <button type="submit" disabled={loading}
            style={{ background: loading ? '#5DCAA5' : '#1D9E75', color: '#fff', border: 'none', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
            {loading ? 'Verificando...' : 'Ingresar al panel'}
          </button>
        </form>
        <p style={{ fontSize: 11, color: '#C0BDB8', textAlign: 'center', marginTop: 20 }}>D'RIDE CON ALE · Panel administrativo</p>
      </div>
    </div>
  )
}
