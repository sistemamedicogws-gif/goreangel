import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function EnvelopeIntro({ onOpen }) {
  const [phase, setPhase] = useState('idle') // idle → opening → done
  const audioRef = useRef(null)
  const [musicUrl, setMusicUrl] = useState(null)

  useEffect(() => {
    // Fetch music URL from config
    supabase.from('configuracion').select('*').eq('clave', 'musica_url').single().then(({ data }) => {
      if (data?.valor) setMusicUrl(data.valor)
    })
  }, [])

  const handleOpen = () => {
    if (phase !== 'idle') return
    setPhase('opening')

    // Start music if available
    if (audioRef.current) {
      audioRef.current.volume = 0
      audioRef.current.play().catch(() => {})
      // Fade in volume
      let vol = 0
      const fade = setInterval(() => {
        vol = Math.min(vol + 0.05, 0.7)
        if (audioRef.current) audioRef.current.volume = vol
        if (vol >= 0.7) clearInterval(fade)
      }, 150)
    }

    // After envelope opens, show invitation
    setTimeout(() => {
      setPhase('done')
      setTimeout(() => onOpen(), 600)
    }, 1800)
  }

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'linear-gradient(160deg, #e8f0e0 0%, var(--nude-light) 50%, #f0e8dc 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Floating petals background */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 100 - 50, opacity: 0 }}
              animate={{ y: '110vh', opacity: [0, 0.6, 0.6, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 6 + Math.random() * 4, delay: i * 0.4, repeat: Infinity, repeatDelay: Math.random() * 3 }}
              style={{
                position: 'absolute',
                left: `${5 + i * 8}%`,
                top: 0,
                width: `${8 + Math.random() * 8}px`,
                height: `${12 + Math.random() * 8}px`,
                borderRadius: '50% 0 50% 0',
                background: i % 2 === 0 ? 'rgba(139,157,119,0.4)' : 'rgba(196,168,130,0.4)',
                pointerEvents: 'none'
              }}
            />
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem', zIndex: 1 }}>
            {/* Names */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.35em', color: 'var(--sage-dark)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                ✦ Con amor los invitamos ✦
              </p>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'var(--text-dark)', fontWeight: 400, lineHeight: 1.1 }}>
                Ángel
              </h1>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--sage)', lineHeight: 1 }}>&amp;</p>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'var(--text-dark)', fontWeight: 400, lineHeight: 1.1 }}>
                Goretti
              </h1>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem', color: 'var(--sage-dark)', marginTop: '0.8rem', letterSpacing: '0.1em' }}>
                22 · Agosto · 2026
              </p>
            </motion.div>

            {/* Envelope */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ position: 'relative', cursor: phase === 'idle' ? 'pointer' : 'default' }}
              onClick={handleOpen}
            >
              {/* Envelope body */}
              <div style={{ position: 'relative', width: 'clamp(260px, 70vw, 380px)', height: 'clamp(170px, 45vw, 240px)' }}>

                {/* Envelope back */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'white',
                  borderRadius: '4px 4px 12px 12px',
                  boxShadow: '0 20px 60px rgba(107,127,90,0.25)',
                  border: '1px solid rgba(139,157,119,0.3)',
                  overflow: 'hidden'
                }}>
                  {/* Bottom triangle fold */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '55%',
                    background: 'linear-gradient(to bottom, #f5f0ea, #ede5d8)',
                  }} />
                  {/* Left triangle */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: '50%',
                    background: 'linear-gradient(135deg, #f0ebe2 0%, transparent 60%)',
                  }} />
                  {/* Right triangle */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0,
                    width: '50%',
                    background: 'linear-gradient(225deg, #f0ebe2 0%, transparent 60%)',
                  }} />
                  {/* Wax seal */}
                  <motion.div
                    animate={phase === 'opening' ? { scale: [1, 1.2, 0], opacity: [1, 1, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    style={{
                      position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)',
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--sage), var(--sage-dark))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 3px 12px rgba(107,127,90,0.4)',
                      zIndex: 3
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>✦</span>
                  </motion.div>
                </div>

                {/* Envelope flap (top) */}
                <motion.div
                  animate={phase === 'opening' ? { rotateX: -180, originY: 0 } : { rotateX: 0 }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '52%',
                    transformOrigin: 'top center',
                    zIndex: 4,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Front of flap */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, #f8f4ee 0%, #ede5d8 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    borderTop: '1px solid rgba(139,157,119,0.2)',
                  }} />
                  {/* Back of flap (visible when open) */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(0deg, #f8f4ee 0%, #ede5d8 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateX(180deg)',
                  }} />
                </motion.div>

                {/* Letter coming out */}
                <motion.div
                  initial={{ y: 0, opacity: 0 }}
                  animate={phase === 'opening' ? { y: '-65%', opacity: 1 } : { y: 0, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', top: '15%', left: '8%', right: '8%',
                    background: 'white',
                    borderRadius: '8px',
                    padding: '1.2rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    zIndex: 2,
                    textAlign: 'center',
                    border: '1px solid rgba(139,157,119,0.15)'
                  }}
                >
                  <p style={{ fontFamily: 'Playfair Display', fontSize: '0.75rem', color: 'var(--sage)', marginBottom: '0.3rem' }}>✦ Invitación de Boda ✦</p>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-dark)', lineHeight: 1.4 }}>
                    Ángel & Goretti
                  </p>
                  <p style={{ fontFamily: 'Lato', fontSize: '0.65rem', color: 'var(--sage-dark)', marginTop: '0.3rem', letterSpacing: '0.1em' }}>22 · 08 · 2026</p>
                </motion.div>
              </div>

              {/* Click hint */}
              {phase === 'idle' && (
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ textAlign: 'center', marginTop: '0.8rem' }}
                >
                  <p style={{ fontFamily: 'Lato', fontSize: '0.68rem', color: 'var(--sage-dark)', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>
                    Toca para abrir
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* CTA Button */}
            {phase === 'idle' && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpen}
                style={{
                  background: 'var(--sage)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '1rem 2.5rem',
                  fontFamily: 'Lato',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  boxShadow: '0 8px 28px rgba(107,127,90,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
              >
                💌 Abrir mi invitación
              </motion.button>
            )}
          </div>

          {/* Hidden audio */}
          {musicUrl && (
            <audio ref={audioRef} src={musicUrl} loop preload="auto" style={{ display: 'none' }} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
