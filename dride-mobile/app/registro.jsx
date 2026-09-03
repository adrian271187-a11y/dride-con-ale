import { useState }                               from 'react'
import { View, Text, TextInput, StyleSheet,
         TouchableOpacity, KeyboardAvoidingView,
         Platform, ScrollView }                   from 'react-native'
import { useRouter }                              from 'expo-router'
import { createUserWithEmailAndPassword }         from 'firebase/auth'
import { doc, setDoc, serverTimestamp }           from 'firebase/firestore'
import { SafeAreaView }                           from 'react-native-safe-area-context'
import { auth, db }                               from '@/services/firebase'
import { Colors }                                 from '@/src/constants/colors'
import Button                                     from '@/src/components/ui/Button'

export default function Registro() {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', email: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  async function handleRegistro() {
    if (!form.nombre || !form.email || !form.password) { setError('Completa todos los campos'); return }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('Mínimo 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password)
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre:    form.nombre,
        apellido:  form.apellido,
        telefono:  form.telefono,
        email:     form.email.trim(),
        rol:       'cliente',
        creadoEn:  serverTimestamp(),
      })
      router.replace('/')
    } catch (e) {
      setError(e.code === 'auth/email-already-in-use' ? 'Ese correo ya está registrado' : 'Error al crear cuenta')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, k, ...props }) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={Colors.textoMuted}
        value={form[k]} onChangeText={set(k)} {...props} />
    </>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.titulo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>Únete y empieza a explorar destinos</Text>

          <View style={styles.card}>
            <Field label="Nombre *"  k="nombre"   placeholder="Ana" />
            <Field label="Apellido"  k="apellido" placeholder="García" />
            <Field label="Teléfono"  k="telefono" placeholder="+52 55 0000 0000" keyboardType="phone-pad" />
            <Field label="Correo *"  k="email"    placeholder="ana@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Contraseña *" k="password" placeholder="Mínimo 6 caracteres" secureTextEntry />
            <Field label="Confirmar contraseña *" k="confirm" placeholder="Repite tu contraseña" secureTextEntry />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Button title="Crear cuenta" onPress={handleRegistro} loading={loading} style={{ marginTop: 16 }} />

            <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
              <Text style={styles.link}>¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.gris1 },
  container: { flexGrow: 1, padding: 24 },
  back:      { marginBottom: 16 },
  backText:  { color: Colors.verde, fontSize: 14, fontWeight: '600' },
  titulo:    { fontSize: 24, fontWeight: '800', color: Colors.textoPrimario, marginBottom: 4 },
  subtitulo: { fontSize: 13, color: Colors.textoSecundario, marginBottom: 24 },
  card:      { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  label:     { fontSize: 12, fontWeight: '600', color: Colors.textoSecundario, marginBottom: 6, marginTop: 14 },
  input:     { borderWidth: 1, borderColor: Colors.gris2, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.textoPrimario },
  error:     { color: Colors.error, fontSize: 12, marginTop: 8 },
  linkRow:   { alignItems: 'center', marginTop: 16 },
  link:      { color: Colors.textoSecundario, fontSize: 13 },
  linkBold:  { color: Colors.verde, fontWeight: '700' },
})
