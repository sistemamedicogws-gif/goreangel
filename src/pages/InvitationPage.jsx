import Hero from '../components/Hero'
import Ceremony from '../components/Ceremony'
import Itinerary from '../components/Itinerary'
import Gallery from '../components/Gallery'
import RSVP from '../components/RSVP'
import GiftTable from '../components/GiftTable'
import { Heart } from 'lucide-react'

export default function InvitationPage() {
  return (
    <div>
      <Hero />
      <Ceremony />
      <Itinerary />
      <Gallery />
      <GiftTable />
      <RSVP />

      <footer style={{ padding: '3.5rem 2rem', background: 'linear-gradient(135deg, var(--sage-deeper), var(--sage-dark))', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--nude-light)', marginBottom: '0.6rem', fontStyle: 'italic', fontWeight: 400 }}>
          Ángel & Goreti
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', color: 'rgba(245,230,216,0.7)', fontSize: '0.85rem' }}>
          <Heart size={12} fill="currentColor" />
          <span>23 de Agosto · 2026 · Zacatecas, México</span>
          <Heart size={12} fill="currentColor" />
        </div>
      </footer>
    </div>
  )
}
