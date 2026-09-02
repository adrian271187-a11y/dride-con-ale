import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'

export default function MisReservas() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function cargar() {
      const user = auth.currentUser
      if (!user) { navigate('/login'); return }
      const snap = await getDocs(query(
        collection(db, 'reservas'),
        where('usuarioId', '==', user.uid),
        orderBy('creadaEn', 'desc')
      ))
      setReservas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    cargar()
  }, [])

  const badge = (e) => {
    const m = { confirmada:['#E1F5EE','#085041'], pendiente:['#FAEEDA','#633806'], cancelada:['#FCEBEB','#A32D2D'] }
    const [bg, color] = m[e] || ['#f0f0f0','#555']
    return <span style={{ background:bg, color, fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:600 }}>{e}</span>
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F6' }}>
      <div style={{ background:'#0A2A1E', padding:'20px 20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <button onClick={() => navigate('/')} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', padding:'5px 10px', borderRadius:7, cursor:'pointer', fontSize:12 }}>← Inicio</button>
        </div>
        <h1 style={{ color:'#fff', fontSize:20, fontWeight:700 }}>Mis reservas</h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>{reservas.length} reservas encontradas</p>
      </div>

      <div style={{ padding:20 }}>
        {loading ? <p style={{ color:'#888' }}>Cargando...</p> : reservas.length === 0
          ? (
            <div style={{ textAlign:'center', padding:60 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎫</div>
              <h3 style={{ color:'#0A2A1E', fontWeight:700, marginBottom:8 }}>Sin reservas aún</h3>
              <p style={{ color:'#888', fontSize:13, marginBottom:20 }}>Explora nuestros paquetes y reserva tu próximo viaje</p>
              <button onClick={() => navigate('/')} style={{ background:'#1D9E75', color:'#fff', border:'none', padding:'11px 24px', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}>Ver paquetes</button>
            </div>
          )
          : reservas.map(r => (
            <div key={r.id} onClick={() => navigate(`/confirmacion/${r.id}`)}
              style={{ background:'#fff', border:'1px solid #E5E5E3', borderRadius:12, marginBottom:12, overflow:'hidden', cursor:'pointer' }}>
              <div style={{ background:'#0A2A1E', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#9FE1CB', fontWeight:700, fontSize:12, letterSpacing:'0.06em' }}>{r.codigo || '—'}</span>
                {badge(r.estado)}
              </div>
              <div style={{ padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, color:'#0A2A1E', fontSize:14 }}>✈️ {r.paqueteId?.slice(0,16) || 'Paquete'}</div>
                  <div style={{ fontSize:12, color:'#888', marginTop:2 }}>👥 {r.numViajeros} viajero{r.numViajeros>1?'s':''} · {r.tipoHabitacion}</div>
                </div>
                <div style={{ fontWeight:700, color:'#1D9E75', fontSize:16 }}>${(r.totalPagar||0).toLocaleString()}</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
