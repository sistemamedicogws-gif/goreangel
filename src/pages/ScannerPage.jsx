import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Search, CheckCircle, Clock, Users, RefreshCw, Eye, EyeOff } from 'lucide-react'

export default function ScannerPage() {
  const navigate = useNavigate()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)
  const [showTokens, setShowTokens] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => { fetchGuests() }, [])

  useEffect(() => {
    const id = setInterval(() => {
      fetchGuests(true)
      setLastUpdate(new Date())
    }, 15000)
    return () => clearInterval(id)
  }, [])

  const fetchGuests = async (silent = false) => {
    if (!silent) setLoading(true)
    const { data } = await supabase.from('invitados').select('*').order('nombre', { ascending: true })
    setGuests(data || [])
    if (!silent) setLoading(false)
  }

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
      <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #2d3a1e)', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(139,157,119,0.3)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={18} color="white" />
            </button>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: '1.2rem', fontWeight: 400 }}>Control de Acceso 🎩</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>Actualizado: {lastUpdate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
          </div>
          <button onClick={() => fetchGuests()} style={{ background: 'rgba(139,157,119,0.2)', border: '1px solid rgba(139,157,119,0.4)', borderRadius: '10px', padding: '0.5rem 1rem', color: '#a8c090', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem' }}>
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

        {/* Results count */}
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginBottom: '0.8rem' }}>
          Mostrando {filtered.length} de {guests.length} invitados
        </p>

        {/* Guest list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid rgba(139,157,119,0.2)', borderTopColor: '#8B9D77', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Cargando...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.25)' }}>
            <Users size={44} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.25 }} />
            <p>No se encontraron resultados</p>
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
          Se actualiza automáticamente cada 15 segundos · Los QR del papel llevan directo al check-in
        </p>
      </div>
    </div>
  )
}
