import { Navigate, Outlet } from 'react-router-dom'
import { useAuth }           from '@/context/AuthContext'

export default function PrivateRoute() {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>Cargando...</div>
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}
