import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Search, CheckCircle, Clock, Users, RefreshCw, Eye, EyeOff, Camera, CameraOff, X } from 'lucide-react'

export default function ScannerPage() {
  const navigate = useNavigate()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)
  const [showTokens, setShowTokens] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Camera scanner state
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [scanResult, setScanResult] = useState(null) // { guest, status }
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => { fetchGuests() }, [])

  useEffect(() => {
    const id = setInterval(() => { fetchGuests(true); setLastUpdate(new Date()) }, 15000)
    return () => clearInterval(id)
  }, [])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [])

  const fetchGuests = async (silent = false) => {
    if (!silent) setLoading(true)
    const { data } = await supabase.from('invitados').select('*').order('nombre', { ascending: true })
    setGuests(data || [])
    if (!silent) setLoading(false)
  }

  // ── CAMERA SCANNER ──
  const startCamera = async () => {
    setCameraError('')
    setScanResult(null)

    // Check BarcodeDetector support
    if (!('BarcodeDetector' in window)) {
      setCameraError('Tu navegador no soporta el escáner integrado. Usa Chrome en Android o busca el invitado por nombre abajo.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      setCameraOpen(true)

      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          startScanning()
        }
      }, 300)
    } catch (err) {
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
    }
  }

  const startScanning = async () => {
    if (!videoRef.current) return
    let detector
    try {
      detector = new BarcodeDetector({ formats: ['qr_code'] })
    } catch {
      setCameraError('Error al iniciar el detector QR.')
      return
    }

    const scan = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(scan)
        return
      }
      try {
        const codes = await detector.detect(videoRef.current)
        if (codes.length > 0) {
          handleQRDetected(codes[0].rawValue)
          return // Stop scanning after detection
        }
      } catch {}
      rafRef.current = requestAnimationFrame(scan)
    }
    rafRef.current = requestAnimationFrame(scan)
  }

  const handleQRDetected = async (raw) => {
    // Cancel scanning loop
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    // Extract token from URL or use raw as token
    let token = raw
    try {
      const url = new URL(raw)
      const parts = url.pathname.split('/')
      token = parts[parts.length - 1]
    } catch {}

    // Look up guest
    const { data } = await supabase.from('invitados').select('*').eq('token', token).single()
    if (!data) {
      setScanResult({ error: 'QR no reconocido. Asegúrate de escanear el pase correcto.' })
    } else {
      setScanResult({ guest: data })
    }

    // Vibrate on mobile
    if (navigator.vibrate) navigator.vibrate(200)
  }

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraOpen(false)
    setScanResult(null)
  }

  const checkInFromScan = async () => {
    if (!scanResult?.guest || scanResult.guest.checked_in) return
    setProcessingId(scanResult.guest.id)
    await supabase.from('invitados').update({ checked_in: true, checked_in_at: new Date().toISOString() }).eq('id', scanResult.guest.id)
    await fetchGuests(true)
    setScanResult(prev => ({ ...prev, guest: { ...prev.guest, checked_in: true } }))
    setProcessingId(null)
    // Resume scanning after 2s
    setTimeout(() => { setScanResult(null); startScanning() }, 2000)
  }

  const continueScanning = () => { setScanResult(null); startScanning() }

  // ── GUEST LIST CHECK-IN ──
  const checkInGuest = async (guest) => {
    if (guest.checked_in) return
    if (!window.confirm(`¿Registrar entrada de ${guest.nombre}?`)) return
    setProcessingId(guest.id)
    await supabase.from('invitados').update({ checked_in: true, checked_in_at: new Date().toISOString() }).eq('id', guest.id)
    await fetchGuests(true)
    setProcessingId(null)
  }

  const undoCheckIn = async (guest) => {
    if (!window.confirm(`¿Deshacer entrada de ${guest.nombre}?`)) return
    setProcessingId(guest.id)
    await supabase.from('invitados').update({ checked_in: false, checked_in_at: null }).eq('id', guest.id)
    await fetchGuests(true)
    setProcessingId(null)
  }

  const filtered = guests.filter(g => {
    const matchSearch = g.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (g.familia || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.token || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true : filter === 'in' ? g.checked_in : !g.checked_in
    return matchSearch && matchFilter
  })

  const arrived = guests.filter(g => g.checked_in)
  const pending = guests.filter(g => !g.checked_in)
  const totalPeople = guests.reduce((a, g) => a + (g.num_pases || 0), 0)
  const arrivedPeople = arrived.reduce((a, g) => a + (g.num_pases || 0), 0)
  const pct = guests.length ? Math.round(arrived.length / guests.length * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: 'white' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #2d3a1e)', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(139,157,119,0.3)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => { stopCamera(); navigate('/') }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={18} color="white" />
            </button>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: '1.2rem', fontWeight: 400 }}>Control de Acceso 🎩</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>Actualizado: {lastUpdate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={cameraOpen ? stopCamera : startCamera} style={{ background: cameraOpen ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)', border: `1px solid ${cameraOpen ? 'rgba(239,68,68,0.4)' : 'rgba(74,222,128,0.4)'}`, borderRadius: '10px', padding: '0.5rem 1rem', color: cameraOpen ? '#f87171' : '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
              {cameraOpen ? <><CameraOff size={14} /> Cerrar cámara</> : <><Camera size={14} /> Escanear QR</>}
            </button>
            <button onClick={() => fetchGuests()} style={{ background: 'rgba(139,157,119,0.2)', border: '1px solid rgba(139,157,119,0.4)', borderRadius: '10px', padding: '0.5rem 0.8rem', color: '#a8c090', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>

        {/* CAMERA SECTION */}
        {cameraOpen && (
          <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(74,222,128,0.2)', position: 'relative' }}>
            {/* Scanning overlay */}
            {!scanResult && (
              <>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }} />
                {/* Scanner frame */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '180px', height: '180px', border: '3px solid #4ade80', borderRadius: '16px', boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)', pointerEvents: 'none' }}>
                  {/* Corner decorations */}
                  {[['0','0','top','left'], ['0','0','top','right'], ['0','0','bottom','left'], ['0','0','bottom','right']].map(([t,l,v,h], i) => (
                    <div key={i} style={{ position: 'absolute', [v]: '-3px', [h]: '-3px', width: '22px', height: '22px', borderTop: v === 'top' ? '4px solid #4ade80' : 'none', borderBottom: v === 'bottom' ? '4px solid #4ade80' : 'none', borderLeft: h === 'left' ? '4px solid #4ade80' : 'none', borderRight: h === 'right' ? '4px solid #4ade80' : 'none', borderRadius: v === 'top' && h === 'left' ? '4px 0 0 0' : v === 'top' && h === 'right' ? '0 4px 0 0' : v === 'bottom' && h === 'left' ? '0 0 0 4px' : '0 0 4px 0' }} />
                  ))}
                </div>
                <p style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: '0.78rem', background: 'rgba(0,0,0,0.5)', padding: '0.4rem' }}>
                  Apunta al código QR del invitado
                </p>
              </>
            )}

            {/* Scan result */}
            {scanResult && (
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                {scanResult.error ? (
                  <>
                    <p style={{ color: '#f87171', fontSize: '1.8rem', marginBottom: '0.5rem' }}>❌</p>
                    <p style={{ color: '#f87171', fontWeight: 700, marginBottom: '1rem' }}>{scanResult.error}</p>
                    <button onClick={continueScanning} style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: '10px', padding: '0.6rem 1.2rem', color: '#4ade80', cursor: 'pointer', fontFamily: 'Lato' }}>
                      Escanear de nuevo
                    </button>
                  </>
                ) : scanResult.guest.checked_in ? (
                  <>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</p>
                    <p style={{ color: '#facc15', fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>Ya registrado</p>
                    <p style={{ color: 'white', fontSize: '1.2rem', fontFamily: 'Playfair Display', marginBottom: '0.3rem' }}>{scanResult.guest.nombre}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '1rem' }}>Entró a las {scanResult.guest.checked_in_at ? new Date(scanResult.guest.checked_in_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '?'}</p>
                    <button onClick={continueScanning} style={{ background: 'rgba(139,157,119,0.3)', border: '1px solid rgba(139,157,119,0.5)', borderRadius: '10px', padding: '0.6rem 1.4rem', color: '#a8c090', cursor: 'pointer', fontFamily: 'Lato' }}>
                      Continuar
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</p>
                    <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>¡QR detectado!</p>
                    <p style={{ color: 'white', fontSize: '1.4rem', fontFamily: 'Playfair Display', marginBottom: '0.2rem' }}>{scanResult.guest.nombre}</p>
                    {scanResult.guest.familia && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '0.8rem' }}>{scanResult.guest.familia}</p>}
                    <p style={{ color: '#a8c090', marginBottom: '1.2rem' }}>🎟 {scanResult.guest.num_pases} {scanResult.guest.num_pases === 1 ? 'pase' : 'pases'}</p>
                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                      <button onClick={continueScanning} style={{ padding: '0.7rem 1.2rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'Lato', fontSize: '0.85rem' }}>
                        Cancelar
                      </button>
                      <button onClick={checkInFromScan} disabled={processingId === scanResult.guest.id} style={{ padding: '0.7rem 1.6rem', background: 'rgba(74,222,128,0.25)', border: '2px solid rgba(74,222,128,0.5)', borderRadius: '10px', color: '#4ade80', cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700, fontSize: '0.95rem' }}>
                        {processingId === scanResult.guest.id ? 'Registrando...' : '✓ Registrar Entrada'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Camera error */}
        {cameraError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '1rem 1.2rem', marginBottom: '1.2rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
            <p style={{ color: '#f87171', fontSize: '0.85rem', lineHeight: 1.5 }}>{cameraError}</p>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
          {[
            { label: 'Total familias', value: guests.length, color: '#8B9D77' },
            { label: 'Ya llegaron', value: arrived.length, color: '#4ade80' },
            { label: 'Pendientes', value: pending.length, color: '#facc15' },
            { label: 'Personas hoy', value: `${arrivedPeople}/${totalPeople}`, color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${s.color}25`, borderRadius: '12px', padding: '0.9rem 1rem' }}>
              <p style={{ fontSize: '1.6rem', fontFamily: 'Playfair Display', color: s.color, fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Asistencia</span>
            <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #4ade80, #8B9D77)', width: `${pct}%`, transition: 'width 0.5s ease', borderRadius: '20px' }} />
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ display: 'flex', gap: '0.7rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <Search size={14} color="rgba(255,255,255,0.35)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nombre, familia o token..." style={{ width: '100%', padding: '0.7rem 0.9rem 0.7rem 2.4rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'white', fontSize: '0.88rem', outline: 'none', fontFamily: 'Lato', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[{ id: 'all', l: 'Todos' }, { id: 'in', l: '✓ Llegaron' }, { id: 'out', l: '⏳ Pendientes' }].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '0.7rem 0.9rem', border: '1px solid', borderColor: filter === f.id ? '#8B9D77' : 'rgba(255,255,255,0.12)', background: filter === f.id ? 'rgba(139,157,119,0.2)' : 'transparent', color: filter === f.id ? '#a8c090' : 'rgba(255,255,255,0.45)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Lato', whiteSpace: 'nowrap' }}>
                {f.l}
              </button>
            ))}
            <button onClick={() => setShowTokens(v => !v)} style={{ padding: '0.7rem', border: '1px solid rgba(255,255,255,0.12)', background: showTokens ? 'rgba(139,157,119,0.2)' : 'transparent', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: showTokens ? '#a8c090' : 'rgba(255,255,255,0.4)' }}>
              {showTokens ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '0.8rem' }}>
          Mostrando {filtered.length} de {guests.length} invitados
        </p>

        {/* Guest list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(139,157,119,0.2)', borderTopColor: '#8B9D77', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.25)' }}>
            <Users size={44} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.25 }} />
            <p>Sin resultados</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {filtered.map(g => (
              <div key={g.id} style={{ background: g.checked_in ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.04)', border: `1px solid ${g.checked_in ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
                {g.checked_in ? <CheckCircle size={26} color="#4ade80" style={{ flexShrink: 0 }} /> : <Clock size={26} color="#facc15" style={{ flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.1rem' }}>{g.nombre}</p>
                  {g.familia && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{g.familia}</p>}
                  {showTokens && <p style={{ color: 'rgba(139,157,119,0.6)', fontSize: '0.65rem', fontFamily: 'monospace', marginTop: '0.2rem', wordBreak: 'break-all' }}>Token: {g.token}</p>}
                  {g.checked_in && g.checked_in_at && <p style={{ color: '#4ade80', fontSize: '0.7rem', marginTop: '0.15rem' }}>✓ {new Date(g.checked_in_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>}
                </div>
                <span style={{ background: 'rgba(139,157,119,0.18)', border: '1px solid rgba(139,157,119,0.3)', borderRadius: '20px', padding: '0.25rem 0.7rem', color: '#a8c090', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>
                  {g.num_pases} {g.num_pases === 1 ? 'pase' : 'pases'}
                </span>
                {g.checked_in ? (
                  <button onClick={() => undoCheckIn(g)} disabled={processingId === g.id} style={{ padding: '0.45rem 0.8rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '0.73rem', fontFamily: 'Lato', flexShrink: 0 }}>
                    Deshacer
                  </button>
                ) : (
                  <button onClick={() => checkInGuest(g)} disabled={processingId === g.id} style={{ padding: '0.45rem 0.9rem', background: 'rgba(74,222,128,0.18)', border: '1px solid rgba(74,222,128,0.35)', borderRadius: '8px', color: '#4ade80', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Lato', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {processingId === g.id ? '...' : '✓ Registrar'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', marginTop: '2rem' }}>
          Se actualiza cada 15 segundos · Escáner usa cámara trasera del dispositivo
        </p>
      </div>
    </div>
  )
}
