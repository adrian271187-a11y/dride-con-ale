import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db, auth } from '@/services/firebase'

export default function ExploraPaquetes() {
  const [paquetes, setPaquetes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [buscar, setBuscar]     = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser]         = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u))
    return unsub
  }, [])

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

  const emojis = { playa:'🏖️', europa:'🗺️', aventura:'🏔️', asia:'🌸' }
  const emoji  = p => emojis[p.categoria] || '✈️'

  const badge = e => {
    const m = { disponible:['#E1F5EE','#085041'], pocas_plazas:['#FAEEDA','#633806'], agotado:['#FCEBEB','#A32D2D'] }
    const [bg, color] = m[e] || ['#f0f0f0','#555']
    return <span style={{ background:bg, color, fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:600 }}>{e}</span>
  }

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:'system-ui,sans-serif' }}>

      {/* NAV */}
      <nav style={{ background:'#0A2A1E', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', height:60, position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, background:'#1D9E75', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M6 22L13 9L20 16L25 11L27 22H6Z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="25" cy="9" r="2" fill="#9FE1CB"/><path d="M4 26h24" stroke="#9FE1CB" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:13, letterSpacing:'0.04em' }}>D'RIDE CON ALE</div>
            <div style={{ color:'#5DCAA5', fontSize:8, letterSpacing:'0.14em' }}>AGENCIA DE VIAJES</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          {user ? (
            <>
              <button onClick={() => navigate('/mis-reservas')} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.8)', padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:13 }}>Mis reservas</button>
              <button onClick={() => auth.signOut()} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:13 }}>Salir</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.8)', padding:'6px 14px', borderRadius:8, cursor:'pointer', fontSize:13 }}>Iniciar sesión</button>
              <button onClick={() => navigate('/registro')} style={{ background:'#1D9E75', border:'none', color:'#fff', padding:'6px 16px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>Registrarse</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg, #0A2A1E 0%, #0F6E56 60%, #1D9E75 100%)', padding:'72px 32px 56px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, opacity:0.05, backgroundImage:'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize:'60px 60px' }}></div>
        <div style={{ position:'relative' }}>
          <div style={{ display:'inline-block', background:'rgba(255,255,255,0.1)', color:'#9FE1CB', fontSize:12, padding:'4px 14px', borderRadius:20, marginBottom:16, fontWeight:600, letterSpacing:'0.06em' }}>✈️ AGENCIA DE VIAJES CERTIFICADA</div>
          <h1 style={{ color:'#fff', fontSize:44, fontWeight:800, marginBottom:12, lineHeight:1.2 }}>Descubre el mundo<br/><span style={{ color:'#9FE1CB' }}>con D'RIDE CON ALE</span></h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:16, maxWidth:520, margin:'0 auto 32px', lineHeight:1.6 }}>Paquetes de viaje all-inclusive para los destinos más increíbles del mundo. Reserva fácil, precios transparentes.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', maxWidth:480, margin:'0 auto' }}>
            <input value={buscar} onChange={e => setBuscar(e.target.value)} placeholder="¿A dónde quieres ir?"
              style={{ flex:1, padding:'13px 18px', borderRadius:10, border:'none', fontSize:14, outline:'none' }}/>
            <button style={{ background:'#1D9E75', color:'#fff', border:'none', padding:'13px 24px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>Buscar</button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background:'#0A2A1E', padding:'20px 32px', display:'flex', justifyContent:'center', gap:48 }}>
        {[{n:'500+',l:'Viajeros felices'},{n:'20+',l:'Destinos'},{n:'5★',l:'Calificación'},{n:'10+',l:'Años de experiencia'}].map(({n,l})=>(
          <div key={l} style={{ textAlign:'center' }}>
            <div style={{ color:'#1D9E75', fontWeight:800, fontSize:22 }}>{n}</div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* PAQUETES */}
      <div style={{ padding:'56px 32px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <h2 style={{ fontSize:30, fontWeight:800, color:'#0A2A1E', marginBottom:8 }}>Paquetes disponibles</h2>
          <p style={{ color:'#888', fontSize:15 }}>Elige tu próxima aventura — todo incluido</p>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'#888' }}>Cargando paquetes...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'#888' }}>No hay paquetes disponibles.</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
            {filtrados.map(p => (
              <div key={p.id} onClick={() => navigate(`/paquete/${p.id}`)}
                style={{ background:'#fff', border:'1px solid #E5E5E3', borderRadius:16, overflow:'hidden', cursor:'pointer', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', transition:'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ height:140, background:'linear-gradient(135deg, #0A2A1E, #1D9E75)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, position:'relative' }}>
                  {emoji(p)}
                  <div style={{ position:'absolute', top:10, right:10 }}>{badge(p.estado)}</div>
                </div>
                <div style={{ padding:18 }}>
                  <h3 style={{ fontWeight:700, color:'#0A2A1E', fontSize:16, marginBottom:4 }}>{p.nombre}</h3>
                  <p style={{ color:'#888', fontSize:13, marginBottom:10 }}>📍 {p.destino}, {p.pais} · {p.duracionDias} días</p>
                  {p.incluye?.length > 0 && (
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                      {p.incluye.slice(0,3).map(i => (
                        <span key={i} style={{ background:'#F0FBF5', color:'#0F6E56', fontSize:10, padding:'2px 8px', borderRadius:20 }}>✓ {i}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #F0F0EE', paddingTop:12 }}>
                    <div>
                      <div style={{ fontSize:11, color:'#aaa' }}>Desde</div>
                      <div style={{ fontWeight:800, color:'#1D9E75', fontSize:20 }}>${(p.precioPorPersona||0).toLocaleString()}</div>
                      <div style={{ fontSize:11, color:'#aaa' }}>por persona</div>
                    </div>
                    <button style={{ background:'#0A2A1E', color:'#fff', border:'none', padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                      Ver detalles →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POR QUÉ ELEGIRNOS */}
      <div style={{ background:'#F8F8F6', padding:'56px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <h2 style={{ fontSize:28, fontWeight:800, color:'#0A2A1E', marginBottom:8 }}>¿Por qué viajar con nosotros?</h2>
            <p style={{ color:'#888', fontSize:15 }}>Tu tranquilidad y experiencia son nuestra prioridad</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:20 }}>
            {[
              { icon:'🏆', title:'Experiencia', desc:'Más de 10 años organizando viajes inolvidables' },
              { icon:'💳', title:'Pago seguro', desc:'Transferencia verificada y confirmación garantizada' },
              { icon:'🎯', title:'Todo incluido', desc:'Vuelo, hotel, traslados y tours en un solo paquete' },
              { icon:'📱', title:'Atención 24/7', desc:'Soporte por WhatsApp antes, durante y después de tu viaje' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background:'#fff', borderRadius:14, padding:24, textAlign:'center', border:'1px solid #E5E5E3' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{icon}</div>
                <div style={{ fontWeight:700, color:'#0A2A1E', fontSize:15, marginBottom:6 }}>{title}</div>
                <div style={{ color:'#888', fontSize:13, lineHeight:1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:'linear-gradient(135deg, #0A2A1E, #1D9E75)', padding:'56px 32px', textAlign:'center' }}>
        <h2 style={{ color:'#fff', fontSize:28, fontWeight:800, marginBottom:10 }}>¿Listo para tu próxima aventura?</h2>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:15, marginBottom:28 }}>Reserva hoy y asegura tu lugar — los cupos son limitados</p>
        <button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
          style={{ background:'#fff', color:'#0A2A1E', border:'none', padding:'13px 32px', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer' }}>
          Ver paquetes disponibles ↑
        </button>
      </div>

      {/* FOOTER */}
      <footer style={{ background:'#0A2A1E', padding:'28px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ color:'#fff', fontWeight:700, fontSize:13 }}>D'RIDE CON ALE</div>
          <div style={{ color:'#5DCAA5', fontSize:11, marginTop:2 }}>Agencia de Viajes · Todos los derechos reservados 2026</div>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer' }}>WhatsApp</span>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer' }}>Instagram</span>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer' }}>Facebook</span>
        </div>
      </footer>
    </div>
  )
}
