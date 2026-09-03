import { useState }                          from 'react'
import { View, Text, TextInput, StyleSheet,
         ScrollView, TouchableOpacity }      from 'react-native'
import { useRouter }                         from 'expo-router'
import { updatePassword, reauthenticateWithCredential,
         EmailAuthProvider }                 from 'firebase/auth'
import { SafeAreaView }                      from 'react-native-safe-area-context'
import { auth }                              from '@/services/firebase'
import { Colors }                            from '@/src/constants/colors'
import Button                                from '@/src/components/ui/Button'

export default function Contrasena() {
  const router = useRouter()
  const [actual,   setActual]   = useState('')
  const [nueva,    setNueva]    = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [ok,       setOk]       = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function cambiar() {
    if (!actual || !nueva || !confirm) { setError('Completa todos los campos'); return }
    if (nueva !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (nueva.length < 6)  { setError('Mínimo 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, actual)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updatePassword(auth.currentUser, nueva)
      setOk(true)
      setActual(''); setNueva(''); setConfirm('')
    } catch (e) {
      setError(e.code === 'auth/wrong-password' ? 'Contraseña actual incorrecta' : 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Cambiar contraseña</Text>

        <View style={styles.card}>
          {[
            { label: 'Contraseña actual',     val: actual,  set: setActual },
            { label: 'Nueva contraseña',       val: nueva,   set: setNueva },
            { label: 'Confirmar nueva',        val: confirm, set: setConfirm },
          ].map(({ label, val, set }) => (
            <View key={label}>
              <Text style={styles.label}>{label}</Text>
              <TextInput style={styles.input} value={val} onChangeText={set}
                secureTextEntry placeholder="••••••••"
                placeholderTextColor={Colors.textoMuted} />
            </View>
          ))}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}
        {ok && <Text style={styles.success}>✓ Contraseña actualizada</Text>}

        <Button title="Actualizar contraseña" onPress={cambiar} loading={loading} style={{ marginTop: 8 }} />
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
  error:    { color: Colors.error, fontSize: 12, marginBottom: 8 },
  success:  { color: Colors.verde, fontWeight: '600', fontSize: 13, marginBottom: 8, textAlign: 'center' },
})
