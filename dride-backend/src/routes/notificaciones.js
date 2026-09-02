import { Router } from 'express'
import { db } from '../config/firebase.js'
import { enviarConfirmacion } from '../services/email/confirmacion.js'

const router = Router()

// ── Helpers ────────────────────────────────────────────────

const generarLinkWA = (telefono, mensaje) => {
  const limpio = telefono.replace(/\D/g, '')
  const numero = limpio.startsWith('506') || limpio.length > 10 ? limpio : `506${limpio}`
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

const mensajeWACreada = (r) =>
  `Hola ${r.nombre} 👋\n\nRecibimos tu solicitud de reserva en *D'RIDE CON ALE* 🌿\n\n📦 *Paquete:* ${r.paqueteNombre}\n📅 *Fecha:* ${r.fechaSalida || ''}\n👥 *Viajeros:* ${r.numViajeros}\n💰 *Total:* $${r.totalPagar}\n\nTu reserva está *pendiente de confirmación*. Pronto te contactaremos. 🙏`

const mensajeWAConfirmada = (r) =>
  `🎉 ¡Hola ${r.nombre}!\n\nTu reserva en *D'RIDE CON ALE* ha sido *CONFIRMADA* ✅\n\n📦 *Paquete:* ${r.paqueteNombre}\n📅 *Fecha:* ${r.fechaSalida || ''}\n👥 *Viajeros:* ${r.numViajeros}\n💰 *Total:* $${r.totalPagar}\n\n¡Prepárate para vivir una experiencia increíble! 🌟`

const mensajeWACancelada = (r, motivo) =>
  `Hola ${r.nombre},\n\nLamentamos informarte que tu reserva para *${r.paqueteNombre}* ha sido cancelada.${motivo ? `\n\nMotivo: ${motivo}` : ''}\n\nSi tienes dudas, contáctanos. 🙏\n\n*D'RIDE CON ALE*`

// Obtiene reserva + usuario + paquete en paralelo
const obtenerDatos = async (reservaId) => {
  const reservaSnap = await db.collection('reservas').doc(reservaId).get()
  if (!reservaSnap.exists) return null
  const reserva = { id: reservaId, ...reservaSnap.data() }

  const [usuarioSnap, paqueteSnap, fechaSnap] = await Promise.all([
    reserva.usuarioId ? db.collection('usuarios').doc(reserva.usuarioId).get() : Promise.resolve(null),
    reserva.paqueteId ? db.collection('paquetes').doc(reserva.paqueteId).get() : Promise.resolve(null),
    reserva.fechaId   ? db.collection('fechas_paquete').doc(reserva.fechaId).get() : Promise.resolve(null),
  ])

  const usuario = usuarioSnap?.exists ? usuarioSnap.data() : {}
  const paquete = paqueteSnap?.exists ? paqueteSnap.data() : {}
  const fecha   = fechaSnap?.exists   ? fechaSnap.data()   : {}

  return {
    // reserva
    id: reservaId,
    codigo: reserva.codigo || reservaId,
    numViajeros: reserva.numViajeros || reserva.personas || 1,
    totalPagar: reserva.totalPagar || reserva.total || 0,
    tipoHabitacion: reserva.tipoHabitacion || '',
    estado: reserva.estado,
    // usuario
    nombre: usuario.nombre || usuario.displayName || 'Cliente',
    email: usuario.email || '',
    telefono: usuario.telefono || usuario.phone || '',
    // paquete
    paqueteNombre: paquete.nombre || reserva.paqueteNombre || '',
    paqueteDestino: paquete.destino || '',
    // fecha
    fechaSalida: fecha.fecha || fecha.fechaSalida || '',
  }
}

const guardarNotificacion = async (datos) => {
  await db.collection('notificaciones').add({
    ...datos,
    creadaEn: new Date(),
    leida: false,
  })
}

// ── GET /api/notificaciones ────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('notificaciones')
      .orderBy('creadaEn', 'desc')
      .limit(50)
      .get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json({ ok: true, data })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── POST /api/notificaciones/reserva-creada ───────────────

router.post('/reserva-creada', async (req, res) => {
  try {
    const { reservaId } = req.body
    const d = await obtenerDatos(reservaId)
    if (!d) return res.status(404).json({ ok: false, error: 'Reserva no encontrada' })

    const whatsappLink = d.telefono ? generarLinkWA(d.telefono, mensajeWACreada(d)) : null

    let emailEnviado = false
    if (d.email) {
      try {
        await enviarConfirmacion({
          destinatario: d.email,
          nombre: d.nombre,
          reserva: { codigo: d.codigo, totalPagar: d.totalPagar },
          paquete: { nombre: d.paqueteNombre, destino: d.fechaSalida },
        })
        emailEnviado = true
      } catch (err) { console.error('Email error:', err.message) }
    }

    await guardarNotificacion({ tipo: 'reserva_creada', reservaId, clienteNombre: d.nombre, emailEnviado, whatsappLink })
    res.json({ ok: true, whatsappLink, emailEnviado })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── POST /api/notificaciones/reserva-confirmada ───────────

router.post('/reserva-confirmada', async (req, res) => {
  try {
    const { reservaId } = req.body
    const d = await obtenerDatos(reservaId)
    if (!d) return res.status(404).json({ ok: false, error: 'Reserva no encontrada' })

    const whatsappLink = d.telefono ? generarLinkWA(d.telefono, mensajeWAConfirmada(d)) : null

    let emailEnviado = false
    if (d.email) {
      try {
        await enviarConfirmacion({
          destinatario: d.email,
          nombre: d.nombre,
          reserva: { codigo: d.codigo, totalPagar: d.totalPagar },
          paquete: { nombre: d.paqueteNombre, destino: d.fechaSalida },
        })
        emailEnviado = true
      } catch (err) { console.error('Email error:', err.message) }
    }

    await guardarNotificacion({ tipo: 'reserva_confirmada', reservaId, clienteNombre: d.nombre, emailEnviado, whatsappLink })
    res.json({ ok: true, whatsappLink, emailEnviado })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── POST /api/notificaciones/reserva-cancelada ────────────

router.post('/reserva-cancelada', async (req, res) => {
  try {
    const { reservaId, motivo = '' } = req.body
    const d = await obtenerDatos(reservaId)
    if (!d) return res.status(404).json({ ok: false, error: 'Reserva no encontrada' })

    const whatsappLink = d.telefono ? generarLinkWA(d.telefono, mensajeWACancelada(d, motivo)) : null

    await guardarNotificacion({ tipo: 'reserva_cancelada', reservaId, clienteNombre: d.nombre, emailEnviado: false, whatsappLink, motivo })
    res.json({ ok: true, whatsappLink })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── GET /api/notificaciones/whatsapp-link/:reservaId/:tipo ─

router.get('/whatsapp-link/:reservaId/:tipo', async (req, res) => {
  try {
    const { reservaId, tipo } = req.params
    const d = await obtenerDatos(reservaId)
    if (!d) return res.status(404).json({ ok: false, error: 'Reserva no encontrada' })

    const mensajes = {
      creada: mensajeWACreada(d),
      confirmada: mensajeWAConfirmada(d),
      cancelada: mensajeWACancelada(d, ''),
    }

    const whatsappLink = d.telefono && mensajes[tipo] ? generarLinkWA(d.telefono, mensajes[tipo]) : null
    res.json({ ok: true, whatsappLink })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── PATCH /api/notificaciones/:id/leida ───────────────────

router.patch('/:id/leida', async (req, res) => {
  try {
    await db.collection('notificaciones').doc(req.params.id).update({ leida: true })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

export default router
