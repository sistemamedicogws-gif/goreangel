import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Heart, Check } from 'lucide-react'

export default function RSVP() {
  const [form, setForm] = useState({ nombre: '', telefono: '', num_personas: 1, asistira: true, restriccion_alimentaria: '', mensaje: '', lado: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return setError('Por favor ingresa tu nombre o el de tu familia.')
    setLoading(true); setError('')
    const { error: err } = await supabase.from('confirmaciones').insert([form])
    if (err) setError('Hubo un error, por favor intenta de nuevo.')
    else setDone(true)
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '0.85rem 1.1rem',
    border: '2px solid var(--nude)', borderRadius: '12px',
    fontSize: '0.95rem', background: 'white',
    color: 'var(--text-dark)', outline: 'none',
    fontFamily: 'Lato', transition: 'border-color 0.2s, box-shadow 0.2s'
  }

  if (done) return (
    <section style={{ padding: '6rem 2rem', background: 'var(--nude-light)', textAlign: 'center' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Check size={36} color="white" strokeWidth={3} />
        </div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text-dark)', marginBottom: '0.8rem', fontWeight: 400 }}>¡Muchas Gracias!</h2>
        <p style={{ color: 'var(--text-medium)', fontSize: '1.05rem', maxWidth: '400px', margin: '0 auto' }}>
          Tu confirmación ha sido recibida. ¡Nos vemos el 22 de agosto!
        </p>
        <p style={{ marginTop: '1.5rem', fontSize: '1.5rem' }}>💐</p>
      </motion.div>
    </section>
  )

  return (
    <section style={{ padding: '6rem 2rem', background: 'var(--nude-light)' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✦ ✦ ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-dark)', fontWeight: 400, marginBottom: '0.8rem' }}>Confirma tu Asistencia</h2>
          <div style={{ width: '50px', height: '2px', background: 'var(--sage)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>Favor de confirmar antes del <strong>1° de agosto de 2026</strong></p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 8px 40px rgba(139,157,119,0.1)', display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
          
          {/* Nombre */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nombre o Familia *</label>
            <input style={inputStyle} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Familia García" />
          </div>

          {/* Lado */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>¿Eres invitado de...?</label>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {[{ v: 'novio', label: '💍 Del novio' }, { v: 'novia', label: '💐 De la novia' }, { v: 'ambos', label: '💒 De ambos' }].map(o => (
                <button key={o.v} onClick={() => set('lado', o.v)} style={{ flex: '1 1 100px', padding: '0.75rem', border: '2px solid', borderColor: form.lado === o.v ? 'var(--sage)' : 'var(--nude)', background: form.lado === o.v ? 'var(--sage)' : 'white', color: form.lado === o.v ? 'white' : 'var(--text-medium)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s', fontFamily: 'Lato' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>WhatsApp / Teléfono</label>
            <input style={inputStyle} value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+52 000 000 0000" />
          </div>

          {/* Asistirá */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>¿Asistirás?</label>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              {[{ v: true, label: '✓  Sí, ahí estaré' }, { v: false, label: '✗  No podré ir' }].map(o => (
                <button key={String(o.v)} onClick={() => set('asistira', o.v)} style={{ flex: 1, padding: '0.85rem', border: '2px solid', borderColor: form.asistira === o.v ? 'var(--sage)' : 'var(--nude)', background: form.asistira === o.v ? 'var(--sage)' : 'white', color: form.asistira === o.v ? 'white' : 'var(--text-medium)', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'Lato' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Num personas */}
          {form.asistira && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Número de Personas</label>
              <input type="number" min="1" max="20" style={{ ...inputStyle, maxWidth: '140px' }} value={form.num_personas} onChange={e => set('num_personas', parseInt(e.target.value) || 1)} />
            </div>
          )}

          {/* Restricción */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Restricción Alimentaria</label>
            <input style={inputStyle} value={form.restriccion_alimentaria} onChange={e => set('restriccion_alimentaria', e.target.value)} placeholder="Vegetariano, alérgico a nueces, ninguna..." />
          </div>

          {/* Mensaje */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mensaje para los Novios</label>
            <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.mensaje} onChange={e => set('mensaje', e.target.value)} placeholder="Un mensaje de amor y buenos deseos..." />
          </div>

          {error && <p style={{ color: '#dc2626', textAlign: 'center', fontSize: '0.88rem' }}>{error}</p>}

          <button onClick={handleSubmit} disabled={loading} style={{ background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '50px', padding: '1.1rem 2rem', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Lato', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s' }}>
            <Heart size={16} fill="white" />
            {loading ? 'Enviando...' : 'Confirmar Asistencia'}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
