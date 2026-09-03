import { useEffect, useState }              from 'react'
import { View, Text, FlatList, TextInput,
         StyleSheet, TouchableOpacity }     from 'react-native'
import { useRouter }                        from 'expo-router'
import { collection, getDocs, query,
         where, orderBy }                  from 'firebase/firestore'
import { SafeAreaView }                     from 'react-native-safe-area-context'
import { db }                               from '@/services/firebase'
import { Colors }                           from '@/src/constants/colors'
import PaqueteCard                          from '@/src/components/ui/PaqueteCard'

const CATEGORIAS = ['Todos', 'playa', 'europa', 'aventura', 'asia']

export default function Explorar() {
  const router = useRouter()
  const [paquetes, setPaquetes]     = useState([])
  const [filtrados, setFiltrados]   = useState([])
  const [busqueda, setBusqueda]     = useState('')
  const [categoria, setCategoria]   = useState('Todos')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const snap = await getDocs(query(collection(db, 'paquetes'), orderBy('nombre')))
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setPaquetes(data)
        setFiltrados(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    cargar()
  }, [])

  useEffect(() => {
    let res = paquetes
    if (categoria !== 'Todos') res = res.filter(p => p.categoria === categoria)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      res = res.filter(p => p.nombre?.toLowerCase().includes(q) || p.destino?.toLowerCase().includes(q))
    }
    setFiltrados(res)
  }, [busqueda, categoria, paquetes])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.titulo}>✈️ Explorar</Text>
        <Text style={styles.subtitulo}>Encuentra tu próximo destino</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Buscar destino..."
          placeholderTextColor={Colors.textoMuted}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.chips}>
        {CATEGORIAS.map(c => (
          <TouchableOpacity key={c} onPress={() => setCategoria(c)}
            style={[styles.chip, categoria === c && styles.chipActive]}>
            <Text style={[styles.chipText, categoria === c && styles.chipTextActive]}>
              {c === 'Todos' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Text style={styles.info}>Cargando paquetes...</Text>
      ) : filtrados.length === 0 ? (
        <Text style={styles.info}>No se encontraron paquetes</Text>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <PaqueteCard paquete={item} onPress={() => router.push(`/paquete/${item.id}`)} />
          )}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.gris1 },
  header:        { backgroundColor: Colors.verdeOscuro, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  titulo:        { fontSize: 22, fontWeight: '800', color: '#fff' },
  subtitulo:     { fontSize: 12, color: Colors.menta, marginTop: 2 },
  searchRow:     { paddingHorizontal: 16, marginTop: -12 },
  search:        { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
                   fontSize: 14, color: Colors.textoPrimario, shadowColor: '#000',
                   shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  chips:         { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                   backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.gris2 },
  chipActive:    { backgroundColor: Colors.verde, borderColor: Colors.verde },
  chipText:      { fontSize: 12, fontWeight: '600', color: Colors.textoSecundario },
  chipTextActive: { color: '#fff' },
  lista:         { paddingHorizontal: 16, paddingBottom: 24 },
  info:          { textAlign: 'center', marginTop: 40, color: Colors.textoMuted },
})
