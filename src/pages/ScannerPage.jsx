import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ArrowLeft, Search } from 'lucide-react'

export default function ScannerPage() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [QrReader, setQrReader] = useState(null)
  const [loadingCamera, setLoadingCamera] = useState(false)

  const startScan = async () => {
    setLoadingCamera(true)
    if (!QrReader) {
      try {
        const mod = await import('react-qr-scanner')
        setQrReader(() => mod.default || mod.QrReader)
      } catch (e) {
        alert('No se pudo cargar el escáner. Usa el modo manual.')
        setLoadingCamera(false)
        return
      }
    }
    setScanning(true)
    setLoadingCamera(false)
  }

  const handleScan = (data) => {
    if (!data) return
    const text = typeof data === 'string' ? data : data.text
    if (!text) return
    try {
      // If it's a full URL extract the path
      const url = new URL(text)
      navigate(url.pathname)
    } catch {
      // Maybe just a token
      if (text.length > 10) navigate(`/checkin/${text}`)
    }
  }

  const handleManual = () => {
    const t = manualToken.trim()
    if (!t) return
    navigate(`/checkin/${t}`)
  }

  const inp = { flex: 1, padding: '0.85rem 1.1rem', border: '2px solid var(--nude)', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(150deg, var(--sage-dark) 0%, var(--nude-deeper) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: 'white', borderRadius: '28px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 30px 80px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/')} style={{ background: 'var(--nude-light)', border: 'none', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={18} color="var(--text-medium)" />
          </button>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--text-dark)', fontWeight: 400 }}>
              Escáner de Pases
            </h1>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.8rem' }}>Boda Ángel & Goreti · 2026</p>
          </div>
        </div>

        {scanning && QrReader ? (
          <div>
            <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem', background: '#000' }}>
              <QrReader
                delay={300}
                onError={err => console.error('QR error:', err)}
                onScan={handleScan}
                style={{ width: '100%' }}
                facingMode="rear"
              />
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-medium)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Apunta la cámara al código QR del invitado
            </p>
            <button onClick={() => setScanning(false)} style={{ width: '100%', padding: '0.85rem', border: '2px solid var(--nude)', borderRadius: '12px', background: 'white', cursor: 'pointer', color: 'var(--text-medium)', fontFamily: 'Lato', fontSize: '0.9rem' }}>
              Cancelar Escáner
            </button>
          </div>
        ) : (
          <>
            {/* Camera button */}
            <button
              onClick={startScan}
              disabled={loadingCamera}
              style={{ width: '100%', padding: '1.5rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.05rem', cursor: loadingCamera ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontFamily: 'Lato', fontWeight: 700, marginBottom: '1.8rem', opacity: loadingCamera ? 0.7 : 1 }}
            >
              <Camera size={22} />
              {loadingCamera ? 'Cargando cámara...' : 'Escanear QR con Cámara'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--nude)' }} />
              <span style={{ color: 'var(--text-medium)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>o ingresa el token manualmente</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--nude)' }} />
            </div>

            {/* Manual input */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                value={manualToken}
                onChange={e => setManualToken(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManual()}
                placeholder="Token del invitado..."
                style={inp}
              />
              <button onClick={handleManual} style={{ padding: '0.85rem 1.2rem', background: 'var(--nude-deeper)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Search size={18} />
              </button>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-medium)', fontSize: '0.78rem', marginTop: '1.5rem', lineHeight: 1.5 }}>
              Esta vista es exclusiva para el recepcionista.<br />
              Los invitados no necesitan acceder aquí.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
