import cron     from 'node-cron'
import { db }   from '../config/firebase.js'
import { enviarRecordatorioWA } from '../services/whatsapp/mensajes.js'
import { addDays, isSameDay, parseISO } from 'date-fns'

export function initCronJobs() {
  // ── Ejecutar todos los días a las 8:00 AM ──────────────────
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Revisando recordatorios de viaje...')
    try {
      const hoy         = new Date()
      const en7dias     = addDays(hoy, 7)
      const manana      = addDays(hoy, 1)

      const snap = await db.collection('reservas')
        .where('estado', '==', 'confirmada')
        .get()

      for (const doc of snap.docs) {
        const r        = doc.data()
        const salida   = r.fechaSalida?.toDate?.() || parseISO(r.fechaSalida)
        const usuSnap  = await db.collection('usuarios').doc(r.usuarioId).get()
        const usuario  = usuSnap.data()
        const pkgSnap  = await db.collection('paquetes').doc(r.paqueteId).get()
        const paquete  = pkgSnap.data()

        // Recordatorio 7 días antes
        if (isSameDay(salida, en7dias)) {
          await enviarRecordatorioWA({
            telefono:      usuario.telefono,
            nombre:        usuario.nombre,
            paquete,
            diasRestantes: 7,
            fechaSalida:   salida.toLocaleDateString('es-GT'),
          })
        }
      }
      console.log('[CRON] Recordatorios enviados OK')
    } catch (e) {
      console.error('[CRON] Error:', e.message)
    }
  }, { timezone: 'America/Guatemala' })

  // ── Recordatorio día de salida a las 4:00 AM ───────────────
  cron.schedule('0 4 * * *', async () => {
    console.log('[CRON] Enviando alertas de salida hoy...')
  }, { timezone: 'America/Guatemala' })

  console.log('[CRON] Jobs inicializados — zona: America/Guatemala')
}
