import { useState }                              from 'react'
import { View, Text, TextInput, StyleSheet,
         TouchableOpacity, KeyboardAvoidingView,
         Platform, ScrollView }                  from 'react-native'
import { useRouter }                             from 'expo-router'
import { signInWithEmailAndPassword }            from 'firebase/auth'
import { SafeAreaView }                          from 'react-native-safe-area-context'
import { auth }                                  from '@/services/firebase'
import { Colors }                                from '@/src/constants/colors'
import Button                                    from '@/src/components/ui/Button'

export default function Login() {
  const router          = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    if (!email || !password) { setError('Completa todos los campos'); return }
    setLoading(true); setError('')
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.replace('/')
    } catch (e) {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>✈️</Text>
            <Text style={styles.titulo}>D'RIDE CON ALE</Text>
            <Text style={styles.subtitulo}>Tu agencia de viajes</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tucorreo@email.com"
              placeholderTextColor={Colors.textoMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textoMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Button title="Ingresar" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

            <TouchableOpacity onPress={() => router.push('/registro')} style={styles.linkRow}>
              <Text style={styles.link}>¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.verdeOscuro },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header:    { alignItems: 'center', marginBottom: 32 },
  logo:      { fontSize: 48, marginBottom: 8 },
  titulo:    { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  subtitulo: { fontSize: 13, color: Colors.menta, marginTop: 4 },
  card:      { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  label:     { fontSize: 12, fontWeight: '600', color: Colors.textoSecundario, marginBottom: 6, marginTop: 14 },
  input:     { borderWidth: 1, borderColor: Colors.gris2, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.textoPrimario },
  error:     { color: Colors.error, fontSize: 12, marginTop: 8 },
  linkRow:   { alignItems: 'center', marginTop: 16 },
  link:      { color: Colors.textoSecundario, fontSize: 13 },
  linkBold:  { color: Colors.verde, fontWeight: '700' },
})
