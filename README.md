# D'RIDE CON ALE — Sistema de Agencia de Viajes

Plataforma completa para la gestión de paquetes turísticos, reservas y pagos.

## Estructura del repositorio

```
dride-project/
├── dride-web/          # Panel admin + portal web (React + Vite)
├── dride-mobile/       # App móvil para clientes (React Native + Expo)
└── dride-backend/      # API REST + cron jobs (Node.js + Railway)
```

## Inicio rápido

### 1. Backend (Railway)
```bash
cd dride-backend
cp .env.example .env      # Completar con tus credenciales
npm install
npm run dev               # Puerto 4000
```

### 2. Web (React)
```bash
cd dride-web
cp .env.example .env      # Completar con tu config de Firebase
npm install
npm run dev               # Puerto 3000
```

### 3. App móvil (Expo)
```bash
cd dride-mobile
npm install
npx expo start            # Escanear QR con Expo Go
```

## Variables de entorno necesarias

- **Firebase:** API Key, Auth Domain, Project ID, Storage Bucket
- **Railway API:** URL pública del backend desplegado
- **Nodemailer:** Cuenta Gmail + contraseña de aplicación
- **Twilio:** Account SID, Auth Token, número WhatsApp sandbox

## Despliegue

- **Backend:** Conectar repositorio a Railway → auto-deploy en cada push
- **Web:** `npm run build` → subir `dist/` a Firebase Hosting o Vercel
- **Mobile:** `npx expo build` → publicar en App Store / Play Store

---
Desarrollado para D'RIDE CON ALE · Agencia de Viajes · 2026
