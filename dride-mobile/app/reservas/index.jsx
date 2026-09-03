import { useEffect, useState }              from 'react'
import { View, Text, FlatList,
         StyleSheet, TouchableOpacity }     from 'react-native'
import { useRouter }                        from 'expo-router'
import { collection, query, where,
         orderBy, getDocs }                 from 'firebase/firestore'
import { SafeAreaView }                     from 'react-native-safe-area-context'
import { db }                               from '@/services/firebase'
import { useAuth }                          from '@/src/context/AuthContext'
import { Colors }                           from '@/src/constants/colors'
import { format }                           from 'date-fns'
import { es }                               from 'date-fns/locale'

const estadoColor = {
  pendiente:  { bg: '#FAEEDA', txt: '#633806' },
  confirmada: { bg: Colors.verdeClaro, txt: '#085041' },
  cancelada:  { bg: '#FCEBEB', txt: '#A32D2D' },
  pagada:     { bg: '#E8F0FE', txt: '#1A56BB' },
}

export default function MisReservas() {
  const { user }  = useAuth()
  const router    = useRouter()
  const [reservas, setReservas]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!user) return
    async function cargar() {
      try {
        const q    = query(collection(db, 'reservas'), where('usuarioId', '==', user.uid), orderBy('creadaEn', 'desc'))
        const snap = await getDocs(q)
        setReservas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    cargar()
  }, [user])

  function renderReserva({ item: r }) {
    const ec  = estadoColor[r.estado] || estadoColor.pendiente
    const fecha = r.creadaEn?.toDate ? format(r.creadaEn.toDate(), "d MMM yyyy", { locale: es }) : '—'
    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/reservas/${r.id}/confirmacion`)}>
        <View style={styles.cardTop}>
          <Text style={styles.cardNombre} numberOfLines={1}>{r.paqueteNombre ?? 'Paquete'}</Text>
          <View style={[styles.badge, { backgroundColor: ec.bg }]}>
            <Text style={[styles.badgeTxt, { color: ec.txt }]}>{r.estado}</Text>
          </View>
        </View>
        <Text style={styles.cardInfo}>📅 Salida: {r.fechaSalida ?? '—'}</Text>
        <Text style={styles.cardInfo}>👥 {r.personas ?? 1} persona(s)</Text>
        <Text style={styles.cardFecha}>Reservado el {fecha}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.titulo}>📋 Mis Reservas</Text>
      </View>

      {loading ? (
        <Text style={styles.info}>Cargando...</Text>
      ) : reservas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🧳</Text>
          <Text style={styles.emptyTxt}>Aún no tienes reservas</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.emptyLink}>Explorar paquetes →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={i => i.id}
          renderItem={renderReserva}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.gris1 },
  header:     { backgroundColor: Colors.verdeOscuro, padding: 20 },
  titulo:     { fontSize: 20, fontWeight: '800', color: '#fff' },
  lista:      { padding: 16 },
  card:       { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
                borderWidth: 0.5, borderColor: Colors.gris2 },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardNombre: { fontSize: 14, fontWeight: '700', color: Colors.textoPrimario, flex: 1, marginRight: 8 },
  badge:      { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeTxt:   { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  cardInfo:   { fontSize: 12, color: Colors.textoSecundario, marginBottom: 2 },
  cardFecha:  { fontSize: 11, color: Colors.textoMuted, marginTop: 6 },
  info:       { textAlign: 'center', marginTop: 40, color: Colors.textoMuted },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTxt:   { fontSize: 15, color: Colors.textoSecundario, marginBottom: 8 },
  emptyLink:  { color: Colors.verde, fontWeight: '700', fontSize: 14 },
})
