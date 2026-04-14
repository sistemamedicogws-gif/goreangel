import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Users } from 'lucide-react'

export default function CheckInPage() {
  const { token } = useParams()
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchGuest = async () => {
      const { data, error } = await supabase.from('invitados').select('*').eq('token', token).single()
      if (error || !data) setError('QR inválido o invitado no encontrado.')
      else setGuest(data)
      setLoading(false)
    }
    fetchGuest()
  }, [token])

  const handleCheckIn = async () => {
    if (guest.checked_in || processing) return
    setProcessing(true)
    const now = new Date().toISOString()
    const { error } = await supabase.from('invitados').update({ checked_in: true, checked_in_at: now }).eq('id', guest.id)
    if (!error) setGuest(g => ({ ...g, checked_in: true, checked_in_at: now }))
    setProcessing(false)
  }

  const bg = guest?.checked_in
    ? 'linear-gradient(135deg, #bbf7d0, #86efac)'
    : 'linear-gradient(135deg, var(--nude-light), #e8f0e0)'

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--nude-light)' }}>
      <div>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid var(--nude)', borderTopColor: 'var(--sage)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ fontFamily: 'Playfair Display', color: 'var(--sage-dark)', fontStyle: 'italic' }}>Verificando pase...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '340px' }}>
        <XCircle size={64} color="#dc2626" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontFamily: 'Playfair Display', color: '#dc2626', marginBottom: '0.5rem' }}>Pase Inválido</h2>
        <p style={{ color: '#6b7280' }}>{error}</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', transition: 'background 0.6s' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'white', borderRadius: '28px', padding: '2.5rem 2rem', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
      >
        {/* Top icon */}
        {guest.checked_in ? (
          <motion.div key="checked" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
            <CheckCircle size={68} color="#16a34a" style={{ margin: '0 auto 1rem', display: 'block' }} />
          </motion.div>
        ) : (
          <div style={{ width: '72px', height: '72px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Users size={32} color="white" />
          </div>
        )}

        {/* Event branding */}
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: '0.4rem', fontFamily: 'Lato' }}>
          Boda · Ángel & Goreti
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-medium)', marginBottom: '1.5rem', fontFamily: 'Lato' }}>
          23 de Agosto · 2026
        </p>

        {/* Guest info */}
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.9rem', color: 'var(--text-dark)', marginBottom: '0.3rem', fontWeight: 400 }}>
          {guest.nombre}
        </h1>
        {guest.familia && (
          <p style={{ color: 'var(--text-medium)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>{guest.familia}</p>
        )}

        {/* Pases */}
        <div style={{ background: 'var(--nude-light)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>Número de pases</p>
          <p style={{ fontSize: '3rem', fontFamily: 'Playfair Display', color: 'var(--sage-dark)', fontWeight: 700, lineHeight: 1 }}>
            {guest.num_pases}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-medium)', marginTop: '0.2rem' }}>
            {guest.num_pases === 1 ? 'persona' : 'personas'}
          </p>
        </div>

        {/* Action / Status */}
        {guest.checked_in ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.3rem' }}>
              ✓ Check-in completado
            </p>
            {guest.checked_in_at && (
              <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem' }}>
                Registrado a las {new Date(guest.checked_in_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={processing}
            style={{ width: '100%', padding: '1.1rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1rem', fontFamily: 'Lato', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1, letterSpacing: '0.06em', transition: 'all 0.3s' }}
          >
            {processing ? 'Registrando...' : '✓  Registrar Entrada'}
          </button>
        )}
      </motion.div>
    </div>
  )
}
