import { View, Text, StyleSheet,
         ScrollView, TouchableOpacity }   from 'react-native'
import { useRouter }                      from 'expo-router'
import { signOut }                        from 'firebase/auth'
import { SafeAreaView }                   from 'react-native-safe-area-context'
import { auth }                           from '@/services/firebase'
import { useAuth }                        from '@/src/context/AuthContext'
import { Colors }                         from '@/src/constants/colors'

const items = [
  { label: 'Mis datos',       emoji: '👤', route: '/perfil/datos' },
  { label: 'Notificaciones',  emoji: '🔔', route: '/perfil/notificaciones' },
  { label: 'Cambiar contraseña', emoji: '🔒', route: '/perfil/contrasena' },
]

export default function Perfil() {
  const { perfil } = useAuth()
  const router = useRouter()

  async function cerrarSesion() {
    await signOut(auth)
    router.replace('/login')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{perfil?.nombre?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.nombre}>{perfil?.nombre} {perfil?.apellido}</Text>
          <Text style={styles.email}>{perfil?.email}</Text>
        </View>

        <View style={styles.menu}>
          {items.map(it => (
            <TouchableOpacity key={it.route} style={styles.item} onPress={() => router.push(it.route)}>
              <Text style={styles.itemEmoji}>{it.emoji}</Text>
              <Text style={styles.itemLabel}>{it.label}</Text>
              <Text style={styles.itemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logout} onPress={cerrarSesion}>
          <Text style={styles.logoutTxt}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.gris1 },
  header:     { backgroundColor: Colors.verdeOscuro, alignItems: 'center', padding: 32 },
  avatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.verde,
                alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTxt:  { fontSize: 28, fontWeight: '800', color: '#fff' },
  nombre:     { fontSize: 18, fontWeight: '700', color: '#fff' },
  email:      { fontSize: 12, color: Colors.menta, marginTop: 4 },
  menu:       { backgroundColor: '#fff', borderRadius: 14, margin: 16, overflow: 'hidden' },
  item:       { flexDirection: 'row', alignItems: 'center', padding: 16,
                borderBottomWidth: 0.5, borderBottomColor: Colors.gris2 },
  itemEmoji:  { fontSize: 18, marginRight: 12 },
  itemLabel:  { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textoPrimario },
  itemArrow:  { fontSize: 20, color: Colors.textoMuted },
  logout:     { margin: 16, backgroundColor: '#FCEBEB', borderRadius: 14, padding: 16, alignItems: 'center' },
  logoutTxt:  { color: Colors.error, fontWeight: '700', fontSize: 14 },
})
