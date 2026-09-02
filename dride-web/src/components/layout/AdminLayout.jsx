import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const nav = [
  { to: '/admin',                label: '📊 Dashboard' },
  { to: '/admin/paquetes',       label: '🧳 Paquetes' },
  { to: '/admin/clientes',       label: '👥 Clientes' },
  { to: '/admin/reservas',       label: '🎫 Reservas' },
  { to: '/admin/pagos',          label: '💳 Pagos' },
  { to: '/admin/calendario',     label: '📅 Calendario' },
  { to: '/admin/estadisticas',   label: '📈 Estadísticas' },
  { to: '/admin/notificaciones', label: '🔔 Notificaciones' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: 210, background: '#0A2A1E', display: 'flex', flexDirection: 'column', padding: '20px 12px', gap: 4, flexShrink: 0 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', marginBottom: 4 }}>D'RIDE CON ALE</div>
        <div style={{ color: '#5DCAA5', fontSize: 9, letterSpacing: '0.14em', marginBottom: 20 }}>AGENCIA DE VIAJES</div>
        {nav.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/admin'}
            style={({ isActive }) => ({
              color:      isActive ? '#9FE1CB' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(29,158,117,0.2)' : 'transparent',
              textDecoration: 'none',
              fontSize: 13,
              padding: '8px 10px',
              borderRadius: 8,
              fontWeight: isActive ? 600 : 400,
            })}>
            {label}
          </NavLink>
        ))}
        <button onClick={handleLogout}
          style={{ marginTop: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 13, textAlign: 'left' }}>
          🚪 Cerrar sesión
        </button>
      </aside>
      <main style={{ flex: 1, background: '#F8F8F6', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
