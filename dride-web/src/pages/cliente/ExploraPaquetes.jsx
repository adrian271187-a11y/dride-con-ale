import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase'

export default function ExploraPaquetes() {
  const [paquetes, setPaquetes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [buscar, setBuscar]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function cargar() {
      const snap = await getDocs(query(collection(db, 'paquetes'), where('activo', '==', true)))
      setPaquetes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    cargar()
  }, [])

  const filtrados = paquetes.filter(p =>
    p.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    p.destino?.toLowerCase().includes(buscar.toLowerCase())
  )

  const badge = (e) => {
    const m = { disponible: ['#E1F5EE','#085041'], pocas_plazas: ['#FAEEDA','#633806'], agotado: ['#FCEBEB','#A32D2D'] }
    const [bg, color] = m[e] || ['#f0f0f0','#555']
    return <span style={{ background:bg, color, fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:600 }}>{e}</span>
  }

  const emojis = { playa:'🏖️', europa:'🗺️', aventura:'🏔️', asia:'🌸' }
  const emoji = (p) => emojis[p.categoria] || '✈️'

  return (
    <div style={{ minHeight:'100vh', background:'#0A2A1E' }}>
      {/* Header */}
      <div style={{ background:'#0A2A1E', padding:'28px 24px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <div style={{ width:34, height:34, background:'#1D9E75', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M6 22L13 9L20 16L25 11L27 22H6Z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="25" cy="9" r="2" fill="#9FE1CB"/><path d="M4 26h24" stroke="#9FE1CB" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:14, letterSpacing:'0.03em' }}>D'RIDE CON ALE</div>
            <div style={{ color:'#5DCAA5', fontSize:9, letterSpacing:'0.14em' }}>AGENCIA DE VIAJES</div>
          </div>
        </div>
        <h1 style={{ color:'#fff', fontSize:22, fontWeight:700, marginBottom:4 }}>¿A dónde quieres ir?</h1>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:16 }}>Descubre nuestros paquetes disponibles</p>
        <input
          value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="Buscar destino o paquete..."
          style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:'none', fontSize:14, outline:'none', boxSizing:'border-box', background:'rgba(255,255,255,0.1)', color:'#fff' }}
        />
      </div>

      {/* Lista */}
      <div style={{ background:'#F8F8F6', borderRadius:'16px 16px 0 0', minHeight:'70vh', padding:20 }}>
        {loading ? <p style={{ color:'#888', padding:20 }}>Cargando...</p> : filtrados.length === 0
          ? <p style={{ color:'#888', textAlign:'center', padding:40 }}>No hay paquetes disponibles.</p>
          : filtrados.map(p => (
            <div key={p.id} onClick={() => navigate(`/paquete/${p.id}`)}
              style={{ background:'#fff', border:'1px solid #E5E5E3', borderRadius:12, marginBottom:12, display:'flex', cursor:'pointer', overflow:'hidden' }}>
              <div style={{ width:80, background:'#0A2A1E', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>
                {emoji(p)}
              </div>
              <div style={{ padding:'12px 14px', flex:1 }}>
                <div style={{ fontWeight:700, color:'#0A2A1E', fontSize:14, marginBottom:2 }}>{p.nombre}</div>
                <div style={{ fontSize:12, color:'#888', marginBottom:8 }}>📍 {p.destino}, {p.pais} · {p.duracionDias} días</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:700, color:'#1D9E75', fontSize:15 }}>${(p.precioPorPersona||0).toLocaleString()}</span>
                  {badge(p.estado)}
                </div>
                <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>Cupos: {p.cuposDisponibles}/{p.cupoMaximo}</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
