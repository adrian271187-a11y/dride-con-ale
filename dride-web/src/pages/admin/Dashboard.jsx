import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from '@/services/firebase'

export default function Dashboard() {
  const [stats, setStats] = useState({ reservas: 0, clientes: 0, paquetes: 0, ingresos: 0 })
  const [recientes, setRecientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const [resvSnap, pkgSnap, usrSnap] = await Promise.all([
          getDocs(collection(db, 'reservas')),
          getDocs(query(collection(db, 'paquetes'), where('activo', '==', true))),
          getDocs(collection(db, 'usuarios')),
        ])
        const reservas = resvSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        const ingresos = reservas.filter(r => r.estado === 'confirmada').reduce((s, r) => s + (r.totalPagar || 0), 0)
        setStats({ reservas: reservas.length, clientes: usrSnap.size, paquetes: pkgSnap.size, ingresos })
        setRecientes(reservas.slice(0, 5))
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    cargar()
  }, [])

  const badge = (estado) => {
    const map = { confirmada: ['#E1F5EE','#085041'], pendiente: ['#FAEEDA','#633806'], cancelada: ['#FCEBEB','#A32D2D'] }
    const [bg, color] = map[estado] || ['#f0f0f0','#555']
    return <span style={{ background: bg, color, fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{estado}</span>
  }

  if (loading) return <div style={{ padding: 40, color: '#888' }}>Cargando...</div>

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A2A1E', marginBottom: 4 }}>Dashboard</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Resumen general de D'RIDE CON ALE</p>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Reservas totales', value: stats.reservas, icon: '🎫' },
          { label: 'Clientes',         value: stats.clientes,  icon: '👥' },
          { label: 'Paquetes activos', value: stats.paquetes,  icon: '🧳' },
          { label: 'Ingresos',         value: `$${stats.ingresos.toLocaleString()}`, icon: '💰' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #E5E5E3', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#0A2A1E' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Reservas recientes */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E3', borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0A2A1E', marginBottom: 16 }}>Reservas recientes</h2>
        {recientes.length === 0
          ? <p style={{ color: '#888', fontSize: 13 }}>No hay reservas aún.</p>
          : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E5E3' }}>
                  {['Código','Cliente','Paquete','Total','Estado'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recientes.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                    <td style={{ padding: '10px', color: '#1D9E75', fontWeight: 600 }}>{r.codigo || '—'}</td>
                    <td style={{ padding: '10px' }}>{r.usuarioId?.slice(0,8) || '—'}</td>
                    <td style={{ padding: '10px' }}>{r.paqueteId?.slice(0,12) || '—'}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>${(r.totalPagar || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>{badge(r.estado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  )
}
