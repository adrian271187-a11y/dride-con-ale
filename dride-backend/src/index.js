import express     from 'express'
import cors        from 'cors'
import helmet      from 'helmet'
import rateLimit   from 'express-rate-limit'
import dotenv      from 'dotenv'
import pagosRouter        from './routes/pagos.js'
import notifRouter        from './routes/notificaciones.js'
import reservasRouter     from './routes/reservas.js'
import { initCronJobs }   from './cron/recordatorios.js'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ──────────────────────────────────────────────
app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }))
app.use(express.json({ limit: '5mb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

// ── Rutas ──────────────────────────────────────────────────
app.use('/api/pagos',          pagosRouter)
app.use('/api/notificaciones', notifRouter)
app.use('/api/reservas',       reservasRouter)

app.get('/health', (_, res) => res.json({ status: 'ok', app: "D'RIDE CON ALE API" }))

// ── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ── Iniciar ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`D'RIDE CON ALE API corriendo en puerto ${PORT}`)
  initCronJobs()
})
