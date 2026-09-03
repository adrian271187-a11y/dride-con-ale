import { useState }                          from 'react'
import { View, Text, Switch, StyleSheet,
         ScrollView, TouchableOpacity }      from 'react-native'
import { useRouter }                         from 'expo-router'
import { doc, updateDoc }                    from 'firebase/firestore'
import { SafeAreaView }                      from 'react-native-safe-area-context'
import { db }                                from '@/services/firebase'
import { useAuth }                           from '@/src/context/AuthContext'
import { Colors }                            from '@/src/constants/colors'

const OPCIONES = [
  { k: 'reservas',   label: 'Actualizaciones de reservas',  sub: 'Confirmaciones y cambios de estado' },
  { k: 'ofertas',    label: 'Ofertas y promociones',        sub: 'Descuentos y paquetes especiales' },
  { k: 'recordatorios', label: 'Recordatorios de viaje',   sub: 'Antes de tu fecha de salida' },
]

export default function Notificaciones() {
  const { user, perfil } = useAuth()
  const router = useRouter()
  const [prefs, setPrefs] = useState(perfil?.notificaciones ?? { reservas: true, ofertas: false, recordatorios: true })

  async function toggle(k) {
    const updated = { ...prefs, [k]: !prefs[k] }
    setPrefs(updated)
    try {
      await updateDoc(doc(db, 'usuarios', user.uid), { notificaciones: updated })
    } catch (e) { console.error(e) }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Notificaciones</Text>

        <View style={styles.card}>
          {OPCIONES.map(op => (
            <View key={op.k} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{op.label}</Text>
                <Text style={styles.sub}>{op.sub}</Text>
              </View>
              <Switch
                value={!!prefs[op.k]}
                onValueChange={() => toggle(op.k)}
                trackColor={{ false: Colors.gris2, true: Colors.verde }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: Colors.gris1 },
  container:{ padding: 20 },
  back:     { marginBottom: 12 },
  backText: { color: Colors.verde, fontSize: 14, fontWeight: '600' },
  titulo:   { fontSize: 22, fontWeight: '800', color: Colors.textoPrimario, marginBottom: 20 },
  card:     { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  row:      { flexDirection: 'row', alignItems: 'center', padding: 16,
              borderBottomWidth: 0.5, borderBottomColor: Colors.gris2 },
  label:    { fontSize: 14, fontWeight: '600', color: Colors.textoPrimario, marginBottom: 2 },
  sub:      { fontSize: 12, color: Colors.textoMuted },
})
