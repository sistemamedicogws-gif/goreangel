import { useState, useRef } from 'react'
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
  const audioRef = useRef(null)

  const handleOpen = () => {
    setOpened(true)
    // Pass audio ref to music player via a shared mechanism
    if (audioRef.current) {
      audioRef.current.volume = 0.7
    }
  }

  return (
    <>
      {/* Envelope intro screen */}
      <EnvelopeIntro onOpen={handleOpen} audioRef={audioRef} />

      {/* Invitation — always rendered but only visible after opening */}
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

        {/* Floating music button — appears after opening */}
        {opened && <MusicPlayer audioRef={audioRef} />}
      </div>
    </>
  )
}
