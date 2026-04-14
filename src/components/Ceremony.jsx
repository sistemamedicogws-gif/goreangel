import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Shirt, Navigation } from 'lucide-react'
import { supabase } from '../lib/supabase'

function SectionTitle({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
      <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✦ ✦ ✦</p>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-dark)', fontWeight: 400, marginBottom: '1rem' }}>{children}</h2>
      <div style={{ width: '50px', height: '2px', background: 'var(--sage)', margin: '0 auto' }} />
    </motion.div>
  )
}

function VenueCard({ title, time, place, address, mapsUrl, color, delay, imageUrl, emoji }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', border: `1px solid ${color}22`, boxShadow: `0 8px 40px ${color}15` }}
    >
      {/* Venue image */}
      {imageUrl ? (
        <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
          <img src={imageUrl} alt={place} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 50%, ${color}44)` }} />
        </div>
      ) : (
        <div style={{ height: '120px', background: `linear-gradient(135deg, ${color}15, ${color}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '3.5rem' }}>{emoji}</span>
        </div>
      )}

      {/* Top accent bar */}
      <div style={{ height: '4px', background: color }} />

      {/* Content */}
      <div style={{ padding: '1.8rem 2rem' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', color: 'var(--text-dark)', marginBottom: '1.3rem', fontWeight: 400 }}>{title}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: mapsUrl ? '1.3rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock size={15} color={color} style={{ flexShrink: 0 }} />
            <span style={{ color: 'var(--text-medium)', fontSize: '0.92rem' }}>{time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <MapPin size={15} color={color} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              {place && <p style={{ color: 'var(--text-dark)', fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.15rem' }}>{place}</p>}
              {address && <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem' }}>{address}</p>}
            </div>
          </div>
        </div>

        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: color, color: 'white', textDecoration: 'none', borderRadius: '50px', padding: '0.6rem 1.2rem', fontSize: '0.82rem', fontFamily: 'Lato', fontWeight: 700, letterSpacing: '0.05em', transition: 'opacity 0.2s' }}>
            <Navigation size={13} /> Cómo llegar
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function Ceremony() {
  const [venues, setVenues] = useState(null)
  const [ceremoniaImg, setCeremoniaImg] = useState(null)
  const [fiestaImg, setFiestaImg] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch venue config
      const { data: cfg } = await supabase.from('configuracion').select('*').eq('clave', 'venues').single()
      if (cfg?.valor) {
        try { setVenues(JSON.parse(cfg.valor)) } catch {}
      }

      // Fetch ceremony image
      const { data: cerData } = await supabase.storage.from('galeria').list('ceremonia', { limit: 1 })
      if (cerData && cerData.length > 0 && !cerData[0].name.includes('emptyFolder')) {
        setCeremoniaImg(supabase.storage.from('galeria').getPublicUrl(`ceremonia/${cerData[0].name}`).data.publicUrl)
      }

      // Fetch fiesta image
      const { data: fieData } = await supabase.storage.from('galeria').list('fiesta', { limit: 1 })
      if (fieData && fieData.length > 0 && !fieData[0].name.includes('emptyFolder')) {
        setFiestaImg(supabase.storage.from('galeria').getPublicUrl(`fiesta/${fieData[0].name}`).data.publicUrl)
      }
    }
    fetchAll()
  }, [])

  const v = venues || {}

  return (
    <section style={{ padding: '6rem 2rem', background: 'var(--white)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <SectionTitle>El Gran Día</SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <VenueCard
            title="Ceremonia Religiosa"
            time={v.ceremonia_hora || '12:00 p.m.'}
            place={v.ceremonia_nombre || 'Por confirmar'}
            address={v.ceremonia_direccion || 'Zacatecas, México'}
            mapsUrl={v.ceremonia_maps_url}
            color="var(--sage)"
            delay={0}
            imageUrl={ceremoniaImg}
            emoji="⛪"
          />
          <VenueCard
            title="Recepción y Fiesta"
            time={v.fiesta_hora || '2:00 p.m.'}
            place={v.fiesta_nombre || 'Por confirmar'}
            address={v.fiesta_direccion || 'Zacatecas, México'}
            mapsUrl={v.fiesta_maps_url}
            color="var(--nude-deeper)"
            delay={0.15}
            imageUrl={fiestaImg}
            emoji="🎉"
          />
        </div>

        {/* Dress code */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'linear-gradient(135deg, var(--nude-light), var(--sage-light))', borderRadius: '20px', padding: '1.8rem 2rem', display: 'flex', alignItems: 'center', gap: '1.2rem', border: '1px solid var(--nude)', flexWrap: 'wrap' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shirt size={20} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Código de Vestimenta</p>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem', letterSpacing: '0.08em' }}>
              Formal ✦ Etiqueta — Los colores de los novios son <strong>nude</strong> y <strong>verde salvia</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
