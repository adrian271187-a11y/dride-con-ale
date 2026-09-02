import { Navigate, Outlet } from 'react-router-dom'
import { useAuth }           from '@/context/AuthContext'

export default function AdminRoute() {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0A2A1E',color:'#9FE1CB'}}>Verificando sesión...</div>
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}
