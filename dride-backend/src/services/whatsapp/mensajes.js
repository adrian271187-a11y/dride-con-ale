import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const FROM   = process.env.TWILIO_WHATSAPP_FROM

export async function enviarConfirmacionWA({ telefono, nombre, reserva, paquete }) {
  const mensaje = `¡Hola, *${nombre}*! 🎉\n\nTu reserva ha sido *confirmada*. Aquí el resumen:\n\n📦 *Paquete:* ${paquete.nombre}\n📍 *Destino:* ${paquete.destino}\n✈️ *Salida:* ${reserva.fechaSalida}\n👥 *Viajeros:* ${reserva.numViajeros} adultos\n💰 *Total:* $${reserva.totalPagar.toLocaleString()}\n\n🔑 Código de reserva:\n*${reserva.codigo}*\n\nUn asesor se comunicará contigo en 24 horas. 🌴`

  return client.messages.create({
    from: FROM,
    to:   `whatsapp:${telefono}`,
    body: mensaje,
  })
}

export async function enviarRecordatorioWA({ telefono, nombre, paquete, diasRestantes, fechaSalida }) {
  const mensaje = `⏰ *Recordatorio D'RIDE CON ALE*\n\n¡*${nombre}*, tu viaje a *${paquete.destino}* está a *${diasRestantes} días*!\n\n📅 Salida: *${fechaSalida}*\n🕔 Punto de encuentro: 05:30 AM\n\n¿Tienes dudas? Escríbenos aquí. 😊`

  return client.messages.create({ from: FROM, to: `whatsapp:${telefono}`, body: mensaje })
}
