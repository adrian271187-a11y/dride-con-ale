import { useEffect, useState } from 'react'

export default function InstallPWA() {
  const [prompt, setPrompt]     = useState(null)
  const [visible, setVisible]   = useState(false)
  const [isIOS, setIsIOS]       = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    })
  }, [])

  async function instalar() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  if (installed || (!visible && !isIOS)) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#0A2A1E', color: '#fff', borderRadius: 14, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      zIndex: 9999, maxWidth: 360, width: 'calc(100% - 40px)',
    }}>
      <span style={{ fontSize: 28 }}>✈️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Instalar app admin</div>
        {isIOS
          ? <div style={{ fontSize: 12, color: '#9FE1CB', marginTop: 2 }}>
              Toca <strong>Compartir</strong> → <strong>Agregar a pantalla inicio</strong>
            </div>
          : <div style={{ fontSize: 12, color: '#9FE1CB', marginTop: 2 }}>
              Instala D'RIDE CON ALE en tu teléfono
            </div>
        }
      </div>
      {!isIOS && (
        <button onClick={instalar} style={{
          background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8,
          padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>
          Instalar
        </button>
      )}
      <button onClick={() => setVisible(false)} style={{
        background: 'transparent', border: 'none', color: '#9FE1CB',
        fontSize: 18, cursor: 'pointer', padding: '0 4px',
      }}>✕</button>
    </div>
  )
}
