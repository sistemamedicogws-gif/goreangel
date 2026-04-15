import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function MusicPlayer({ audioRef }) {
  const [playing, setPlaying] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show button after invitation opens
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  const toggle = () => {
    if (!audioRef?.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  if (!visible) return null

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.5 }}
      onClick={toggle}
      title={playing ? 'Pausar música' : 'Reproducir música'}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'var(--sage)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(107,127,90,0.4)',
        zIndex: 1000,
        fontSize: '1.2rem',
        transition: 'background 0.2s'
      }}
    >
      {playing ? '🎵' : '🔇'}
      {/* Pulse ring when playing */}
      {playing && (
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '2px solid var(--sage)',
            pointerEvents: 'none'
          }}
        />
      )}
    </motion.button>
  )
}
