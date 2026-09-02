import { Router } from 'express'
import { db } from '../config/firebase.js'
import { enviarConfirmacion } from '../services/email/confirmacion.js'
import { enviarConfirmacionWA } from '../services/whatsapp/index.js'

const router = Router()

// ── Helpers ────────────────────────────────────────────────

const generarLinkWA = (telefono, mensaje) => {
  const limpio = telefono.replace(/\D/g, '')
  const numero = limpio.startsWith('506') || limpio.length > 10 ? limpio : `506${limpio}`
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

const mensajeWACreada = (reserva) =>
  `Hola ${reserva.clienteNombre} 👋\n\nRecibimos tu solicitud de reserva en *D'RIDE CON ALE* 🌿\n\n📦 *Paquete:* ${reserva.paqueteNombre}\n📅 *Fecha:* ${reserva.fecha}\n👥 *Personas:* ${reserva.personas}\n💰 *Total:* $${reserva.total}\n\nTu reserva está *pendiente de confirmación*. Pronto te contactaremos. 🙏`

const mensajeWAConfirmada = (reserva) =>
  `🎉 ¡Hola ${reserva.clienteNombre}!\n\nTu reserva en *D'RIDE CON ALE* ha sido *CONFIRMADA* ✅\n\n📦 *Paquete:* ${reserva.paqueteNombre}\n📅 *Fecha:* ${reserva.fecha}\n👥 *Personas:* ${reserva.personas}\n💰 *Total:* $${reserva.total}\n\n¡Prepárate para vivir una experiencia increíble! 🌟`

const mensajeWACancelada = (reserva, motivo) =>
  `Hola ${reserva.clienteNombre},\n\nLamentamos informarte que tu reserva para *${reserva.paqueteNombre}* del *${reserva.fecha}* ha sido cancelada.${motivo ? `\n\nMotivo: ${motivo}` : ''}\n\nSi tienes dudas, contáctanos. 🙏\n\n*D'RIDE CON ALE*`

const obtenerReserva = async (reservaId) => {
  const snap = await db.collection('reservas').doc(reservaId).get()
  if (!snap.exists) return null
  return { id: reservaId, ...snap.data() }
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
    const reserva = await obtenerReserva(reservaId)
    if (!reserva) return res.status(404).json({ ok: false, error: 'Reserva no encontrada' })

    // Link WhatsApp (admin lo usa manualmente)
    const whatsappLink = reserva.clienteTelefono
      ? generarLinkWA(reserva.clienteTelefono, mensajeWACreada(reserva))
      : null

    // Email al cliente
    let emailEnviado = false
    if (reserva.clienteEmail) {
      try {
        await enviarConfirmacion({
          destinatario: reserva.clienteEmail,
          nombre: reserva.clienteNombre,
          reserva: { codigo: reservaId, totalPagar: reserva.total, ...reserva },
          paquete: { nombre: reserva.paqueteNombre, destino: reserva.fecha },
        })
        emailEnviado = true
      } catch (emailErr) {
        console.error('Error email:', emailErr.message)
      }
    }

    await guardarNotificacion({
      tipo: 'reserva_creada',
      reservaId,
      clienteNombre: reserva.clienteNombre,
      emailEnviado,
      whatsappLink,
    })

    res.json({ ok: true, whatsappLink, emailEnviado })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── POST /api/notificaciones/reserva-confirmada ───────────

router.post('/reserva-confirmada', async (req, res) => {
  try {
    const { reservaId } = req.body
    const reserva = await obtenerReserva(reservaId)
    if (!reserva) return res.status(404).json({ ok: false, error: 'Reserva no encontrada' })

    const whatsappLink = reserva.clienteTelefono
      ? generarLinkWA(reserva.clienteTelefono, mensajeWAConfirmada(reserva))
      : null

    let emailEnviado = false
    if (reserva.clienteEmail) {
      try {
        await enviarConfirmacion({
          destinatario: reserva.clienteEmail,
          nombre: reserva.clienteNombre,
          reserva: { codigo: reservaId, totalPagar: reserva.total, ...reserva },
          paquete: { nombre: reserva.paqueteNombre, destino: reserva.fecha },
        })
        emailEnviado = true
      } catch (emailErr) {
        console.error('Error email:', emailErr.message)
      }
    }

    await guardarNotificacion({
      tipo: 'reserva_confirmada',
      reservaId,
      clienteNombre: reserva.clienteNombre,
      emailEnviado,
      whatsappLink,
    })

    res.json({ ok: true, whatsappLink, emailEnviado })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── POST /api/notificaciones/reserva-cancelada ────────────

router.post('/reserva-cancelada', async (req, res) => {
  try {
    const { reservaId, motivo = '' } = req.body
    const reserva = await obtenerReserva(reservaId)
    if (!reserva) return res.status(404).json({ ok: false, error: 'Reserva no encontrada' })

    const whatsappLink = reserva.clienteTelefono
      ? generarLinkWA(reserva.clienteTelefono, mensajeWACancelada(reserva, motivo))
      : null

    await guardarNotificacion({
      tipo: 'reserva_cancelada',
      reservaId,
      clienteNombre: reserva.clienteNombre,
      emailEnviado: false,
      whatsappLink,
      motivo,
    })

    res.json({ ok: true, whatsappLink })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── GET /api/notificaciones/whatsapp-link/:reservaId/:tipo ─

router.get('/whatsapp-link/:reservaId/:tipo', async (req, res) => {
  try {
    const { reservaId, tipo } = req.params
    const reserva = await obtenerReserva(reservaId)
    if (!reserva) return res.status(404).json({ ok: false, error: 'Reserva no encontrada' })

    const mensajes = {
      creada: mensajeWACreada(reserva),
      confirmada: mensajeWAConfirmada(reserva),
      cancelada: mensajeWACancelada(reserva, ''),
    }

    const whatsappLink = reserva.clienteTelefono && mensajes[tipo]
      ? generarLinkWA(reserva.clienteTelefono, mensajes[tipo])
      : null

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
