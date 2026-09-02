import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

export default function Confirmacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reserva, setReserva] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const snap = await getDoc(doc(db, 'reservas', id))
      if (snap.exists()) setReserva({ id: snap.id, ...snap.data() })
      setLoading(false)
    }
    cargar()
  }, [id])

  if (loading) return <div style={{ padding:40, color:'#888' }}>Cargando...</div>
  if (!reserva) return <div style={{ padding:40, color:'#888' }}>Reserva no encontrada.</div>

  const badge = (e) => {
    const m = { confirmada:['#E1F5EE','#085041'], pendiente:['#FAEEDA','#633806'], cancelada:['#FCEBEB','#A32D2D'] }
    const [bg, color] = m[e] || ['#f0f0f0','#555']
    return <span style={{ background:bg, color, fontSize:12, padding:'3px 10px', borderRadius:20, fontWeight:600 }}>{e}</span>
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F8F8F6' }}>
      <div style={{ background:'#0A2A1E', padding:'20px', textAlign:'center' }}>
        <div style={{ width:64, height:64, background:'#1D9E75', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:28 }}>✅</div>
        <h1 style={{ color:'#fff', fontSize:20, fontWeight:700, marginBottom:4 }}>¡Reserva registrada!</h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>Tu solicitud está siendo procesada</p>
      </div>

      <div style={{ padding:20 }}>
        <div style={{ background:'#fff', border:'1px solid #E5E5E3', borderRadius:12, overflow:'hidden', marginBottom:14 }}>
          <div style={{ background:'#0A2A1E', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color:'#9FE1CB', fontWeight:700, letterSpacing:'0.08em' }}>{reserva.codigo}</span>
            {badge(reserva.estado)}
          </div>
          <div style={{ padding:16 }}>
            {[
              { l:'Viajeros', v:`${reserva.numViajeros} adulto${reserva.numViajeros>1?'s':''}` },
              { l:'Habitación', v:reserva.tipoHabitacion },
              { l:'Ciudad salida', v:reserva.ciudadSalida },
              { l:'Total', v:`$${(reserva.totalPagar||0).toLocaleString()}` },
            ].map(({l,v}) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'6px 0', borderBottom:'1px solid #F5F5F5' }}>
                <span style={{ color:'#888' }}>{l}</span>
                <span style={{ fontWeight:600, color:'#0A2A1E' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {reserva.estado === 'pendiente' && (
          <div style={{ background:'#E1F5EE', border:'1px solid #9FE1CB', borderRadius:12, padding:16, marginBottom:14 }}>
            <h3 style={{ color:'#0A2A1E', fontWeight:700, fontSize:14, marginBottom:8 }}>⏳ Próximos pasos</h3>
            <p style={{ color:'#0F6E56', fontSize:13, lineHeight:1.6 }}>
              Tu reserva está pendiente de pago. Realiza una transferencia bancaria y envía el comprobante a nuestro equipo por WhatsApp para confirmar tu lugar.
            </p>
          </div>
        )}

        <div style={{ background:'#fff', border:'1px solid #E5E5E3', borderRadius:12, padding:16, marginBottom:14 }}>
          <h3 style={{ color:'#0A2A1E', fontWeight:700, fontSize:14, marginBottom:10 }}>Datos bancarios</h3>
          {[
            { l:'Banco', v:'Banco Industrial' },
            { l:'Cuenta', v:'123-456789-0' },
            { l:'A nombre de', v:"D'RIDE CON ALE" },
            { l:'Referencia', v:reserva.codigo },
          ].map(({l,v}) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13, padding:'5px 0', borderBottom:'1px solid #F5F5F5' }}>
              <span style={{ color:'#888' }}>{l}</span>
              <span style={{ fontWeight:600, color:'#0A2A1E' }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => navigate('/mis-reservas')} style={{ flex:1, padding:12, borderRadius:10, border:'1.5px solid #E5E5E3', background:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Mis reservas
          </button>
          <button onClick={() => navigate('/')} style={{ flex:1, padding:12, borderRadius:10, border:'none', background:'#1D9E75', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Ver más paquetes
          </button>
        </div>
      </div>
    </div>
  )
}
