import { Tabs }        from 'expo-router'
import { Text }        from 'react-native'
import { Colors }      from '@/src/constants/colors'

const icon = (emoji) => ({ focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
)

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:        false,
        tabBarActiveTintColor:   Colors.verde,
        tabBarInactiveTintColor: Colors.textoMuted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor:  Colors.gris2,
          paddingBottom:   6,
          height:          60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"   options={{ title: 'Explorar', tabBarIcon: icon('✈️') }} />
      <Tabs.Screen name="reservas/index" options={{ title: 'Mis Reservas', tabBarIcon: icon('📋') }} />
      <Tabs.Screen name="perfil/index"   options={{ title: 'Perfil', tabBarIcon: icon('👤') }} />
    </Tabs>
  )
}
