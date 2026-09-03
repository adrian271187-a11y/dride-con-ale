import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE  = 'service_ydppl8q';
const EMAILJS_TEMPLATE = 'template_ed1xlwp';
const EMAILJS_KEY      = 'WSkrfzumafc-IOCWi';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://dride-con-ale-production.up.railway.app';

const estadoColores = {
  pendiente:  { bg: '#fff8e1', color: '#f57c00', label: 'Pendiente' },
  confirmada: { bg: '#e8f5e9', color: '#2e7d32', label: 'Confirmada' },
  cancelada:  { bg: '#ffebee', color: '#c62828', label: 'Cancelada' },
};

export default function Reservas() {
  const [reservas, setReservas]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filtro, setFiltro]               = useState('todas');
  const [procesando, setProcesando]       = useState(null);
  const [whatsappLinks, setWhatsappLinks] = useState({});
  const [toast, setToast]                 = useState(null);

  useEffect(() => { cargarReservas() }, []);

  const mostrarToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const cargarReservas = async () => {
    setLoading(true);
    const q    = query(collection(db, 'reservas'), orderBy('creadaEn', 'desc'));
    const snap = await getDocs(q);
    setReservas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const enviarEmail = async (reserva, tipo) => {
    const email = reserva.clienteEmail || reserva.email || '';
    if (!email) return false;
    try {
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          to_email:       email,
          to_name:        reserva.clienteNombre || reserva.nombre || 'Cliente',
          tipo:           tipo === 'confirmada' ? 'Confirmada' : 'Cancelada',
          paquete_nombre: reserva.paqueteNombre || '—',
          fecha_viaje:    reserva.fecha || reserva.fechaSalida || '—',
          personas:       reserva.personas || reserva.numViajeros || 1,
          total:          reserva.total || reserva.totalPagar || 0,
          codigo:         reserva.codigo || reserva.id,
        },
        EMAILJS_KEY
      );
      return true;
    } catch (err) {
      console.error('EmailJS error:', err);
      return false;
    }
  };

  const cambiarEstado = async (reserva, nuevoEstado, motivo = '') => {
    setProcesando(reserva.id);
    try {
      await updateDoc(doc(db, 'reservas', reserva.id), { estado: nuevoEstado });
      const emailOk = await enviarEmail(reserva, nuevoEstado);

      const endpoint = nuevoEstado === 'confirmada'
        ? '/api/notificaciones/reserva-confirmada'
        : '/api/notificaciones/reserva-cancelada';

      try {
        const resp = await fetch(`${BACKEND}${endpoint}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ reservaId: reserva.id, motivo }),
        });
        const data = await resp.json();
        if (data.whatsappLink) {
          setWhatsappLinks(prev => ({ ...prev, [reserva.id]: data.whatsappLink }));
          window.open(data.whatsappLink, '_blank');
        }
      } catch (e) { console.error('WA error:', e) }

      mostrarToast(
        `${nuevoEstado === 'confirmada' ? '✅ Reserva confirmada.' : '❌ Reserva cancelada.'} ${emailOk ? '✉️ Email enviado.' : '⚠️ Sin email registrado.'}`
      );

      setReservas(prev =>
        prev.map(r => r.id === reserva.id ? { ...r, estado: nuevoEstado } : r)
      );
    } catch (err) {
      console.error(err);
      mostrarToast('Error al actualizar reserva', false);
    }
    setProcesando(null);
  };

  const abrirWhatsApp = async (reserva) => {
    const tipo = reserva.estado === 'confirmada' ? 'confirmada'
      : reserva.estado === 'cancelada' ? 'cancelada' : 'creada';
    if (whatsappLinks[reserva.id]) { window.open(whatsappLinks[reserva.id], '_blank'); return; }
    try {
      const resp = await fetch(`${BACKEND}/api/notificaciones/whatsapp-link/${reserva.id}/${tipo}`);
      const data = await resp.json();
      if (data.whatsappLink) {
        setWhatsappLinks(prev => ({ ...prev, [reserva.id]: data.whatsappLink }));
        window.open(data.whatsappLink, '_blank');
      }
    } catch (err) { console.error(err) }
  };

  const reservasFiltradas = filtro === 'todas' ? reservas : reservas.filter(r => r.estado === filtro);

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: toast.ok ? '#0A2A1E' : '#c62828', color: '#fff',
          padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600,
          zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 420, textAlign: 'center',
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#0A2A1E', margin: 0 }}>Reservas</h1>
        <button onClick={cargarReservas} style={btnStyle('#1D9E75')}>↻ Actualizar</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['todas', 'pendiente', 'confirmada', 'cancelada'].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: filtro === f ? '#0A2A1E' : '#E1F5EE',
            color: filtro === f ? '#fff' : '#0A2A1E',
            fontWeight: filtro === f ? 'bold' : 'normal', textTransform: 'capitalize',
          }}>{f}</button>
        ))}
      </div>

      {loading ? <p style={{ color: '#666' }}>Cargando reservas...</p>
        : reservasFiltradas.length === 0 ? <p style={{ color: '#666' }}>No hay reservas{filtro !== 'todas' ? ` con estado "${filtro}"` : ''}.</p>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reservasFiltradas.map(reserva => {
              const est = estadoColores[reserva.estado] || estadoColores.pendiente;
              const fechaStr = reserva.creadaEn?.toDate ? reserva.creadaEn.toDate().toLocaleDateString('es-CR') : '—';
              return (
                <div key={reserva.id} style={{
                  background: '#fff', borderRadius: 12, padding: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${est.color}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', color: '#0A2A1E' }}>{reserva.paqueteNombre}</h3>
                      <p style={{ margin: '2px 0', color: '#555', fontSize: 14 }}>
                        👤 {reserva.clienteNombre || '—'} &nbsp;|&nbsp;
                        ✉️ {reserva.clienteEmail  || '—'} &nbsp;|&nbsp;
                        📞 {reserva.clienteTelefono || '—'}
                      </p>
                      <p style={{ margin: '2px 0', color: '#555', fontSize: 14 }}>
                        📅 {reserva.fecha || reserva.fechaSalida || '—'} &nbsp;|&nbsp;
                        👥 {reserva.personas || reserva.numViajeros || 1} persona(s) &nbsp;|&nbsp;
                        💰 ${reserva.total || reserva.totalPagar || 0}
                      </p>
                      <p style={{ margin: '4px 0', color: '#888', fontSize: 12 }}>Creada: {fechaStr}</p>
                    </div>
                    <span style={{
                      background: est.bg, color: est.color, padding: '4px 12px',
                      borderRadius: 20, fontSize: 13, fontWeight: 'bold', height: 'fit-content',
                    }}>{est.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {reserva.estado === 'pendiente' && (
                      <>
                        <button disabled={procesando === reserva.id}
                          onClick={() => cambiarEstado(reserva, 'confirmada')} style={btnStyle('#1D9E75')}>
                          {procesando === reserva.id ? '⏳ Procesando...' : '✅ Confirmar'}
                        </button>
                        <button disabled={procesando === reserva.id}
                          onClick={() => { const m = prompt('Motivo de cancelación (opcional):') || ''; cambiarEstado(reserva, 'cancelada', m); }}
                          style={btnStyle('#e53935')}>❌ Cancelar
                        </button>
                      </>
                    )}
                    {(reserva.clienteTelefono || reserva.telefono) && (
                      <button onClick={() => abrirWhatsApp(reserva)} style={btnStyle('#25D366')}>💬 WhatsApp</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

const btnStyle = (bg) => ({
  background: bg, color: '#fff', border: 'none',
  padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
});
