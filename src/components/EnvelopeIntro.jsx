import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

const PETALS = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  angle: (i / 32) * 360 + Math.random() * 11,
  distance: 140 + Math.random() * 260,
  size: 7 + Math.random() * 11,
  color: i % 3 === 0 ? 'rgba(139,157,119,0.75)' : i % 3 === 1 ? 'rgba(196,168,130,0.68)' : 'rgba(210,185,160,0.65)',
  delay: Math.random() * 0.18,
  rotate: Math.random() * 720 - 360
}))

const BG_PETALS = Array.from({ length: 14 }, (_, i) => ({
  id: i, left: 2 + i * 7,
  duration: 7 + Math.random() * 5, delay: i * 0.45,
  size: 7 + Math.random() * 7
}))

export default function EnvelopeIntro({ onOpen, audioRef }) {
  const [phase, setPhase] = useState('idle')
  const [musicUrl, setMusicUrl] = useState(null)
  const localAudio = useRef(null)

  useEffect(() => {
    supabase.from('configuracion').select('*').eq('clave', 'musica_url').single()
      .then(({ data }) => { if (data?.valor) setMusicUrl(data.valor) })
  }, [])

  const startMusic = () => {
    const a = localAudio.current
    if (!a) return
    a.volume = 0
    a.play().catch(() => {})
    let v = 0
    const t = setInterval(() => {
      v = Math.min(v + 0.04, 0.65)
      if (localAudio.current) localAudio.current.volume = v
      if (v >= 0.65) clearInterval(t)
    }, 120)
    if (audioRef) audioRef.current = a
  }

  const handleOpen = () => {
    if (phase !== 'idle') return
    setPhase('opening')
    startMusic()
    setTimeout(() => setPhase('exploding'), 650)
    setTimeout(() => { setPhase('done'); setTimeout(onOpen, 500) }, 1850)
  }

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(160deg, #eaf0e2 0%, #f5ece0 55%, #ede3d4 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', overflow: 'hidden',
            padding: 'clamp(1rem, 3vw, 2.5rem)'
          }}
        >
          {/* Background floating petals */}
          {BG_PETALS.map(p => (
            <motion.div key={p.id}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: '110vh', opacity: [0, 0.5, 0.5, 0], rotate: [0, 200, 400] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
              style={{
                position: 'absolute', left: `${p.left}%`, top: 0,
                width: `${p.size}px`, height: `${p.size * 1.4}px`,
                borderRadius: '50% 0 50% 0', pointerEvents: 'none',
                background: p.id % 2 === 0 ? 'rgba(139,157,119,0.3)' : 'rgba(196,168,130,0.3)'
              }}
            />
          ))}

          {/* Petal explosion */}
          {(phase === 'exploding') && PETALS.map(p => {
            const rad = (p.angle * Math.PI) / 180
            return (
              <motion.div key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.2, rotate: 0 }}
                animate={{ x: Math.cos(rad) * p.distance, y: Math.sin(rad) * p.distance, opacity: 0, scale: 1.2, rotate: p.rotate }}
                transition={{ duration: 1.1, delay: p.delay, ease: [0.15, 0.85, 0.35, 1] }}
                style={{
                  position: 'absolute', left: '50%', top: '55%',
                  width: `${p.size}px`, height: `${p.size * 1.4}px`,
                  borderRadius: '50% 0 50% 0', background: p.color,
                  pointerEvents: 'none', zIndex: 20
                }}
              />
            )
          })}

          {/* Names */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            style={{ textAlign: 'center', marginBottom: 'clamp(1rem, 2.5vw, 2rem)', zIndex: 2 }}
          >
            <p style={{ fontFamily: 'Lato', fontSize: '0.65rem', letterSpacing: '0.35em', color: 'var(--sage-dark)', textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.85 }}>
              ✦ Con amor los invitamos ✦
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 6.5vw, 4.5rem)', color: 'var(--text-dark)', fontWeight: 400, lineHeight: 1.05, margin: 0 }}>
              Ángel
            </h1>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 'clamp(1.3rem, 3.5vw, 2.2rem)', color: 'var(--sage)', lineHeight: 1, margin: '0.1rem 0' }}>
              &amp;
            </p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 6.5vw, 4.5rem)', color: 'var(--text-dark)', fontWeight: 400, lineHeight: 1.05, margin: 0 }}>
              Goretti
            </h1>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--sage-dark)', marginTop: '0.4rem', letterSpacing: '0.12em' }}>
              22 · Agosto · 2026
            </p>
          </motion.div>

          {/* Envelope */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{
              opacity: phase === 'exploding' ? 0 : 1,
              y: phase === 'exploding' ? -30 : 0,
              scale: phase === 'exploding' ? 0.88 : 1
            }}
            transition={{ duration: phase === 'exploding' ? 0.45 : 0.7, delay: phase === 'exploding' ? 0 : 0.7 }}
            onClick={handleOpen}
            style={{ cursor: phase === 'idle' ? 'pointer' : 'default', position: 'relative', zIndex: 2, width: 'min(320px, 82vw)' }}
          >
            {/* Envelope container with aspect ratio */}
            <div style={{ position: 'relative', paddingBottom: '62%' }}>
              {/* Body */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'white', borderRadius: '4px 4px 14px 14px',
                boxShadow: '0 16px 48px rgba(107,127,90,0.2), 0 4px 14px rgba(0,0,0,0.07)',
                border: '1px solid rgba(139,157,119,0.22)', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #f2ede4 0%, transparent 52%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(225deg, #f2ede4 0%, transparent 52%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '54%', background: 'linear-gradient(to top, #ede3d4, #f5ece0)' }} />
                {/* Wax seal */}
                <motion.div
                  animate={(phase === 'opening' || phase === 'exploding') ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] } : {}}
                  transition={{ duration: 0.38 }}
                  style={{
                    position: 'absolute', bottom: '16%', left: '50%', transform: 'translateX(-50%)',
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--sage), var(--sage-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 14px rgba(107,127,90,0.42)', zIndex: 4, fontSize: '1.05rem'
                  }}
                >✦</motion.div>
              </div>

              {/* Flap */}
              <motion.div
                animate={(phase === 'opening' || phase === 'exploding') ? { rotateX: -176 } : { rotateX: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '52%',
                  transformOrigin: 'top center', zIndex: 5, transformStyle: 'preserve-3d', perspective: '700px'
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(175deg, #faf6f0 0%, #ede3d4 100%)',
                  clipPath: 'polygon(0 0, 100% 0, 50% 98%)',
                  borderTop: '1px solid rgba(139,157,119,0.18)'
                }} />
              </motion.div>

              {/* Letter coming out */}
              <motion.div
                animate={(phase === 'opening' || phase === 'exploding') ? { y: '-58%', opacity: 1 } : { y: '8%', opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                style={{
                  position: 'absolute', top: '12%', left: '10%', right: '10%',
                  background: 'white', borderRadius: '8px', padding: '0.8rem',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)', zIndex: 3, textAlign: 'center',
                  border: '1px solid rgba(139,157,119,0.15)'
                }}
              >
                <p style={{ fontFamily: 'Playfair Display', fontSize: '0.68rem', color: 'var(--sage)', marginBottom: '0.2rem' }}>✦ Invitación de Boda ✦</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-dark)' }}>Ángel & Goretti</p>
                <p style={{ fontFamily: 'Lato', fontSize: '0.6rem', color: 'var(--sage-dark)', marginTop: '0.2rem', letterSpacing: '0.1em' }}>22 · 08 · 2026</p>
              </motion.div>
            </div>

            {/* Tap hint */}
            {phase === 'idle' && (
              <motion.p
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontFamily: 'Lato', fontSize: '0.62rem', color: 'var(--sage-dark)', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.72, textAlign: 'center', marginTop: '0.6rem' }}
              >
                Toca para abrir
              </motion.p>
            )}
          </motion.div>

          {/* CTA button */}
          <AnimatePresence>
            {phase === 'idle' && (
              <motion.button
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleOpen}
                style={{
                  marginTop: 'clamp(0.8rem, 2vw, 1.5rem)',
                  background: 'var(--sage)', color: 'white', border: 'none',
                  borderRadius: '50px', padding: '0.85rem 2.2rem',
                  fontFamily: 'Lato', fontWeight: 700, fontSize: '0.9rem',
                  letterSpacing: '0.08em', cursor: 'pointer',
                  boxShadow: '0 8px 28px rgba(107,127,90,0.32)',
                  zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                💌 Abrir mi invitación
              </motion.button>
            )}
          </AnimatePresence>

          {musicUrl && <audio ref={localAudio} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
