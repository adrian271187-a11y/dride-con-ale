export const Routes = {
  AUTH: {
    LOGIN:    '/login',
    REGISTRO: '/registro',
  },
  EXPLORAR: {
    INDEX:   '/',
    DETALLE: '/paquete/[id]',
  },
  RESERVAS: {
    INDEX:       '/reservas',
    FORM:        '/reservas/nueva',
    PAGO:        '/reservas/[id]/pago',
    CONFIRMACION: '/reservas/[id]/confirmacion',
  },
  PERFIL: {
    INDEX:          '/perfil',
    DATOS:          '/perfil/datos',
    NOTIFICACIONES: '/perfil/notificaciones',
    CONTRASENA:     '/perfil/contrasena',
  },
}
