import { useState }                          from 'react'
import { View, Text, TextInput, StyleSheet,
         ScrollView, TouchableOpacity }      from 'react-native'
import { useRouter }                         from 'expo-router'
import { doc, updateDoc }                    from 'firebase/firestore'
import { SafeAreaView }                      from 'react-native-safe-area-context'
import { db }                                from '@/services/firebase'
import { useAuth }                           from '@/src/context/AuthContext'
import { Colors }                            from '@/src/constants/colors'
import Button                                from '@/src/components/ui/Button'

export default function Datos() {
  const { user, perfil } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    nombre:   perfil?.nombre   ?? '',
    apellido: perfil?.apellido ?? '',
    telefono: perfil?.telefono ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [ok, setOk]           = useState(false)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  async function guardar() {
    setLoading(true)
    try {
      await updateDoc(doc(db, 'usuarios', user.uid), form)
      setOk(true)
      setTimeout(() => setOk(false), 3000)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Mis datos</Text>

        <View style={styles.card}>
          {[
            { label: 'Nombre',   k: 'nombre' },
            { label: 'Apellido', k: 'apellido' },
            { label: 'Teléfono', k: 'telefono', keyboardType: 'phone-pad' },
          ].map(({ label, k, ...rest }) => (
            <View key={k}>
              <Text style={styles.label}>{label}</Text>
              <TextInput style={styles.input} value={form[k]} onChangeText={set(k)}
                placeholderTextColor={Colors.textoMuted} {...rest} />
            </View>
          ))}

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput style={[styles.input, styles.disabled]} value={perfil?.email ?? ''} editable={false} />
          <Text style={styles.hint}>El correo no puede modificarse</Text>
        </View>

        {ok && <Text style={styles.success}>✓ Datos guardados</Text>}

        <Button title="Guardar cambios" onPress={guardar} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: Colors.gris1 },
  container:{ padding: 20, paddingBottom: 40 },
  back:     { marginBottom: 12 },
  backText: { color: Colors.verde, fontSize: 14, fontWeight: '600' },
  titulo:   { fontSize: 22, fontWeight: '800', color: Colors.textoPrimario, marginBottom: 20 },
  card:     { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16 },
  label:    { fontSize: 12, fontWeight: '600', color: Colors.textoSecundario, marginBottom: 6, marginTop: 12 },
  input:    { borderWidth: 1, borderColor: Colors.gris2, borderRadius: 10, padding: 12,
              fontSize: 14, color: Colors.textoPrimario },
  disabled: { backgroundColor: Colors.gris1, color: Colors.textoMuted },
  hint:     { fontSize: 11, color: Colors.textoMuted, marginTop: 4 },
  success:  { color: Colors.verde, fontWeight: '600', fontSize: 13, marginBottom: 8, textAlign: 'center' },
})
