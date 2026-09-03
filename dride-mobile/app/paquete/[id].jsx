import { useEffect, useState }              from 'react'
import { View, Text, ScrollView,
         StyleSheet, TouchableOpacity }     from 'react-native'
import { useLocalSearchParams, useRouter }  from 'expo-router'
import { doc, getDoc }                      from 'firebase/firestore'
import { SafeAreaView }                     from 'react-native-safe-area-context'
import { db }                               from '@/services/firebase'
import { Colors }                           from '@/src/constants/colors'
import Button                               from '@/src/components/ui/Button'

const EMOJIS = { playa: '🏖️', europa: '🗺️', aventura: '🏔️', asia: '🌸', default: '✈️' }

export default function DetallePaquete() {
  const { id }  = useLocalSearchParams()
  const router  = useRouter()
  const [pkg, setPkg]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const snap = await getDoc(doc(db, 'paquetes', id))
      if (snap.exists()) setPkg({ id: snap.id, ...snap.data() })
      setLoading(false)
    }
    cargar()
  }, [id])

  if (loading) return <View style={styles.center}><Text>Cargando...</Text></View>
  if (!pkg)    return <View style={styles.center}><Text>Paquete no encontrado</Text></View>

  const emoji = EMOJIS[pkg.categoria] || EMOJIS.default

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>{emoji}</Text>
          <Text style={styles.heroNombre}>{pkg.nombre}</Text>
          <Text style={styles.heroDestino}>{pkg.destino}</Text>
        </View>

        <View style={styles.body}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <Stat label="Duración" value={`${pkg.duracionDias} días`} />
            <Stat label="Precio" value={`$${pkg.precioPorPersona?.toLocaleString()}`} />
            <Stat label="Cupos" value={pkg.cuposDisponibles ?? '—'} />
          </View>

          {/* Descripción */}
          {!!pkg.descripcion && (
            <Section title="Descripción">
              <Text style={styles.desc}>{pkg.descripcion}</Text>
            </Section>
          )}

          {/* Incluye */}
          {!!pkg.incluye?.length && (
            <Section title="¿Qué incluye?">
              {pkg.incluye.map((item, i) => (
                <Text key={i} style={styles.item}>✓ {item}</Text>
              ))}
            </Section>
          )}

          {/* Itinerario */}
          {!!pkg.itinerario?.length && (
            <Section title="Itinerario">
              {pkg.itinerario.map((dia, i) => (
                <View key={i} style={styles.diaRow}>
                  <View style={styles.diaBadge}><Text style={styles.diaN}>Día {i + 1}</Text></View>
                  <Text style={styles.diaTexto}>{dia}</Text>
                </View>
              ))}
            </Section>
          )}

          <Button
            title={pkg.estado === 'agotado' ? 'Agotado' : 'Reservar ahora'}
            disabled={pkg.estado === 'agotado'}
            onPress={() => router.push(`/reservas/nueva?paqueteId=${id}`)}
            style={{ marginTop: 8, marginBottom: 32 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  )
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.gris1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero:        { backgroundColor: Colors.verdeOscuro, padding: 24, paddingTop: 16, alignItems: 'center' },
  back:        { alignSelf: 'flex-start', marginBottom: 16 },
  backText:    { color: '#fff', fontSize: 22 },
  heroEmoji:   { fontSize: 52, marginBottom: 12 },
  heroNombre:  { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroDestino: { fontSize: 13, color: Colors.menta, marginTop: 4 },
  body:        { padding: 20 },
  statsRow:    { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
                 padding: 16, marginBottom: 16, justifyContent: 'space-around' },
  stat:        { alignItems: 'center' },
  statVal:     { fontSize: 16, fontWeight: '700', color: Colors.verde },
  statLbl:     { fontSize: 11, color: Colors.textoMuted, marginTop: 2 },
  section:     { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12 },
  sectionTitle:{ fontSize: 14, fontWeight: '700', color: Colors.textoPrimario, marginBottom: 10 },
  desc:        { fontSize: 13, color: Colors.textoSecundario, lineHeight: 20 },
  item:        { fontSize: 13, color: Colors.textoSecundario, marginBottom: 4 },
  diaRow:      { flexDirection: 'row', marginBottom: 8, gap: 10 },
  diaBadge:    { backgroundColor: Colors.verdeClaro, borderRadius: 8, paddingHorizontal: 8,
                 paddingVertical: 3, alignSelf: 'flex-start' },
  diaN:        { fontSize: 11, fontWeight: '700', color: Colors.verdeMedio },
  diaTexto:    { flex: 1, fontSize: 13, color: Colors.textoSecundario, lineHeight: 18 },
})
