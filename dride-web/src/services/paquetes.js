import { collection, doc, getDocs, getDoc,
         addDoc, updateDoc, serverTimestamp,
         query, where, orderBy } from 'firebase/firestore'
import { db } from './firebase'

const COL = 'paquetes'

export const getPaquetes = async (soloActivos = true) => {
  const q = soloActivos
    ? query(collection(db, COL), where('activo', '==', true), orderBy('nombre'))
    : query(collection(db, COL), orderBy('nombre'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getPaquete = async (id) => {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const crearPaquete = async (data) => {
  return addDoc(collection(db, COL), {
    ...data,
    activo: true,
    creadoEn: serverTimestamp(),
  })
}

export const actualizarPaquete = async (id, data) => {
  return updateDoc(doc(db, COL, id), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })
}
