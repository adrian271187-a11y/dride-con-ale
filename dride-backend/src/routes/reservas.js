import { Router } from 'express'
import { db } from '../config/firebase.js'
import { enviarConfirmacion } from '../services/email/confirmacion.js'

const router = Router()

const generarLinkWA = (telefono, mensaje) => {
  const limpio = telefono.replace(/\D/g, '')
  const numero = limpio.startsWith('506') || limpio.length > 10 ? limpio : `506${limpio}`
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

// GET /api/reservas
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('reservas')
      .orderBy('creadaEn', 'desc')
      .limit(100)
      .get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json({ ok: true, data })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// GET /api/reservas/:id
router.get('/:id', async (req, res) => {
  try {
    const snap = await db.collection('reservas').doc(req.params.id).get()
    if (!snap.exists) return res.status(404).json({ ok: false, error: 'No encontrada' })
    res.json({ ok: true, data: { id: snap.id, ...snap.data() } })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// PATCH /api/reservas/:id/confirmar
router.patch('/:id/confirmar', async (req, res) => {
  try {
    const reservaId = req.params.id
    const snap = await db.collection('reservas').doc(reservaId).get()
    if (!snap.exists) return res.status(404).json({ ok: false, error: 'No encontrada' })

    const reserva = { id: reservaId, ...snap.data() }

    await db.collection('reservas').doc(reservaId).update({
      estado: 'confirmada',
      confirmadaEn: new Date(),
    })

    // Email automático
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
        console.error('Error email confirmacion:', emailErr.message)
      }
    }

    // Link WhatsApp para el admin
    const mensajeWA = `🎉 ¡Hola ${reserva.clienteNombre}!\n\nTu reserva en *D'RIDE CON ALE* ha sido *CONFIRMADA* ✅\n\n📦 *Paquete:* ${reserva.paqueteNombre}\n📅 *Fecha:* ${reserva.fecha}\n👥 *Personas:* ${reserva.personas}\n💰 *Total:* $${reserva.total}\n\n¡Prepárate para vivir una experiencia increíble! 🌟`

    const whatsappLink = reserva.clienteTelefono
      ? generarLinkWA(reserva.clienteTelefono, mensajeWA)
      : null

    // Guardar notificación
    await db.collection('notificaciones').add({
      tipo: 'reserva_confirmada',
      reservaId,
      clienteNombre: reserva.clienteNombre,
      emailEnviado,
      whatsappLink,
      creadaEn: new Date(),
      leida: false,
    })

    res.json({ ok: true, emailEnviado, whatsappLink })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// PATCH /api/reservas/:id/cancelar
router.patch('/:id/cancelar', async (req, res) => {
  try {
    const reservaId = req.params.id
    const { motivo = '' } = req.body
    const snap = await db.collection('reservas').doc(reservaId).get()
    if (!snap.exists) return res.status(404).json({ ok: false, error: 'No encontrada' })

    const reserva = { id: reservaId, ...snap.data() }

    await db.collection('reservas').doc(reservaId).update({
      estado: 'cancelada',
      canceladaEn: new Date(),
      motivo,
    })

    const mensajeWA = `Hola ${reserva.clienteNombre},\n\nLamentamos informarte que tu reserva para *${reserva.paqueteNombre}* del *${reserva.fecha}* ha sido cancelada.${motivo ? `\n\nMotivo: ${motivo}` : ''}\n\nSi tienes dudas, contáctanos. 🙏\n\n*D'RIDE CON ALE*`

    const whatsappLink = reserva.clienteTelefono
      ? generarLinkWA(reserva.clienteTelefono, mensajeWA)
      : null

    await db.collection('notificaciones').add({
      tipo: 'reserva_cancelada',
      reservaId,
      clienteNombre: reserva.clienteNombre,
      emailEnviado: false,
      whatsappLink,
      motivo,
      creadaEn: new Date(),
      leida: false,
    })

    res.json({ ok: true, whatsappLink })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

export default router
