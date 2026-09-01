import cron   from 'node-cron'
import { db } from '../config/firebase.js'
import { enviarRecordatorioWA } from '../services/whatsapp/mensajes.js'

export function initCronJobs() {

  // ── Recordatorio 7 días antes — todos los días 8:00 AM ────
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Revisando recordatorios...')
    try {
      const hoy     = new Date()
      const en7dias = new Date(hoy)
      en7dias.setDate(hoy.getDate() + 7)

      const snap = await db.collection('reservas')
        .where('estado', '==', 'confirmada')
        .get()

      for (const doc of snap.docs) {
        const r      = doc.data()
        const salida = r.fechaSalida?.toDate?.()
        if (!salida) continue

        const mismoDia =
          salida.getDate()     === en7dias.getDate()     &&
          salida.getMonth()    === en7dias.getMonth()    &&
          salida.getFullYear() === en7dias.getFullYear()

        if (!mismoDia) continue

        const usrSnap = await db.collection('usuarios').doc(r.usuarioId).get()
        const pkgSnap = await db.collection('paquetes').doc(r.paqueteId).get()
        if (!usrSnap.exists || !pkgSnap.exists) continue

        await enviarRecordatorioWA({
          telefono:      usrSnap.data().telefono,
          nombre:        usrSnap.data().nombre,
          paquete:       pkgSnap.data(),
          diasRestantes: 7,
          fechaSalida:   salida.toLocaleDateString('es-GT'),
        })
      }
      console.log('[CRON] Recordatorios OK')
    } catch (e) {
      console.error('[CRON] Error:', e.message)
    }
  }, { timezone: 'America/Guatemala' })

  // ── Alerta día de salida — 4:00 AM ────────────────────────
  cron.schedule('0 4 * * *', async () => {
    console.log('[CRON] Alertas de salida hoy...')
  }, { timezone: 'America/Guatemala' })

  console.log('[CRON] Jobs inicializados')
}
