import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// Páginas admin
import Dashboard     from '@/pages/admin/Dashboard'
import Paquetes      from '@/pages/admin/Paquetes'
import Reservas      from '@/pages/admin/Reservas'
import Pagos         from '@/pages/admin/Pagos'
import Calendario    from '@/pages/admin/Calendario'
import Estadisticas  from '@/pages/admin/Estadisticas'
import Notificaciones from '@/pages/admin/Notificaciones'

// Páginas cliente
import Login         from '@/pages/cliente/Login'
import Registro      from '@/pages/cliente/Registro'
import ExploraPaquetes from '@/pages/cliente/ExploraPaquetes'
import DetallePaquete from '@/pages/cliente/DetallePaquete'
import MisReservas   from '@/pages/cliente/MisReservas'
import Confirmacion  from '@/pages/cliente/Confirmacion'

// Layout
import AdminLayout   from '@/components/layout/AdminLayout'
import PrivateRoute  from '@/components/layout/PrivateRoute'
import AdminRoute    from '@/components/layout/AdminRoute'

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Cargando...</div>

  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login"    element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Cliente autenticado */}
      <Route element={<PrivateRoute />}>
        <Route path="/"                element={<ExploraPaquetes />} />
        <Route path="/paquete/:id"     element={<DetallePaquete />} />
        <Route path="/mis-reservas"    element={<MisReservas />} />
        <Route path="/confirmacion/:id" element={<Confirmacion />} />
      </Route>

      {/* Admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                      element={<Dashboard />} />
          <Route path="paquetes"            element={<Paquetes />} />
          <Route path="reservas"            element={<Reservas />} />
          <Route path="pagos"               element={<Pagos />} />
          <Route path="calendario"          element={<Calendario />} />
          <Route path="estadisticas"        element={<Estadisticas />} />
          <Route path="notificaciones"      element={<Notificaciones />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
