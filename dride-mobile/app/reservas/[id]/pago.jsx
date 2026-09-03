import { useEffect, useState }              from 'react'
import { View, Text, StyleSheet,
         ScrollView, TouchableOpacity }     from 'react-native'
import { useLocalSearchParams, useRouter }  from 'expo-router'
import { doc, getDoc, updateDoc }           from 'firebase/firestore'
import { SafeAreaView }                     from 'react-native-safe-area-context'
import { db }                               from '@/services/firebase'
import { Colors }                           from '@/src/constants/colors'
import Button                               from '@/src/components/ui/Button'

const METODOS = [
  { id: 'transferencia', label: 'Transferencia bancaria', emoji: '🏦' },
  { id: 'efectivo',      label: 'Efectivo en oficina',    emoji: '💵' },
  { id: 'tarjeta',       label: 'Tarjeta de crédito/débito', emoji: '💳' },
]

export default function Pago() {
  const { id }  = useLocalSearchParams()
  const router  = useRouter()
  const [reserva, setReserva]   = useState(null)
  const [metodo, setMetodo]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    getDoc(doc(db, 'reservas', id)).then(s => {
      if (s.exists()) setReserva({ id: s.id, ...s.data() })
    })
  }, [id])

  async function handlePagar() {
    if (!metodo) { setError('Selecciona un método de pago'); return }
    setLoading(true)
    try {
      await updateDoc(doc(db, 'reservas', id), { metodoPago: metodo, estado: 'pagada' })
      router.replace(`/reservas/${id}/confirmacion`)
    } catch (e) {
      setError('Error al registrar pago')
    } finally {
      setLoading(false)
    }
  }

  if (!reserva) return <View style={styles.center}><Text>Cargando...</Text></View>

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Método de pago</Text>
        <Text style={styles.sub}>{reserva.paqueteNombre}</Text>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total a pagar</Text>
          <Text style={styles.totalVal}>${reserva.total?.toLocaleString()}</Text>
        </View>

        <Text style={styles.sectionLabel}>Elige cómo pagar</Text>

        {METODOS.map(m => (
          <TouchableOpacity key={m.id} style={[styles.metodo, metodo === m.id && styles.metodoActive]}
            onPress={() => setMetodo(m.id)}>
            <Text style={styles.metodoEmoji}>{m.emoji}</Text>
            <Text style={[styles.metodoLabel, metodo === m.id && { color: Colors.verde }]}>{m.label}</Text>
            {metodo === m.id && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Button title="Confirmar pago" onPress={handlePagar} loading={loading} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.gris1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container:    { padding: 20, paddingBottom: 40 },
  back:         { marginBottom: 12 },
  backText:     { color: Colors.verde, fontSize: 14, fontWeight: '600' },
  titulo:       { fontSize: 22, fontWeight: '800', color: Colors.textoPrimario },
  sub:          { fontSize: 13, color: Colors.textoSecundario, marginBottom: 20 },
  totalBox:     { backgroundColor: Colors.verdeOscuro, borderRadius: 14, padding: 20,
                  alignItems: 'center', marginBottom: 24 },
  totalLabel:   { fontSize: 12, color: Colors.menta },
  totalVal:     { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textoMuted, marginBottom: 10 },
  metodo:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
                  borderRadius: 12, padding: 16, marginBottom: 10,
                  borderWidth: 1.5, borderColor: Colors.gris2 },
  metodoActive: { borderColor: Colors.verde, backgroundColor: Colors.verdeClaro },
  metodoEmoji:  { fontSize: 22, marginRight: 12 },
  metodoLabel:  { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textoPrimario },
  check:        { color: Colors.verde, fontWeight: '800', fontSize: 16 },
  error:        { color: Colors.error, fontSize: 12, marginTop: 8 },
})
