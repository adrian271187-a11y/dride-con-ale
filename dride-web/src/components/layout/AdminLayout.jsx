import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 200, background: '#0A2A1E', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>D'RIDE CON ALE</div>
        {[
          { to: '/admin',               label: 'Dashboard' },
          { to: '/admin/paquetes',      label: 'Paquetes' },
          { to: '/admin/reservas',      label: 'Reservas' },
          { to: '/admin/pagos',         label: 'Pagos' },
          { to: '/admin/calendario',    label: 'Calendario' },
          { to: '/admin/estadisticas',  label: 'Estadísticas' },
          { to: '/admin/notificaciones',label: 'Notificaciones' },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/admin'}
            style={({ isActive }) => ({
              color: isActive ? '#9FE1CB' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none', fontSize: 13, padding: '6px 8px',
              borderRadius: 6, background: isActive ? 'rgba(29,158,117,0.2)' : 'transparent',
            })}>
            {label}
          </NavLink>
        ))}
        <button onClick={handleLogout}
          style={{ marginTop: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', fontSize: 13 }}>
          Cerrar sesión
        </button>
      </aside>
      <main style={{ flex: 1, background: '#F8F8F6' }}>
        <Outlet />
      </main>
    </div>
  )
}
