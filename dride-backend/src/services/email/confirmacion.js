import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})

export async function enviarConfirmacion({ destinatario, nombre, reserva, paquete }) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;">
      <div style="background:#0A2A1E;padding:20px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;margin:0;">D'RIDE CON ALE</h1>
        <p style="color:#9FE1CB;font-size:11px;margin:4px 0 0;letter-spacing:2px;">AGENCIA DE VIAJES</p>
      </div>
      <div style="background:#E1F5EE;padding:24px;text-align:center;">
        <h2 style="color:#0A2A1E;margin:0 0 8px;">¡Reserva confirmada, ${nombre}!</h2>
        <p style="color:#0F6E56;margin:0;">Tu pago fue verificado y tu lugar está asegurado.</p>
      </div>
      <div style="padding:20px;background:#fff;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr><td style="padding:8px;color:#888;border-bottom:1px solid #eee;">Paquete</td><td style="padding:8px;font-weight:600;border-bottom:1px solid #eee;">${paquete.nombre}</td></tr>
          <tr><td style="padding:8px;color:#888;border-bottom:1px solid #eee;">Destino</td><td style="padding:8px;font-weight:600;border-bottom:1px solid #eee;">${paquete.destino}</td></tr>
          <tr><td style="padding:8px;color:#888;border-bottom:1px solid #eee;">Código</td><td style="padding:8px;font-weight:600;color:#1D9E75;border-bottom:1px solid #eee;">${reserva.codigo}</td></tr>
          <tr><td style="padding:8px;color:#888;">Total pagado</td><td style="padding:8px;font-weight:700;color:#0F6E56;">$${reserva.totalPagar.toLocaleString()}</td></tr>
        </table>
      </div>
      <div style="background:#0A2A1E;padding:16px;text-align:center;">
        <p style="color:#5DCAA5;font-size:11px;margin:0;">reservas@drideconale.com · +502 5555-0000</p>
      </div>
    </div>`

  return transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      destinatario,
    subject: `✅ Tu reserva ${reserva.codigo} está confirmada — D'RIDE CON ALE`,
    html,
  })
}
