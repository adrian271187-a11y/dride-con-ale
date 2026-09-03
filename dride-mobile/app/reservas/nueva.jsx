import { useEffect, useState }              from 'react'
import { View, Text, TextInput, StyleSheet,
         ScrollView, TouchableOpacity }     from 'react-native'
import { useLocalSearchParams, useRouter }  from 'expo-router'
import { doc, getDoc, addDoc, collection,
         serverTimestamp }                  from 'firebase/firestore'
import { SafeAreaView }                     from 'react-native-safe-area-context'
import { db }                               from '@/services/firebase'
import { useAuth }                          from '@/src/context/AuthContext'
import { Colors }                           from '@/src/constants/colors'
import Button                               from '@/src/components/ui/Button'

export default function NuevaReserva() {
  const { paqueteId } = useLocalSearchParams()
  const { user, perfil } = useAuth()
  const router = useRouter()

  const [pkg, setPkg]       = useState(null)
  const [personas, setPersonas] = useState('1')
  const [fechaSalida, setFechaSalida] = useState('')
  const [notas, setNotas]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!paqueteId) return
    getDoc(doc(db, 'paquetes', paqueteId)).then(s => {
      if (s.exists()) setPkg({ id: s.id, ...s.data() })
    })
  }, [paqueteId])

  async function handleReservar() {
    if (!fechaSalida) { setError('Ingresa la fecha de salida'); return }
    const num = parseInt(personas)
    if (!num || num < 1) { setError('Personas inválido'); return }
    setLoading(true); setError('')
    try {
      const ref = await addDoc(collection(db, 'reservas'), {
        usuarioId:     user.uid,
        usuarioNombre: `${perfil?.nombre ?? ''} ${perfil?.apellido ?? ''}`.trim(),
        paqueteId,
        paqueteNombre: pkg?.nombre ?? '',
        personas:      num,
        fechaSalida,
        notas,
        estado:        'pendiente',
        total:         (pkg?.precioPorPersona ?? 0) * num,
        creadaEn:      serverTimestamp(),
      })
      router.replace(`/reservas/${ref.id}/confirmacion`)
    } catch (e) {
      setError('Error al crear reserva')
    } finally {
      setLoading(false)
    }
  }

  if (!pkg) return <View style={styles.center}><Text>Cargando...</Text></View>

  const total = (pkg.precioPorPersona ?? 0) * (parseInt(personas) || 1)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Nueva reserva</Text>
        <Text style={styles.paquete}>{pkg.nombre}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Número de personas</Text>
          <TextInput style={styles.input} value={personas} onChangeText={setPersonas}
            keyboardType="number-pad" placeholder="1"
            placeholderTextColor={Colors.textoMuted} />

          <Text style={styles.label}>Fecha de salida deseada</Text>
          <TextInput style={styles.input} value={fechaSalida} onChangeText={setFechaSalida}
            placeholder="DD/MM/YYYY" placeholderTextColor={Colors.textoMuted} />

          <Text style={styles.label}>Notas adicionales</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={notas} onChangeText={setNotas} multiline
            placeholder="Alergias, preferencias, etc."
            placeholderTextColor={Colors.textoMuted} />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total estimado</Text>
          <Text style={styles.totalVal}>${total.toLocaleString()}</Text>
          <Text style={styles.totalNote}>{personas} persona(s) × ${pkg.precioPorPersona?.toLocaleString()}</Text>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Button title="Confirmar reserva" onPress={handleReservar} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.gris1 },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container:  { padding: 20, paddingBottom: 40 },
  back:       { marginBottom: 12 },
  backText:   { color: Colors.verde, fontSize: 14, fontWeight: '600' },
  titulo:     { fontSize: 22, fontWeight: '800', color: Colors.textoPrimario },
  paquete:    { fontSize: 13, color: Colors.textoSecundario, marginBottom: 20 },
  card:       { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  label:      { fontSize: 12, fontWeight: '600', color: Colors.textoSecundario, marginBottom: 6, marginTop: 12 },
  input:      { borderWidth: 1, borderColor: Colors.gris2, borderRadius: 10, padding: 12,
                fontSize: 14, color: Colors.textoPrimario },
  totalCard:  { backgroundColor: Colors.verdeOscuro, borderRadius: 14, padding: 16, marginBottom: 16, alignItems: 'center' },
  totalLabel: { fontSize: 12, color: Colors.menta, fontWeight: '600' },
  totalVal:   { fontSize: 28, fontWeight: '800', color: '#fff', marginVertical: 4 },
  totalNote:  { fontSize: 12, color: Colors.menta },
  error:      { color: Colors.error, fontSize: 12, marginBottom: 8 },
})
