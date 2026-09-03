import { initializeApp, getApps } from 'firebase/app'
import { getAuth }                from 'firebase/auth'
import { getFirestore }           from 'firebase/firestore'
import { getStorage }             from 'firebase/storage'

const firebaseConfig = {
  apiKey:            "AIzaSyDxFhRNY6IS9-oJf2KxcuWP6k-fZ-W6C1g",
  authDomain:        "dride-con-ale.firebaseapp.com",
  projectId:         "dride-con-ale",
  storageBucket:     "dride-con-ale.firebasestorage.app",
  messagingSenderId: "191956803622",
  appId:             "1:191956803622:web:64c64ce4e7de77b47a46e7",
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)
