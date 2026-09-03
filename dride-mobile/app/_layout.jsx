import { useEffect }                          from 'react'
import { Stack, useRouter, useSegments }       from 'expo-router'
import { SafeAreaProvider }                    from 'react-native-safe-area-context'
import { StatusBar }                           from 'expo-status-bar'
import { AuthProvider, useAuth }               from '@/src/context/AuthContext'

function RootGuard() {
  const { user, loading } = useAuth()
  const segments           = useSegments()
  const router             = useRouter()

  useEffect(() => {
    if (loading) return
    const inAuth = segments[0] === '(auth)'
    if (!user && !inAuth) router.replace('/login')
    if (user  &&  inAuth) router.replace('/')
  }, [user, loading])

  return null
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootGuard />
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
