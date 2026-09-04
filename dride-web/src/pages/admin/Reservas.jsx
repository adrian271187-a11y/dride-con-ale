import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import emailjs from '@emailjs/browser';

// ── EmailJS ──────────────────────────────────────────────
const EMAILJS_PUBLIC_KEY  = 'WSkrfzumafc-IOCWi';
const EMAILJS_SERVICE_ID  = 'service_pwktaba';
const EMAILJS_TEMPLATE_ID = 'template_9zf42ug';

// ── WhatsApp agencia ─────────────────────────────────────
const WHATSAPP_AGENCIA = '50688887777'; // ← cambia por el número real con código de país, sin + ni espacios

const estadoColores = {
  pendiente:  { bg: '#fff8e1', color: '#f57c00', label: 'Pendiente'  },
  confirmada: { bg: '#e8f5e9', color: '#2e7d32', label: 'Confirmada' },
  cancelada:  { bg: '#ffebee', color: '#c62828', label: 'Cancelada'  },
};

// ── Helpers ──────────────────────────────────────────────

/** Obtiene el campo `incluye` del paquete desde Firestore */
const obtenerIncluyePaquete = async (paqueteId) => {
  if (!paqueteId) return 'Consultar con la agencia';
  try {
    const snap = await getDoc(doc(db, 'paquetes', paqueteId));
    if (snap.exists()) {
      const data = snap.data();
      // acepta el campo como array o string
      const incluye = data.incluye || data.incluyePaquete || data.descripcion || '';
      return Array.isArray(incluye) ? '• ' + incluye.join('\n• ') : incluye || 'Consultar con la agencia';
    }
  } catch (e) {
    console.error('Error obteniendo paquete:', e);
  }
  return 'Consultar con la agencia';
};

/** Envía el correo de confirmación al cliente vía EmailJS */
const enviarEmailConfirmacion = async (reserva, incluyePaquete) => {
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_name:         reserva.clienteNombre,
      to_email:        reserva.clienteEmail,
      paquete_nombre:  reserva.paqueteNombre,
      fecha_viaje:     reserva.fechaId,
      personas:        reserva.numViajeros,
      total:           reserva.totalPagar,
      incluye_paquete: incluyePaquete,
      reserva_id:      reserva.id,
      codigo_reserva:  reserva.codigo,
      pago_info:       'Para confirmar tu lugar, realiza tu pago y comunícate con nosotros por WhatsApp al +506 8888-7777 enviando tu comprobante y el código de reserva.',
    },
    EMAILJS_PUBLIC_KEY
  );
};

/** Genera el link de WhatsApp con mensaje pre-llenado */
const generarLinkWhatsApp = (reserva, incluyePaquete, telefono) => {
  // Limpia el teléfono: quita +, espacios, guiones
  const tel = telefono.replace(/[\s\-\+\(\)]/g, '');

  const mensaje =
`¡Hola ${reserva.clienteNombre}! 🌿

Tu reserva con *D'RIDE CON ALE* ha sido *confirmada* ✅

🧳 *Paquete:* ${reserva.paqueteNombre}
📅 *Fecha de viaje:* ${reserva.fechaId}
👥 *Personas:* ${reserva.numViajeros}
💰 *Total:* $${reserva.totalPagar}

✅ *¿Qué incluye tu paquete?*
• ${incluyePaquete}

💳 *Método de pago:*
Para confirmar tu lugar realiza tu pago y envíanos el comprobante por WhatsApp con tu código de reserva.

Banco: Banco Industrial
Cuenta: 123-456789-0
A nombre de: D'RIDE CON ALE
Referencia: ${reserva.codigo}

¡Nos vemos pronto! 🚌`;

  return `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`;
};

// ─────────────────────────────────────────────────────────

