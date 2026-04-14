import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Search, CheckCircle, Clock, Users, RefreshCw, Eye, EyeOff, Camera, CameraOff } from 'lucide-react'

// Hora local del dispositivo (automática)
const fmtTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function ScannerPage() {
  const navigate = useNavigate()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)
  const [showTokens, setShowTokens] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const detectorRef = useRef(null)

  useEffect(() => { fetchGuests() }, [])
  useEffect(() => {
    const id = setInterval(() => { fetchGuests(true); setLastUpdate(new Date()) }, 15000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => () => stopCamera(), [])

  const fetchGuests = async (silent = false) => {
    if (!silent) setLoading(true)
    const { data } = await supabase.from('invitados').select('*').order('nombre', { ascending: true })
    setGuests(data || [])
    if (!silent) setLoading(false)
  }

  // ── CAMERA (video always rendered, visibility toggled via CSS) ──
  const startCamera = async () => {
    setCameraError('')
    setScanResult(null)
    if (!('BarcodeDetector' in window)) {
      setCameraError('Tu navegador no soporta el escáner. Usa Chrome en Android o busca al invitado en la lista.')
      return
    }
    try {
      detectorRef.current = new BarcodeDetector({ formats: ['qr_code'] })
    } catch {
      setCameraError('Error al iniciar el detector QR.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      // Attach stream to video (video element always exists in DOM)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      setCameraOn(true)
      // Start scan loop after short delay
      setTimeout(runScanLoop, 500)
    } catch {
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  const runScanLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const loop = async () => {
      const video = videoRef.current
      if (!video || !detectorRef.current || !streamRef.current) return
      if (video.readyState >= 2 && !video.paused) {
        try {
          const codes = await detectorRef.current.detect(video)
          if (codes.length > 0) {
            handleQRDetected(codes[0].rawValue)
            return // Stop loop until user action
          }
        } catch {}
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  const handleQRDetected = async (raw) => {
    if (navigator.vibrate) navigator.vibrate(150)
    let token = raw
    try { const url = new URL(raw); const p = url.pathname.split('/'); token = p[p.length - 1] } catch {}
    const { data } = await supabase.from('invitados').select('*').eq('token', token).single()
    setScanResult(data ? { guest: data } : { error: 'QR no reconocido.' })
  }

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    if (videoRef.current) { videoRef.current.srcObject = null }
    setCameraOn(false)
    setScanResult(null)
  }

  const continueScanning = () => {
    setScanResult(null)
    // Resume loop — video stream is still alive
    setTimeout(runScanLoop, 200)
  }

  // ── CHECK-IN from scan ──
  const checkInFromScan = async () => {
    if (!scanResult?.guest || scanResult.guest.checked_in) return
    setProcessingId(scanResult.guest.id)
    const _horaLocal = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
    await supabase.from('invitados').update({ checked_in: true, checked_in_at: new Date().toISOString(), hora_entrada: _horaLocal }).eq('id', scanResult.guest.id)
    await fetchGuests(true)
    setScanResult(prev => ({ ...prev, guest: { ...prev.guest, checked_in: true, checked_in_at: new Date().toISOString(), hora_entrada: _horaLocal } }))
    setProcessingId(null)
    setTimeout(() => continueScanning(), 2200)
  }

  // ── CHECK-IN from list ──
  const checkInGuest = async (guest) => {
    if (guest.checked_in || !window.confirm(`¿Registrar entrada de ${guest.nombre}?`)) return
    setProcessingId(guest.id)
    const _hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
    await supabase.from('invitados').update({ checked_in: true, checked_in_at: new Date().toISOString(), hora_entrada: _hora }).eq('id', guest.id)
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
    const ms = g.nombre.toLowerCase().includes(search.toLowerCase()) || (g.familia || '').toLowerCase().includes(search.toLowerCase()) || (g.token || '').toLowerCase().includes(search.toLowerCase())
    return ms && (filter === 'all' ? true : filter === 'in' ? g.checked_in : !g.checked_in)
  })

  const arrived = guests.filter(g => g.checked_in)
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
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>
                {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })} · {new Date().toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={cameraOn ? stopCamera : startCamera} style={{ background: cameraOn ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)', border: `1px solid ${cameraOn ? 'rgba(239,68,68,0.4)' : 'rgba(74,222,128,0.4)'}`, borderRadius: '10px', padding: '0.5rem 1rem', color: cameraOn ? '#f87171' : '#4ade80', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
              {cameraOn ? <><CameraOff size={14} /> Cerrar</> : <><Camera size={14} /> Escanear QR</>}
            </button>
            <button onClick={() => fetchGuests()} style={{ background: 'rgba(139,157,119,0.2)', border: '1px solid rgba(139,157,119,0.4)', borderRadius: '10px', padding: '0.5rem 0.8rem', color: '#a8c090', cursor: 'pointer', display: 'flex' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>

        {/* ── CAMERA SECTION — video always in DOM, visibility toggled ── */}
        <div style={{ marginBottom: cameraOn ? '1.5rem' : 0, display: cameraOn ? 'block' : 'none' }}>
          <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(74,222,128,0.25)', position: 'relative' }}>
            {/* Video — always rendered */}
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block', opacity: scanResult ? 0 : 1, transition: 'opacity 0.2s' }} />

            {/* Scan frame overlay */}
            {!scanResult && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: '180px', height: '180px', position: 'relative' }}>
                  {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
                    <div key={`${v}${h}`} style={{ position: 'absolute', [v]: '-2px', [h]: '-2px', width: '24px', height: '24px', borderTop: v==='top' ? '4px solid #4ade80' : 'none', borderBottom: v==='bottom' ? '4px solid #4ade80' : 'none', borderLeft: h==='left' ? '4px solid #4ade80' : 'none', borderRight: h==='right' ? '4px solid #4ade80' : 'none' }} />
                  ))}
                  <div style={{ position: 'absolute', inset: 0, boxShadow: '0 0 0 2000px rgba(0,0,0,0.38)', border: '2px solid rgba(74,222,128,0.6)', borderRadius: '4px' }} />
                </div>
                <p style={{ position: 'absolute', bottom: '0.8rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>Apunta al QR del invitado</p>
              </div>
            )}

            {/* Scan result overlay */}
            {scanResult && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '1.5rem', textAlign: 'center' }}>
                {scanResult.error ? (
                  <>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</p>
                    <p style={{ color: '#f87171', fontWeight: 700, marginBottom: '1rem' }}>{scanResult.error}</p>
                    <button onClick={continueScanning} style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: '10px', padding: '0.6rem 1.4rem', color: '#4ade80', cursor: 'pointer', fontFamily: 'Lato' }}>
                      Volver a escanear
                    </button>
                  </>
                ) : scanResult.guest.checked_in ? (
                  <>
                    <p style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>⚠️</p>
                    <p style={{ color: '#facc15', fontWeight: 700, marginBottom: '0.3rem' }}>Ya registrado</p>
                    <p style={{ color: 'white', fontFamily: 'Playfair Display', fontSize: '1.3rem', marginBottom: '0.2rem' }}>{scanResult.guest.nombre}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                      Entró a las {scanResult.guest.hora_entrada || fmtTime(scanResult.guest.checked_in_at)}
                    </p>
                    <button onClick={continueScanning} style={{ background: 'rgba(139,157,119,0.3)', border: '1px solid rgba(139,157,119,0.5)', borderRadius: '10px', padding: '0.6rem 1.4rem', color: '#a8c090', cursor: 'pointer', fontFamily: 'Lato' }}>
                      Continuar
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>✅</p>
                    <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>¡QR detectado!</p>
                    <p style={{ color: 'white', fontFamily: 'Playfair Display', fontSize: '1.4rem', marginBottom: '0.15rem' }}>{scanResult.guest.nombre}</p>
                    {scanResult.guest.familia && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>{scanResult.guest.familia}</p>}
                    <p style={{ color: '#a8c090', marginBottom: '1.2rem', fontSize: '0.9rem' }}>🎟 {scanResult.guest.num_pases} {scanResult.guest.num_pases === 1 ? 'pase' : 'pases'}</p>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button onClick={continueScanning} style={{ padding: '0.7rem 1.2rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'Lato', fontSize: '0.85rem' }}>
                        Cancelar
                      </button>
                      <button onClick={checkInFromScan} disabled={processingId === scanResult.guest.id} style={{ padding: '0.7rem 1.6rem', background: 'rgba(74,222,128,0.25)', border: '2px solid rgba(74,222,128,0.5)', borderRadius: '10px', color: '#4ade80', cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700, fontSize: '0.92rem' }}>
                        {processingId === scanResult.guest.id ? 'Registrando...' : '✓ Registrar Entrada'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {cameraError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.9rem 1.2rem', marginBottom: '1.2rem', color: '#f87171', fontSize: '0.85rem' }}>
            ⚠️ {cameraError}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
          {[
            { label: 'Total familias', value: guests.length, color: '#8B9D77' },
            { label: 'Ya llegaron', value: arrived.length, color: '#4ade80' },
            { label: 'Pendientes', value: guests.length - arrived.length, color: '#facc15' },
            { label: 'Personas hoy', value: `${arrivedPeople}/${totalPeople}`, color: '#60a5fa' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${s.color}22`, borderRadius: '12px', padding: '0.9rem 1rem' }}>
              <p style={{ fontSize: '1.6rem', fontFamily: 'Playfair Display', color: s.color, fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nombre o familia..." style={{ width: '100%', padding: '0.7rem 0.9rem 0.7rem 2.4rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'white', fontSize: '0.88rem', outline: 'none', fontFamily: 'Lato', boxSizing: 'border-box' }} />
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

        {/* Guest list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(139,157,119,0.2)', borderTopColor: '#8B9D77', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {filtered.map(g => (
              <div key={g.id} style={{ background: g.checked_in ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.04)', border: `1px solid ${g.checked_in ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
                {g.checked_in ? <CheckCircle size={26} color="#4ade80" style={{ flexShrink: 0 }} /> : <Clock size={26} color="#facc15" style={{ flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.1rem' }}>{g.nombre}</p>
                  {g.familia && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{g.familia}</p>}
                  {showTokens && <p style={{ color: 'rgba(139,157,119,0.6)', fontSize: '0.65rem', fontFamily: 'monospace', marginTop: '0.2rem', wordBreak: 'break-all' }}>{g.token}</p>}
                  {g.checked_in && g.checked_in_at && (
                    <p style={{ color: '#4ade80', fontSize: '0.7rem', marginTop: '0.15rem' }}>
                      ✓ Entró a las {g.hora_entrada || fmtTime(g.checked_in_at)}
                    </p>
                  )}
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
          Horas en zona horaria México · Auto-actualiza cada 15 segundos
        </p>
      </div>
    </div>
  )
}
