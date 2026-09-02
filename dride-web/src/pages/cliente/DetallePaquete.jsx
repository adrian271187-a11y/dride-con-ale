import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'

export default function DetallePaquete() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paquete, setPaquete] = useState(null)
  const [fechas, setFechas]   = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ fechaId:'', numViajeros:1, tipoHabitacion:'Doble estándar', ciudadSalida:'', atencionEspecial:false })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    async function cargar() {
      const [pkgSnap, fechasSnap] = await Promise.all([
        getDoc(doc(db, 'paquetes', id)),
        getDocs(query(collection(db, 'fechas_paquete'), where('pkgId', '==', id), where('disponible', '==', true))),
      ])
      if (pkgSnap.exists()) setPaquete({ id: pkgSnap.id, ...pkgSnap.data() })
      setFechas(fechasSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    cargar()
  }, [id])

  const total = (paquete?.precioPorPersona || 0) * form.numViajeros

  const reservar = async (e) => {
    e.preventDefault()
    setError('')
    const user = auth.currentUser
    if (!user) { navigate('/login'); return }
    if (!form.fechaId) { setError('Selecciona una fecha de salida'); return }
    setSaving(true)
    try {
      const codigo = `RES-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
      const ref = await addDoc(collection(db, 'reservas'), {
        usuarioId: user.uid,
        paqueteId: id,
        fechaId: form.fechaId,
        numViajeros: form.numViajeros,
        tipoHabitacion: form.tipoHabitacion,
        ciudadSalida: form.ciudadSalida,
        atencionEspecial: form.atencionEspecial,
        totalPagar: total,
        estado: 'pendiente',
        codigo,
        creadaEn: serverTimestamp(),
      })
      navigate(`/confirmacion/${ref.id}`)
    } catch { setError('Error al crear la reserva') }
    setSaving(false)
  }

  if (loading) return <div style={{ padding:40, color:'#888' }}>Cargando...</div>
  if (!paquete) return <div style={{ padding:40, color:'#888' }}>Paquete no encontrado.</div>

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F6' }}>
      <div style={{ background:'#0A2A1E', padding:'16px 20px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => navigate(-1)} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontSize:13 }}>← Volver</button>
        <span style={{ color:'#fff', fontWeight:600, fontSize:14 }}>Detalle del paquete</span>
      </div>

      <div style={{ background:'#0A2A1E', padding:'24px 20px', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>✈️</div>
        <h1 style={{ color:'#fff', fontSize:20, fontWeight:700, marginBottom:4 }}>{paquete.nombre}</h1>
        <p style={{ color:'#5DCAA5', fontSize:13 }}>📍 {paquete.destino}, {paquete.pais}</p>
      </div>

      <div style={{ padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, background:'#F8F8F6' }}>
        {[{l:'Duración',v:`${paquete.duracionDias} días`},{l:'Cupos',v:`${paquete.cuposDisponibles}/${paquete.cupoMaximo}`},{l:'Precio/persona',v:`$${(paquete.precioPorPersona||0).toLocaleString()}`},{l:'Estado',v:paquete.estado}].map(({l,v})=>(
          <div key={l} style={{ background:'#fff', border:'1px solid #E5E5E3', borderRadius:10, padding:12 }}>
            <div style={{ fontSize:11, color:'#888', marginBottom:2 }}>{l}</div>
            <div style={{ fontWeight:700, color:'#0A2A1E' }}>{v}</div>
          </div>
        ))}
      </div>

      {paquete.incluye?.length > 0 && (
        <div style={{ margin:'0 20px 16px', background:'#fff', border:'1px solid #E5E5E3', borderRadius:12, padding:16 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:'#0A2A1E', marginBottom:10 }}>Incluye</h3>
          {paquete.incluye.map(item => <div key={item} style={{ fontSize:13, color:'#555', padding:'4px 0', borderBottom:'1px solid #F5F5F5' }}>✅ {item}</div>)}
        </div>
      )}

      <form onSubmit={reservar} style={{ margin:'0 20px 40px', background:'#fff', border:'1px solid #E5E5E3', borderRadius:12, padding:20 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#0A2A1E', marginBottom:16 }}>Reservar</h3>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Fecha de salida</label>
          <select required value={form.fechaId} onChange={e=>setForm(p=>({...p,fechaId:e.target.value}))} style={{ width:'100%', padding:'9px 11px', borderRadius:8, border:'1.5px solid #E5E5E3', fontSize:13 }}>
            <option value="">Seleccionar fecha...</option>
            {fechas.map(f => <option key={f.id} value={f.id}>{f.fechaSalida} → {f.fechaRegreso} ({f.cuposRestantes} cupos)</option>)}
          </select>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Número de viajeros</label>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button type="button" onClick={()=>setForm(p=>({...p,numViajeros:Math.max(1,p.numViajeros-1)}))} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #E5E5E3', background:'#fff', fontSize:18, cursor:'pointer' }}>−</button>
            <span style={{ fontWeight:700, fontSize:16 }}>{form.numViajeros}</span>
            <button type="button" onClick={()=>setForm(p=>({...p,numViajeros:p.numViajeros+1}))} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #E5E5E3', background:'#fff', fontSize:18, cursor:'pointer' }}>+</button>
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Tipo de habitación</label>
          <select value={form.tipoHabitacion} onChange={e=>setForm(p=>({...p,tipoHabitacion:e.target.value}))} style={{ width:'100%', padding:'9px 11px', borderRadius:8, border:'1.5px solid #E5E5E3', fontSize:13 }}>
            <option>Doble estándar</option>
            <option>Suite junior</option>
            <option>Individual</option>
          </select>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'#444', display:'block', marginBottom:4 }}>Ciudad de salida</label>
          <input required value={form.ciudadSalida} onChange={e=>setForm(p=>({...p,ciudadSalida:e.target.value}))} placeholder="Ej: Ciudad de Guatemala" style={{ width:'100%', padding:'9px 11px', borderRadius:8, border:'1.5px solid #E5E5E3', fontSize:13, boxSizing:'border-box' }}/>
        </div>

        <div style={{ background:'#F8F8F6', borderRadius:10, padding:12, marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span style={{ color:'#888' }}>Precio/persona</span><span>${(paquete.precioPorPersona||0).toLocaleString()}</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}><span style={{ color:'#888' }}>Viajeros</span><span>× {form.numViajeros}</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, borderTop:'1px solid #E5E5E3', paddingTop:8, marginTop:4 }}><span>Total</span><span style={{ color:'#1D9E75' }}>${total.toLocaleString()}</span></div>
        </div>

        {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'10px 12px', borderRadius:8, fontSize:13, marginBottom:12 }}>⚠️ {error}</div>}

        <button type="submit" disabled={saving} style={{ width:'100%', padding:13, borderRadius:10, border:'none', background:saving?'#5DCAA5':'#1D9E75', color:'#fff', fontSize:14, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
          {saving ? 'Procesando...' : 'Confirmar reserva'}
        </button>
      </form>
    </div>
  )
}
