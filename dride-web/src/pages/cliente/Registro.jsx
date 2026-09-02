import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ nombre:'', email:'', password:'', telefono:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        rol: 'cliente',
        activo: true,
        creadoEn: serverTimestamp(),
      })
      navigate('/')
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Este correo ya está registrado' : 'Error al crear la cuenta')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0A2A1E', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'36px 28px', width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0A2A1E' }}>D'RIDE CON ALE</div>
          <div style={{ fontSize:9, color:'#1D9E75', letterSpacing:'0.14em' }}>AGENCIA DE VIAJES</div>
        </div>
        <h1 style={{ fontSize:18, fontWeight:700, color:'#0A2A1E', textAlign:'center', marginBottom:20 }}>Crear cuenta</h1>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[{l:'Nombre completo',k:'nombre',t:'text',p:'Tu nombre'},{l:'Correo electrónico',k:'email',t:'email',p:'correo@ejemplo.com'},{l:'Teléfono / WhatsApp',k:'telefono',t:'tel',p:'+502 5555-0000'},{l:'Contraseña',k:'password',t:'password',p:'Mínimo 6 caracteres'}].map(({l,k,t,p})=>(
            <div key={k}><label style={{fontSize:12,fontWeight:600,color:'#444',display:'block',marginBottom:4}}>{l}</label>
              <input type={t} required value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={p} style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #E5E5E3',fontSize:13,outline:'none',boxSizing:'border-box'}}/></div>
          ))}
          {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'9px 12px', borderRadius:8, fontSize:13 }}>⚠️ {error}</div>}
          <button type="submit" disabled={loading} style={{ background:loading?'#5DCAA5':'#1D9E75', color:'#fff', border:'none', padding:12, borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', marginTop:4 }}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>
        <p style={{ textAlign:'center', fontSize:13, color:'#888', marginTop:16 }}>¿Ya tienes cuenta? <Link to="/login" style={{ color:'#1D9E75', fontWeight:600 }}>Inicia sesión</Link></p>
      </div>
    </div>
  )
}
