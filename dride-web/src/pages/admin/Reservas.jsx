import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore'
import { db } from '@/services/firebase'

export default function Reservas() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState('todas')

  const cargar = async () => {
    setLoading(true)
    const snap = await getDocs(query(collection(db, 'reservas'), orderBy('creadaEn', 'desc')))
    setReservas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const cambiarEstado = async (id, estado) => {
    await updateDoc(doc(db, 'reservas', id), { estado })
    cargar()
  }

  const badge = (estado) => {
    const map = { confirmada: ['#E1F5EE','#085041'], pendiente: ['#FAEEDA','#633806'], cancelada: ['#FCEBEB','#A32D2D'] }
    const [bg, color] = map[estado] || ['#f0f0f0','#555']
    return <span style={{ background: bg, color, fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{estado}</span>
  }

  const filtradas = filtro === 'todas' ? reservas : reservas.filter(r => r.estado === filtro)

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A2A1E' }}>Reservas</h1>
        <p style={{ fontSize: 13, color: '#888' }}>{reservas.length} reservas en total</p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['todas','pendiente','confirmada','cancelada'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ padding: '6px 16px', borderRadius: 20, border: '1.5px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filtro === f ? '#0A2A1E' : '#fff',
              color:      filtro === f ? '#9FE1CB'  : '#555',
              borderColor: filtro === f ? '#0A2A1E' : '#E5E5E3' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color: '#888' }}>Cargando...</p> : (
        <div style={{ background: '#fff', border: '1px solid #E5E5E3', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8F8F6', borderBottom: '1px solid #E5E5E3' }}>
                {['Código','Paquete','Viajeros','Total','Estado','Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#888', fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1D9E75' }}>{r.codigo || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>{r.paqueteId?.slice(0,14) || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>{r.numViajeros || 1}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>${(r.totalPagar || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 14px' }}>{badge(r.estado)}</td>
                  <td style={{ padding: '12px 14px', display: 'flex', gap: 6 }}>
                    {r.estado === 'pendiente' && (
                      <button onClick={() => cambiarEstado(r.id, 'confirmada')}
                        style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Confirmar
                      </button>
                    )}
                    {r.estado !== 'cancelada' && (
                      <button onClick={() => cambiarEstado(r.id, 'cancelada')}
                        style={{ background: '#FCEBEB', color: '#A32D2D', border: 'none', padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtradas.length === 0 && <p style={{ padding: 24, color: '#888', textAlign: 'center' }}>No hay reservas.</p>}
        </div>
      )}
    </div>
  )
}
