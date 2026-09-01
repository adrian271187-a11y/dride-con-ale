import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors } from '@/constants/colors'

const EMOJIS = { playa: '🏖️', europa: '🗺️', aventura: '🏔️', asia: '🌸', default: '✈️' }

const estadoBadge = {
  disponible:    { bg: Colors.verdeClaro, color: '#085041', label: 'Disponible' },
  pocas_plazas:  { bg: '#FAEEDA',        color: '#633806', label: 'Pocas plazas' },
  agotado:       { bg: '#FCEBEB',        color: '#A32D2D', label: 'Agotado' },
}

export default function PaqueteCard({ paquete, onPress }) {
  const emoji  = EMOJIS[paquete.categoria] || EMOJIS.default
  const badge  = estadoBadge[paquete.estado] || estadoBadge.disponible

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imgBox}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.nombre} numberOfLines={1}>{paquete.nombre}</Text>
        <Text style={styles.destino}>{paquete.destino} · {paquete.duracionDias} días</Text>
        <View style={styles.footer}>
          <Text style={styles.precio}>${paquete.precioPorPersona.toLocaleString()}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card:      { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.gris2, overflow: 'hidden' },
  imgBox:    { width: 72, backgroundColor: Colors.verdeOscuro, alignItems: 'center', justifyContent: 'center' },
  emoji:     { fontSize: 28 },
  body:      { flex: 1, padding: 10 },
  nombre:    { fontSize: 13, fontWeight: '600', color: Colors.textoPrimario, marginBottom: 2 },
  destino:   { fontSize: 11, color: Colors.textoSecundario, marginBottom: 6 },
  footer:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  precio:    { fontSize: 13, fontWeight: '700', color: Colors.verdeMedio },
  badge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '600' },
})
