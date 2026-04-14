import { motion } from 'framer-motion'
import Countdown from './Countdown'

const petalsData = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: i * 0.6,
  duration: 7 + Math.random() * 5,
  size: 8 + Math.random() * 8
}))

function Petal({ left, delay, duration, size }) {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0, rotate: 0 }}
      animate={{ y: '110vh', opacity: [0, 0.7, 0.7, 0], rotate: [0, 120, 240, 360], x: [0, 25, -15, 10] }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: Math.random() * 6, ease: 'linear' }}
      style={{
        position: 'fixed', left: `${left}%`, top: '-20px',
        width: `${size}px`, height: `${size * 1.4}px`,
        borderRadius: '50% 0 50% 0',
        background: `rgba(${Math.random() > 0.5 ? '168,185,154' : '228,213,196'}, 0.55)`,
        pointerEvents: 'none', zIndex: 0
      }}
    />
  )
}

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, var(--nude-light) 0%, var(--white) 45%, #e8f0e0 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '2rem'
    }}>
      {petalsData.map(p => <Petal key={p.id} {...p} />)}

      {/* Decorative rings */}
      {[300, 200, 500].map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${s}px`, height: `${s}px`,
          borderRadius: '50%',
          border: '1px solid rgba(139,157,119,0.12)',
          top: i === 0 ? '8%' : i === 1 ? '70%' : '30%',
          left: i === 0 ? '3%' : i === 1 ? '75%' : '-5%',
          pointerEvents: 'none'
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ fontFamily: 'Lato', fontSize: '0.8rem', letterSpacing: '0.35em', color: 'var(--sage-dark)', textTransform: 'uppercase', marginBottom: '2.5rem' }}
        >
          ✦ Con amor los invitamos a celebrar ✦
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(3rem, 9vw, 6rem)', color: 'var(--text-dark)', lineHeight: 1.05, fontWeight: 400 }}
        >
          Ángel
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', margin: '0.8rem 0' }}
        >
          <div style={{ width: '80px', height: '1px', background: 'var(--sage)' }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '2.5rem', color: 'var(--sage)', lineHeight: 1 }}>&amp;</span>
          <div style={{ width: '80px', height: '1px', background: 'var(--sage)' }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(3rem, 9vw, 6rem)', color: 'var(--text-dark)', lineHeight: 1.05, fontWeight: 400 }}
        >
          Goreti
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', color: 'var(--sage-dark)', letterSpacing: '0.12em', marginTop: '1.5rem', marginBottom: '0.5rem' }}
        >
          23 · Agosto · 2026
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-medium)', maxWidth: '480px', lineHeight: 1.7, marginBottom: '3rem', padding: '0 1rem' }}
        >
          "Dos almas que encontraron su hogar el una en la otra… los invitamos a ser testigos del inicio de nuestra historia eterna."
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <Countdown />
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={{ position: 'absolute', bottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
      >
        <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--sage)', textTransform: 'uppercase' }}>Desliza</p>
        <div style={{ width: '1px', height: '36px', background: 'linear-gradient(to bottom, var(--sage), transparent)' }} />
      </motion.div>
    </section>
  )
}
