import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const nav = [
  { to:'/admin',              label:'📊 Dashboard' },
  { to:'/admin/paquetes',     label:'🧳 Paquetes' },
  { to:'/admin/clientes',     label:'👥 Clientes' },
  { to:'/admin/reservas',     label:'🎫 Reservas' },
  { to:'/admin/pagos',        label:'💳 Pagos' },
  { to:'/admin/calendario',   label:'📅 Calendario' },
  { to:'/admin/estadisticas', label:'📈 Estadísticas' },
  { to:'/admin/notificaciones',label:'🔔 Notificaciones' },
]

export default function AdminLayout() {
  const { logout }    = useAuth()
  const navigate      = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display:'flex', minHeight:'100vh', position:'relative' }}>

      {/* Overlay oscuro al abrir en móvil */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
            zIndex:99, display:'block'
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position:   'fixed',
        top:        0,
        left:       open ? 0 : -220,
        height:     '100vh',
        width:      210,
        background: '#0A2A1E',
        display:    'flex',
        flexDirection: 'column',
        padding:    '20px 12px',
        gap:        4,
        zIndex:     100,
        transition: 'left 0.25s ease',
        boxShadow:  open ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
      }}>
        {/* Botón cerrar dentro del sidebar */}
        <button
          onClick={() => setOpen(false)}
          style={{
            alignSelf:  'flex-end',
            background: 'transparent',
            border:     'none',
            color:      'rgba(255,255,255,0.5)',
            fontSize:   20,
            cursor:     'pointer',
            marginBottom: 8,
            padding:    '0 4px',
          }}
        >✕</button>

        <div style={{ color:'#fff', fontWeight:700, fontSize:13, marginBottom:4 }}>D'RIDE CON ALE</div>
        <div style={{ color:'#5DCAA5', fontSize:9, letterSpacing:'0.14em', marginBottom:20 }}>AGENCIA DE VIAJES</div>

        {nav.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to==='/admin'}
            onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              color:          isActive ? '#9FE1CB' : 'rgba(255,255,255,0.55)',
              background:     isActive ? 'rgba(29,158,117,0.2)' : 'transparent',
              textDecoration: 'none',
              fontSize:       13,
              padding:        '8px 10px',
              borderRadius:   8,
              fontWeight:     isActive ? 600 : 400,
            })}>
            {label}
          </NavLink>
        ))}

        <button
          onClick={async () => { await logout(); navigate('/login', { replace:true }) }}
          style={{
            marginTop:  'auto',
            background: 'transparent',
            border:     '1px solid rgba(255,255,255,0.15)',
            color:      'rgba(255,255,255,0.5)',
            borderRadius: 8,
            padding:    '8px 10px',
            cursor:     'pointer',
            fontSize:   13,
            textAlign:  'left',
          }}>
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main style={{ flex:1, background:'#F8F8F6', overflowY:'auto', minHeight:'100vh', width:'100%' }}>

        {/* Barra superior con botón hamburguesa */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        12,
          padding:    '12px 20px',
          background: '#0A2A1E',
          position:   'sticky',
          top:        0,
          zIndex:     98,
        }}>
          <button
            onClick={() => setOpen(true)}
            style={{
              background: 'transparent',
              border:     'none',
              color:      '#fff',
              fontSize:   22,
              cursor:     'pointer',
              lineHeight: 1,
              padding:    '2px 6px',
            }}
          >☰</button>
          <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>D'RIDE CON ALE</span>
          <span style={{ color:'#5DCAA5', fontSize:10, letterSpacing:'0.1em' }}>AGENCIA DE VIAJES</span>
        </div>

        <Outlet />
      </main>
    </div>
  )
}
