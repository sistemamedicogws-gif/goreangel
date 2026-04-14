import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Block({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '14px',
          padding: '0.9rem 1rem',
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 700,
          color: 'var(--text-dark)',
          minWidth: '64px',
          lineHeight: 1
        }}
      >
        {String(value ?? 0).padStart(2, '0')}
      </motion.div>
      <p style={{
        marginTop: '0.5rem',
        fontSize: '0.65rem',
        letterSpacing: '0.2em',
        color: 'var(--sage-dark)',
        textTransform: 'uppercase',
        fontFamily: 'Lato'
      }}>
        {label}
      </p>
    </div>
  )
}

export default function Countdown() {
  const [time, setTime] = useState({})

  useEffect(() => {
    const target = new Date('2026-08-23T12:00:00')
    const calc = () => {
      const diff = target - new Date()
      if (diff <= 0) return setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <p style={{ textAlign: 'center', fontSize: '0.7rem', letterSpacing: '0.25em', color: 'var(--sage-dark)', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: 'Lato' }}>
        Faltan
      </p>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Block value={time.days} label="Días" />
        <span style={{ color: 'var(--sage)', fontSize: '1.5rem', fontFamily: 'Playfair Display', marginBottom: '1.5rem' }}>:</span>
        <Block value={time.hours} label="Horas" />
        <span style={{ color: 'var(--sage)', fontSize: '1.5rem', fontFamily: 'Playfair Display', marginBottom: '1.5rem' }}>:</span>
        <Block value={time.minutes} label="Minutos" />
        <span style={{ color: 'var(--sage)', fontSize: '1.5rem', fontFamily: 'Playfair Display', marginBottom: '1.5rem' }}>:</span>
        <Block value={time.seconds} label="Segundos" />
      </div>
    </div>
  )
}
