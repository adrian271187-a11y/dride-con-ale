import { Router }             from 'express'
import { db }                 from '../config/firebase.js'
import { enviarConfirmacion } from '../services/email/confirmacion.js'
import { enviarConfirmacionWA } from '../services/whatsapp/mensajes.js'
import admin                  from '../config/firebase.js'

const router = Router()

// POST /api/pagos/:pagoId/aprobar
router.post('/:pagoId/aprobar', async (req, res) => {
  const { pagoId } = req.params
  try {
    const pagoRef  = db.collection('pagos').doc(pagoId)
    const pagoSnap = await pagoRef.get()
    if (!pagoSnap.exists) return res.status(404).json({ error: 'Pago no encontrado' })

    const pago     = pagoSnap.data()
    const resvSnap = await db.collection('reservas').doc(pago.resvId).get()
    const reserva  = resvSnap.data()
    const usrSnap  = await db.collection('usuarios').doc(pago.usuarioId).get()
    const usuario  = usrSnap.data()
    const pkgSnap  = await db.collection('paquetes').doc(reserva.paqueteId).get()
    const paquete  = pkgSnap.data()

    // Transacción: aprobar pago + confirmar reserva
    await db.runTransaction(async (t) => {
      t.update(pagoRef, { estado: 'aprobado', aprobadoEn: admin.firestore.FieldValue.serverTimestamp() })
      t.update(db.collection('reservas').doc(pago.resvId), { estado: 'confirmada' })
    })

    // Notificaciones automáticas
    await Promise.allSettled([
      enviarConfirmacion({ destinatario: usuario.email, nombre: usuario.nombre, reserva, paquete }),
      enviarConfirmacionWA({ telefono: usuario.telefono, nombre: usuario.nombre, reserva, paquete }),
    ])

    res.json({ ok: true, mensaje: 'Pago aprobado y notificaciones enviadas' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

export default router
