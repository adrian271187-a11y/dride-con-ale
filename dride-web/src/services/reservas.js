import { collection, doc, getDocs, addDoc,
         updateDoc, serverTimestamp,
         query, where, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import { auth } from './firebase'

const COL = 'reservas'

export const getMisReservas = async () => {
  const uid = auth.currentUser?.uid
  if (!uid) return []
  const q = query(
    collection(db, COL),
    where('usuarioId', '==', uid),
    orderBy('creadaEn', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getAllReservas = async () => {
  const q = query(collection(db, COL), orderBy('creadaEn', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const crearReserva = async (data) => {
  const uid = auth.currentUser?.uid
  const codigo = `RES-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
  return addDoc(collection(db, COL), {
    ...data,
    usuarioId: uid,
    codigo,
    estado: 'pendiente',
    creadaEn: serverTimestamp(),
  })
}

export const cancelarReserva = async (id) => {
  return updateDoc(doc(db, COL, id), { estado: 'cancelada' })
}

export const confirmarReserva = async (id) => {
  return updateDoc(doc(db, COL, id), {
    estado: 'confirmada',
    confirmadaEn: serverTimestamp(),
  })
}
