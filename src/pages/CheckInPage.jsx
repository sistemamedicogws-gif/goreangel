import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { XCircle, MapPin, Clock, Heart } from 'lucide-react'

export default function CheckInPage() {
  const { token } = useParams()
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchGuest = async () => {
      const { data, error } = await supabase
        .from('invitados')
        .select('*')
        .eq('token', token)
        .single()
      if (error || !data) setError('Este pase no es válido o no existe.')
      else setGuest(data)
      setLoading(false)
    }
    fetchGuest()
  }, [token])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(150deg, var(--nude-light), #e8f0e0)' }}>
      <div>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid var(--nude)', borderTopColor: 'var(--sage)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontFamily: 'Playfair Display', color: 'var(--sage-dark)', fontStyle: 'italic', textAlign: 'center' }}>Cargando tu invitación...</p>
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, var(--nude-light) 0%, #f5f9f0 50%, var(--nude-light) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', fontFamily: 'Lato, sans-serif'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {/* Invitation card */}
        <div style={{
          background: 'white',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(107,127,90,0.18)',
          border: '1px solid rgba(139,157,119,0.2)'
        }}>
          {/* Top decoration */}
          <div style={{ height: '8px', background: 'linear-gradient(90deg, var(--sage), var(--nude-deeper), var(--sage))' }} />

          {/* Floral header */}
          <div style={{
            background: 'linear-gradient(160deg, var(--sage-light) 0%, var(--nude-light) 100%)',
            padding: '2.5rem 2rem 2rem',
            textAlign: 'center',
            borderBottom: '1px solid var(--nude)'
          }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--sage-dark)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              ✦ Con amor los invitamos ✦
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: 'var(--text-dark)', fontWeight: 400, lineHeight: 1.1, marginBottom: '0.4rem' }}>
              Ángel
            </h1>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.8rem', color: 'var(--sage)', lineHeight: 1 }}>
              &amp;
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: 'var(--text-dark)', fontWeight: 400, lineHeight: 1.1, marginTop: '0.2rem' }}>
              Goreti
            </h1>
          </div>

          {/* Guest info */}
          <div style={{ padding: '2rem 2rem 1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--text-medium)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Pase de acceso para
            </p>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', color: 'var(--text-dark)', marginBottom: '0.2rem', fontWeight: 600 }}>
              {guest.nombre}
            </h2>
            {guest.familia && (
              <p style={{ color: 'var(--text-medium)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>{guest.familia}</p>
            )}

            {/* Passes */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
              background: 'var(--nude-light)', borderRadius: '50px',
              padding: '0.6rem 1.4rem', margin: '0 auto 1.5rem',
              border: '1px solid var(--nude)'
            }}>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {Array.from({ length: Math.min(guest.num_pases, 6) }).map((_, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sage)' }} />
                ))}
              </div>
              <span style={{ color: 'var(--sage-dark)', fontWeight: 700, fontSize: '0.9rem' }}>
                {guest.num_pases} {guest.num_pases === 1 ? 'pase' : 'pases'}
              </span>
            </div>

            {/* Event details */}
            <div style={{
              background: 'var(--nude-light)', borderRadius: '18px',
              padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem',
              border: '1px solid var(--nude)', marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={15} color="white" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fecha y hora</p>
                  <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.9rem' }}>Domingo 23 de Agosto · 12:00 p.m.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--nude-deeper)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={15} color="white" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lugar</p>
                  <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.9rem' }}>Zacatecas, México</p>
                </div>
              </div>
            </div>

            {/* Status badge */}
            {guest.checked_in ? (
              <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '0.8rem', border: '1px solid #bbf7d0' }}>
                <p style={{ color: '#166534', fontWeight: 700, fontSize: '0.88rem' }}>
                  ✓ Entrada registrada
                </p>
                {guest.checked_in_at && (
                  <p style={{ color: '#16a34a', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                    {new Date(guest.checked_in_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
                Presenta este pase al recepcionista el día del evento 🎊
              </p>
            )}
          </div>

          {/* Bottom */}
          <div style={{ background: 'linear-gradient(135deg, var(--sage-deeper), var(--sage-dark))', padding: '1.2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Heart size={12} color="rgba(245,230,216,0.7)" fill="rgba(245,230,216,0.7)" />
            <p style={{ color: 'rgba(245,230,216,0.85)', fontSize: '0.78rem', letterSpacing: '0.1em' }}>
              Te esperamos con mucho amor · 23.08.2026
            </p>
            <Heart size={12} color="rgba(245,230,216,0.7)" fill="rgba(245,230,216,0.7)" />
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(100,120,90,0.6)', fontSize: '0.7rem', marginTop: '1.2rem' }}>
          Este pase es personal e intransferible
        </p>
      </motion.div>
    </div>
  )
}
