import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
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
          <tr><td style="padding:8px;color:#888;border-bottom:1px solid #eee;">Fecha</td><td style="padding:8px;font-weight:600;border-bottom:1px solid #eee;">${paquete.destino}</td></tr>
          <tr><td style="padding:8px;color:#888;border-bottom:1px solid #eee;">Código</td><td style="padding:8px;font-weight:600;color:#1D9E75;border-bottom:1px solid #eee;">${reserva.codigo}</td></tr>
          <tr><td style="padding:8px;color:#888;">Total</td><td style="padding:8px;font-weight:700;color:#0F6E56;">$${Number(reserva.totalPagar).toLocaleString()}</td></tr>
        </table>
      </div>
      <div style="background:#fff8e1;padding:16px;margin:0 20px;">
        <p style="margin:0;font-size:13px;color:#555;"><strong>Datos bancarios:</strong></p>
        <p style="margin:4px 0;font-size:13px;color:#555;">Banco: ${process.env.BANCO_NOMBRE || 'Banco Nacional'}</p>
        <p style="margin:4px 0;font-size:13px;color:#555;">Cuenta: ${process.env.BANCO_CUENTA || 'IBAN: CR00 0000 0000 0000 0000 00'}</p>
        <p style="margin:4px 0;font-size:13px;color:#555;">A nombre de: ${process.env.BANCO_TITULAR || "D'RIDE CON ALE"}</p>
      </div>
      <div style="background:#0A2A1E;padding:16px;text-align:center;margin-top:20px;">
        <p style="color:#5DCAA5;font-size:11px;margin:0;">drideconale@gmail.com</p>
      </div>
    </div>`

  return transporter.sendMail({
    from: `"D'RIDE CON ALE" <${process.env.GMAIL_USER}>`,
    to: destinatario,
    subject: `✅ Tu reserva ${reserva.codigo} está confirmada — D'RIDE CON ALE`,
    html,
  })
}
