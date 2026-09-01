import { Router } from 'express'
import { db }     from '../config/firebase.js'

const router = Router()

// GET /api/notificaciones
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('notificaciones')
      .orderBy('programadaEn', 'desc')
      .limit(50)
      .get()
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json({ ok: true, data })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

export default router
