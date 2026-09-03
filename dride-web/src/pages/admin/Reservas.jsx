import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/services/firebase';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://dride-con-ale-production.up.railway.app';

const estadoColores = {
  pendiente: { bg: '#fff8e1', color: '#f57c00', label: 'Pendiente' },
  confirmada: { bg: '#e8f5e9', color: '#2e7d32', label: 'Confirmada' },
  cancelada: { bg: '#ffebee', color: '#c62828', label: 'Cancelada' },
};

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [procesando, setProcesando] = useState(null);
  const [whatsappLinks, setWhatsappLinks] = useState({});

  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    setLoading(true);
    const q = query(collection(db, 'reservas'), orderBy('creadaEn', 'desc'));
    const snap = await getDocs(q);
    setReservas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const cambiarEstado = async (reserva, nuevoEstado, motivo = '') => {
    setProcesando(reserva.id);
    try {
      await updateDoc(doc(db, 'reservas', reserva.id), { estado: nuevoEstado });

      const endpoint = nuevoEstado === 'confirmada'
        ? '/api/notificaciones/reserva-confirmada'
        : '/api/notificaciones/reserva-cancelada';

      const resp = await fetch(`${BACKEND}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservaId: reserva.id, motivo }),
      });

      const data = await resp.json();

      if (data.whatsappLink) {
        setWhatsappLinks(prev => ({ ...prev, [reserva.id]: data.whatsappLink }));
      }

      setReservas(prev =>
        prev.map(r => r.id === reserva.id ? { ...r, estado: nuevoEstado } : r)
      );
    } catch (err) {
      console.error(err);
      alert('Error al actualizar reserva');
    }
    setProcesando(null);
  };

  const abrirWhatsApp = async (reserva) => {
    const tipo = reserva.estado === 'confirmada' ? 'confirmada'
      : reserva.estado === 'cancelada' ? 'cancelada' : 'creada';

    if (whatsappLinks[reserva.id]) {
      window.open(whatsappLinks[reserva.id], '_blank');
      return;
    }

    try {
      const resp = await fetch(`${BACKEND}/api/notificaciones/whatsapp-link/${reserva.id}/${tipo}`);
      const data = await resp.json();
      if (data.whatsappLink) {
        setWhatsappLinks(prev => ({ ...prev, [reserva.id]: data.whatsappLink }));
        window.open(data.whatsappLink, '_blank');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const reservasFiltradas = filtro === 'todas'
    ? reservas
    : reservas.filter(r => r.estado === filtro);

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#0A2A1E', margin: 0 }}>Reservas</h1>
        <button onClick={cargarReservas} style={btnStyle('#1D9E75')}>↻ Actualizar</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['todas', 'pendiente', 'confirmada', 'cancelada'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              background: filtro === f ? '#0A2A1E' : '#E1F5EE',
              color: filtro === f ? '#fff' : '#0A2A1E',
              fontWeight: filtro === f ? 'bold' : 'normal',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#666' }}>Cargando reservas...</p>
      ) : reservasFiltradas.length === 0 ? (
        <p style={{ color: '#666' }}>No hay reservas {filtro !== 'todas' ? `con estado "${filtro}"` : ''}.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reservasFiltradas.map(reserva => {
            const est = estadoColores[reserva.estado] || estadoColores.pendiente;
            const fechaStr = reserva.creadaEn?.toDate
              ? reserva.creadaEn.toDate().toLocaleDateString('es-CR')
              : '—';

            return (
              <div key={reserva.id} style={{
                background: '#fff',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${est.color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', color: '#0A2A1E' }}>{reserva.paqueteNombre}</h3>
                    <p style={{ margin: '2px 0', color: '#555', fontSize: 14 }}>
                      👤 {reserva.clienteNombre} &nbsp;|&nbsp;
                      ✉️ {reserva.clienteEmail || '—'} &nbsp;|&nbsp;
                      📞 {reserva.clienteTelefono || '—'}
                    </p>
                    <p style={{ margin: '2px 0', color: '#555', fontSize: 14 }}>
                      📅 Fecha viaje: {reserva.fecha} &nbsp;|&nbsp;
                      👥 {reserva.personas} persona(s) &nbsp;|&nbsp;
                      💰 ${reserva.total}
                    </p>
                    <p style={{ margin: '4px 0', color: '#888', fontSize: 12 }}>
                      Creada: {fechaStr}
                    </p>
                  </div>
                  <span style={{
                    background: est.bg,
                    color: est.color,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 'bold',
                    height: 'fit-content',
                  }}>
                    {est.label}
                  </span>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {reserva.estado === 'pendiente' && (
                    <>
                      <button
                        disabled={procesando === reserva.id}
                        onClick={() => cambiarEstado(reserva, 'confirmada')}
                        style={btnStyle('#1D9E75')}
                      >
                        ✅ Confirmar
                      </button>
                      <button
                        disabled={procesando === reserva.id}
                        onClick={() => {
                          const motivo = prompt('Motivo de cancelación (opcional):') || '';
                          cambiarEstado(reserva, 'cancelada', motivo);
                        }}
                        style={btnStyle('#e53935')}
                      >
                        ❌ Cancelar
                      </button>
                    </>
                  )}

                  {reserva.clienteTelefono && (
                    <button
                      onClick={() => abrirWhatsApp(reserva)}
                      style={btnStyle('#25D366')}
                    >
                      💬 WhatsApp
                    </button>
                  )}
                </div>

                {/* Link WhatsApp generado */}
                {whatsappLinks[reserva.id] && (
                  <p style={{ marginTop: 8, fontSize: 12, color: '#1D9E75' }}>
                    ✅ Link WhatsApp generado — se abrirá en nueva pestaña
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const btnStyle = (bg) => ({
  background: bg,
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 'bold',
});
