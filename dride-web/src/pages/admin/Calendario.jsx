import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase'

export default function Calendario() {
  const [fechas, setFechas]   = useState([])
  const [paquetes, setPaquetes] = useState([])
  const [loading, setLoading]  = useState(true)
  const [form, setForm]        = useState({ pkgId: '', fechaSalida: '', fechaRegreso: '', horaEncuentro: '05:30', puntoEncuentro: '' })
  const [saving, setSaving]    = useState(false)

  const cargar = async () => {
    setLoading(true)
    const [fSnap, pSnap] = await Promise.all([
      getDocs(collection(db, 'fechas_paquete')),
      getDocs(query(collection(db, 'paquetes'), where('activo', '==', true))),
    ])
    setFechas(fSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setPaquetes(pSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    setSaving(true)
    const pkg = paquetes.find(p => p.id === form.pkgId)
    await addDoc(collection(db, 'fechas_paquete'), {
      ...form,
      cuposRestantes: pkg?.cupoMaximo || 0,
      disponible: true,
      creadoEn: new Date(),
    })
    setForm({ pkgId: '', fechaSalida: '', fechaRegreso: '', horaEncuentro: '05:30', puntoEncuentro: '' })
    setSaving(false)
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta fecha?')) return
    await deleteDoc(doc(db, 'fechas_paquete', id))
    cargar()
  }

  const pkgNombre = (id) => paquetes.find(p => p.id === id)?.nombre || id?.slice(0,12)

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0A2A1E', marginBottom: 4 }}>Calendario</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Gestión de fechas de salida por paquete</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #E5E5E3', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0A2A1E', marginBottom: 16 }}>Nueva fecha</h2>
          <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>Paquete</label>
              <select required value={form.pkgId} onChange={e => setForm(p => ({ ...p, pkgId: e.target.value }))}
                style={{ width: '100%', padding: '9px 11px', borderRadius: 8, border: '1.5px solid #E5E5E3', fontSize: 13 }}>
                <option value="">Seleccionar...</option>
                {paquetes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            {[
              { label: 'Fecha de salida',  key: 'fechaSalida',    type: 'date' },
              { label: 'Fecha de regreso', key: 'fechaRegreso',   type: 'date' },
              { label: 'Hora de encuentro',key: 'horaEncuentro',  type: 'time' },
              { label: 'Punto de encuentro', key: 'puntoEncuentro', type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>{label}</label>
                <input type={type} required={key !== 'puntoEncuentro'} value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 11px', borderRadius: 8, border: '1.5px solid #E5E5E3', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <button type="submit" disabled={saving}
              style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: 11, borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
              {saving ? 'Guardando...' : 'Agregar fecha'}
            </button>
          </form>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E5E5E3', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0A2A1E', marginBottom: 16 }}>Fechas programadas</h2>
          {loading ? <p style={{ color: '#888' }}>Cargando...</p> : fechas.length === 0
            ? <p style={{ color: '#888' }}>No hay fechas programadas.</p>
            : fechas.map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0A2A1E', fontSize: 13 }}>{pkgNombre(f.pkgId)}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{f.fechaSalida} → {f.fechaRegreso}</div>
                  <div style={{ fontSize: 11, color: '#1D9E75' }}>⏰ {f.horaEncuentro} · {f.cuposRestantes} cupos</div>
                </div>
                <button onClick={() => eliminar(f.id)}
                  style={{ background: '#FCEBEB', color: '#A32D2D', border: 'none', padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  Eliminar
                </button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
