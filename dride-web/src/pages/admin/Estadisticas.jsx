import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase'

export default function Estadisticas() {
  const [data, setData]     = useState({ reservas: [], pagos: [], paquetes: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [rSnap, pSnap, pkgSnap] = await Promise.all([
        getDocs(collection(db, 'reservas')),
        getDocs(collection(db, 'pagos')),
        getDocs(collection(db, 'paquetes')),
      ])
      setData({
        reservas: rSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        pagos:    pSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        paquetes: pkgSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      })
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return <div style={{ padding: 40, color: '#888' }}>Cargando...</div>

  const { reservas, pagos, paquetes } = data
  const confirmadas = reservas.filter(r => r.estado === 'confirmada')
  const pendientes  = reservas.filter(r => r.estado === 'pendiente')
  const canceladas  = reservas.filter(r => r.estado === 'cancelada')
  const ingresos    = confirmadas.reduce((s, r) => s + (r.totalPagar || 0), 0)
  const ticketProm  = confirmadas.length ? Math.round(ingresos / confirmadas.length) : 0
  const conversion  = reservas.length ? Math.round((confirmadas.length / reservas.length) * 100) : 0

  const kpis = [
    { label: 'Ingresos totales',    value: `$${ingresos.toLocaleString()}`, icon: '💰', color: '#1D9E75' },
    { label: 'Reservas confirmadas',value: confirmadas.length,              icon: '✅', color: '#1D9E75' },
    { label: 'Reservas pendientes', value: pendientes.length,               icon: '⏳', color: '#BA7517' },
    { label: 'Canceladas',          value: canceladas.length,               icon: '❌', color: '#D85A30' },
    { label: 'Ticket promedio',     value: `$${ticketProm.toLocaleString()}`,icon: '🧾', color: '#1D9E75' },
    { label: 'Tasa de conversión',  value: `${conversion}%`,               icon: '📈', color: '#1D9E75' },
  ]

  // Contar reservas por paquete
  const porPaquete = paquetes.map(p => ({
    nombre: p.nombre,
    total:  reservas.filter(r => r.paqueteId === p.id).length,
  })).sort((a, b) => b.total - a.total)

  const maxTotal = porPaquete[0]?.total || 1

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A2A1E', marginBottom: 4 }}>Estadísticas</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Resumen de rendimiento general</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {kpis.map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #E5E5E3', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E5E3', borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0A2A1E', marginBottom: 16 }}>Reservas por paquete</h2>
        {porPaquete.length === 0
          ? <p style={{ color: '#888' }}>Sin datos.</p>
          : porPaquete.map(({ nombre, total }) => (
            <div key={nombre} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                <span style={{ fontWeight: 600, color: '#0A2A1E' }}>{nombre}</span>
                <span style={{ color: '#1D9E75', fontWeight: 700 }}>{total}</span>
              </div>
              <div style={{ height: 8, background: '#F0F0EE', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(total / maxTotal) * 100}%`, background: '#1D9E75', borderRadius: 4 }} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
