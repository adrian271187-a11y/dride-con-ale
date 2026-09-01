import { Router } from 'express'
import { db }     from '../config/firebase.js'

const router = Router()

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
    await db.collection('reservas').doc(req.params.id).update({
      estado: 'confirmada',
      confirmadaEn: new Date(),
    })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

export default router