export default function Reservas() {
  const [reservas, setReservas]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filtro, setFiltro]           = useState('todas');
  const [procesando, setProcesando]   = useState(null);
  const [whatsappLinks, setWhatsappLinks] = useState({});
  const [emailEnviado, setEmailEnviado]   = useState({});

  useEffect(() => { cargarReservas(); }, []);

  const cargarReservas = async () => {
    setLoading(true);
    const q    = query(collection(db, 'reservas'), orderBy('creadaEn', 'desc'));
    const snap = await getDocs(q);
    setReservas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  // ── Confirmar reserva ────────────────────────────────────
  const confirmarReserva = async (reserva) => {
    setProcesando(reserva.id);
    try {
      // 1. Actualizar estado en Firestore
      await updateDoc(doc(db, 'reservas', reserva.id), { estado: 'confirmada' });

      // 2. Obtener lo que incluye el paquete
      const incluyePaquete = await obtenerIncluyePaquete(reserva.paqueteId);

      // 3. Enviar email al cliente
      if (reserva.clienteEmail) {
        try {
          await enviarEmailConfirmacion(reserva, incluyePaquete);
          setEmailEnviado(prev => ({ ...prev, [reserva.id]: true }));
        } catch (emailErr) {
          console.error('Error enviando email:', emailErr);
          alert('⚠️ Reserva confirmada pero hubo un problema enviando el correo. Verifica EmailJS.');
        }
      }

      // 4. Generar link de WhatsApp
      if (reserva.clienteTelefono) {
        const link = generarLinkWhatsApp(reserva, incluyePaquete, reserva.clienteTelefono);
        setWhatsappLinks(prev => ({ ...prev, [reserva.id]: link }));

        // 5. Abrir WhatsApp automáticamente
        window.open(link, '_blank');
      }

      // 6. Actualizar UI
      setReservas(prev =>
        prev.map(r => r.id === reserva.id ? { ...r, estado: 'confirmada' } : r)
      );
    } catch (err) {
      console.error(err);
      alert('Error al confirmar la reserva');
    }
    setProcesando(null);
  };

  // ── Cancelar reserva ─────────────────────────────────────
  const cancelarReserva = async (reserva, motivo) => {
    setProcesando(reserva.id);
    try {
      await updateDoc(doc(db, 'reservas', reserva.id), { estado: 'cancelada', motivo });
      setReservas(prev =>
        prev.map(r => r.id === reserva.id ? { ...r, estado: 'cancelada' } : r)
      );
    } catch (err) {
      console.error(err);
      alert('Error al cancelar la reserva');
    }
    setProcesando(null);
  };

  // ── Botón WhatsApp manual (reenvío) ─────────────────────
  const abrirWhatsApp = async (reserva) => {
    // Si ya tenemos el link generado, abrirlo directo
    if (whatsappLinks[reserva.id]) {
      window.open(whatsappLinks[reserva.id], '_blank');
      return;
    }
    // Si no, generarlo con los datos de la reserva
    const incluyePaquete = await obtenerIncluyePaquete(reserva.paqueteId);
    const tel = reserva.clienteTelefono || WHATSAPP_AGENCIA;
    const link = generarLinkWhatsApp(reserva, incluyePaquete, tel);
    setWhatsappLinks(prev => ({ ...prev, [reserva.id]: link }));
    window.open(link, '_blank');
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
            const est     = estadoColores[reserva.estado] || estadoColores.pendiente;
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
                      📅 Fecha viaje: {reserva.fechaId} &nbsp;|&nbsp;
                      👥 {reserva.numViajeros} persona(s) &nbsp;|&nbsp;
                      💰 ${reserva.totalPagar}
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
                        onClick={() => confirmarReserva(reserva)}
                        style={btnStyle('#1D9E75')}
                      >
                        {procesando === reserva.id ? '⏳ Procesando...' : '✅ Confirmar'}
                      </button>
                      <button
                        disabled={procesando === reserva.id}
                        onClick={() => {
                          const motivo = prompt('Motivo de cancelación (opcional):') || '';
                          cancelarReserva(reserva, motivo);
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

                {/* Confirmaciones visuales */}
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {emailEnviado[reserva.id] && (
                    <p style={{ margin: 0, fontSize: 12, color: '#1D9E75' }}>
                      ✉️ Correo de confirmación enviado al cliente
                    </p>
                  )}
                  {whatsappLinks[reserva.id] && (
                    <p style={{ margin: 0, fontSize: 12, color: '#25D366' }}>
                      💬 WhatsApp abierto — puedes reenviarlo con el botón verde
                    </p>
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
  background: bg,
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 'bold',
});
