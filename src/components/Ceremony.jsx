import { motion } from 'framer-motion'
import { MapPin, Clock, Shirt } from 'lucide-react'

function SectionTitle({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ textAlign: 'center', marginBottom: '3.5rem' }}
    >
      <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
        ✦ ✦ ✦
      </p>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-dark)', fontWeight: 400, marginBottom: '1rem' }}>
        {children}
      </h2>
      <div style={{ width: '50px', height: '2px', background: 'var(--sage)', margin: '0 auto' }} />
    </motion.div>
  )
}

function Card({ title, time, place, address, color, delay, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '2.5rem',
        border: `2px solid ${color}22`,
        boxShadow: `0 8px 40px ${color}18`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: color }} />

      <div style={{
        width: '64px', height: '64px',
        background: color,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem'
      }}>
        <Icon size={26} color="white" />
      </div>

      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--text-dark)', marginBottom: '1.5rem', fontWeight: 400 }}>
        {title}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
          <Clock size={15} color={color} />
          <span style={{ color: 'var(--text-medium)', fontSize: '0.95rem' }}>{time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '0.6rem' }}>
          <MapPin size={15} color={color} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <p style={{ color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 600 }}>{place}</p>
            {address && <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem' }}>{address}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Ceremony() {
  return (
    <section style={{ padding: '6rem 2rem', background: 'var(--white)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <SectionTitle>El Gran Día</SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <Card
            title="Ceremonia Religiosa"
            time="12:00 p.m."
            place="Por confirmar"
            address="Zacatecas, México"
            color="var(--sage)"
            delay={0}
            icon={({ size, color }) => (
              <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                <path d="M12 2L12 6M12 6L9 9M12 6L15 9M3 11h18M5 11v9a1 1 0 001 1h12a1 1 0 001-1v-9" />
              </svg>
            )}
          />
          <Card
            title="Recepción y Fiesta"
            time="2:00 p.m."
            place="Por confirmar"
            address="Zacatecas, México"
            color="var(--nude-deeper)"
            delay={0.15}
            icon={({ size, color }) => (
              <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            )}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            background: 'linear-gradient(135deg, var(--nude-light), var(--sage-light))',
            borderRadius: '20px',
            padding: '1.8rem 2rem',
            display: 'flex', alignItems: 'center', gap: '1.2rem',
            border: '1px solid var(--nude)'
          }}
        >
          <div style={{
            width: '48px', height: '48px',
            background: 'var(--sage)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Shirt size={20} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>
              Código de Vestimenta
            </p>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
              Formal ✦ Etiqueta — Los colores de los novios son nude y verde salvia
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
