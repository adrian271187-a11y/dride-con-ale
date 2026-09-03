import { useEffect, useState }              from 'react'
import { View, Text, StyleSheet,
         ScrollView, TouchableOpacity }     from 'react-native'
import { useLocalSearchParams, useRouter }  from 'expo-router'
import { doc, getDoc }                      from 'firebase/firestore'
import { SafeAreaView }                     from 'react-native-safe-area-context'
import { db }                               from '@/services/firebase'
import { Colors }                           from '@/src/constants/colors'
import Button                               from '@/src/components/ui/Button'

export default function Confirmacion() {
  const { id }  = useLocalSearchParams()
  const router  = useRouter()
  const [reserva, setReserva] = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'reservas', id)).then(s => {
      if (s.exists()) setReserva({ id: s.id, ...s.data() })
    })
  }, [id])

  if (!reserva) return <View style={styles.center}><Text>Cargando...</Text></View>

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎉</Text>
          <Text style={styles.heroTitulo}>¡Reserva enviada!</Text>
          <Text style={styles.heroSub}>Nos pondremos en contacto contigo pronto para confirmar los detalles.</Text>
        </View>

        <View style={styles.card}>
          <Row label="Paquete"   value={reserva.paqueteNombre} />
          <Row label="Personas"  value={`${reserva.personas}`} />
          <Row label="Salida"    value={reserva.fechaSalida ?? '—'} />
          <Row label="Total"     value={`$${reserva.total?.toLocaleString()}`} bold />
          <Row label="Estado"    value={reserva.estado} capitalize />
        </View>

        <View style={styles.pasoCard}>
          <Text style={styles.pasoTitulo}>¿Qué sigue?</Text>
          <Text style={styles.paso}>1. Recibirás confirmación por correo</Text>
          <Text style={styles.paso}>2. Te contactaremos por WhatsApp</Text>
          <Text style={styles.paso}>3. Realizas el pago para asegurar tu lugar</Text>
        </View>

        <Button title="Ver mis reservas"   onPress={() => router.replace('/reservas')} style={{ marginBottom: 10 }} />
        <Button title="Seguir explorando"  onPress={() => router.replace('/')} variant="outline" />
      </ScrollView>
    </SafeAreaView>
  )
}

function Row({ label, value, bold, capitalize }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontWeight: '800', color: Colors.verde },
                    capitalize && { textTransform: 'capitalize' }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.gris1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container:   { padding: 24, paddingBottom: 40 },
  hero:        { alignItems: 'center', marginBottom: 24 },
  heroEmoji:   { fontSize: 56, marginBottom: 12 },
  heroTitulo:  { fontSize: 22, fontWeight: '800', color: Colors.textoPrimario, marginBottom: 8 },
  heroSub:     { fontSize: 13, color: Colors.textoSecundario, textAlign: 'center', lineHeight: 20 },
  card:        { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
                 borderBottomWidth: 0.5, borderBottomColor: Colors.gris2 },
  rowLabel:    { fontSize: 13, color: Colors.textoMuted },
  rowValue:    { fontSize: 13, color: Colors.textoPrimario, fontWeight: '600' },
  pasoCard:    { backgroundColor: Colors.verdeClaro, borderRadius: 14, padding: 16, marginBottom: 20 },
  pasoTitulo:  { fontSize: 13, fontWeight: '700', color: Colors.verdeMedio, marginBottom: 8 },
  paso:        { fontSize: 13, color: Colors.verdeMedio, marginBottom: 4 },
})
