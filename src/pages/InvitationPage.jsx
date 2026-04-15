import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Hero from '../components/Hero'
import Ceremony from '../components/Ceremony'
import Itinerary from '../components/Itinerary'
import Gallery from '../components/Gallery'
import GiftTable from '../components/GiftTable'
import RSVP from '../components/RSVP'
import EnvelopeIntro from '../components/EnvelopeIntro'
import MusicPlayer from '../components/MusicPlayer'
import { Heart } from 'lucide-react'

export default function InvitationPage() {
  const [opened, setOpened] = useState(false)
  const [musicUrl, setMusicUrl] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    supabase.from('configuracion').select('*').eq('clave', 'musica_url').single()
      .then(({ data }) => { if (data?.valor) setMusicUrl(data.valor) })
  }, [])

  const handleOpen = () => {
    setOpened(true)
    // Start music after envelope opens
    if (audioRef.current) {
      audioRef.current.volume = 0
      audioRef.current.play().catch(() => {})
      let v = 0
      const fade = setInterval(() => {
        v = Math.min(v + 0.04, 0.65)
        if (audioRef.current) audioRef.current.volume = v
        if (v >= 0.65) clearInterval(fade)
      }, 120)
    }
  }

  return (
    <>
      {/* Audio lives here — persists even after envelope closes */}
      {musicUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
          style={{ display: 'none' }}
        />
      )}

      {/* Envelope intro */}
      <EnvelopeIntro onOpen={handleOpen} />

      {/* Invitation — renders under envelope, visible after open */}
      <div style={{
        opacity: opened ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: opened ? 'auto' : 'none'
      }}>
        <Hero />
        <Ceremony />
        <Itinerary />
        <Gallery />
        <GiftTable />
        <RSVP />

        <footer style={{
          padding: '3.5rem 2rem',
          background: 'linear-gradient(135deg, var(--sage-deeper), var(--sage-dark))',
          textAlign: 'center'
        }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--nude-light)', marginBottom: '0.6rem', fontStyle: 'italic', fontWeight: 400 }}>
            Ángel & Goretti
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: 'rgba(245,230,216,0.7)', fontSize: '0.85rem' }}>
            <Heart size={12} fill="currentColor" />
            <span>22 de Agosto · 2026 · Zacatecas, México</span>
            <Heart size={12} fill="currentColor" />
          </div>
        </footer>

        {/* Floating music button */}
        {opened && <MusicPlayer audioRef={audioRef} />}
      </div>
    </>
  )
}
