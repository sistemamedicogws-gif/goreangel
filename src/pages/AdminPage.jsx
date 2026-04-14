import { useState } from 'react'
import { Lock, Users, Image, CheckSquare, LogOut, Eye, EyeOff, Gift, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import GuestManager from '../components/admin/GuestManager'
import PhotoManager from '../components/admin/PhotoManager'
import ConfirmationsManager from '../components/admin/ConfirmationsManager'
import GiftManager from '../components/admin/GiftManager'
import VenueConfig from '../components/admin/VenueConfig'

const ADMIN_PASSWORD = 'MagoAn#02'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('guests')

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); setError('') }
    else { setError('Contraseña incorrecta'); setPassword('') }
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(150deg, var(--sage-dark) 0%, var(--nude-deeper) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '28px', padding: '3rem 2.5rem', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.2)' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Lock size={26} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: '0.4rem', color: 'var(--text-dark)', fontWeight: 400 }}>Panel Admin</h1>
          <p style={{ color: 'var(--text-medium)', marginBottom: '2rem', fontSize: '0.9rem', fontStyle: 'italic' }}>Ángel & Goreti · 2026</p>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input type={showPass ? 'text' : 'password'} placeholder="Contraseña" value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', padding: '0.9rem 3rem 0.9rem 1.2rem', border: '2px solid var(--nude)', borderRadius: '12px', fontSize: '1rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', boxSizing: 'border-box' }} />
            <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-medium)' }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.88rem' }}>{error}</p>}
          <button onClick={handleLogin} style={{ width: '100%', padding: '1rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700 }}>
            Ingresar
          </button>
        </motion.div>
      </div>
    )
  }

  const tabs = [
    { id: 'guests', label: 'Invitados', Icon: Users },
    { id: 'photos', label: 'Imágenes', Icon: Image },
    { id: 'venues', label: 'Lugares', Icon: MapPin },
    { id: 'confirmations', label: 'Confirmaciones', Icon: CheckSquare },
    { id: 'gifts', label: 'Regalos', Icon: Gift },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3f0' }}>
      <div style={{ background: 'var(--sage-dark)', padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: '1.3rem', fontWeight: 400 }}>Panel de Administración</h1>
          <p style={{ color: 'rgba(245,230,216,0.7)', fontSize: '0.78rem' }}>Ángel & Goreti · 23 Agosto 2026</p>
        </div>
        <button onClick={() => setAuthenticated(false)} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '0.55rem 1rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontFamily: 'Lato' }}>
          <LogOut size={15} /> Salir
        </button>
      </div>

      <div style={{ background: 'white', borderBottom: '1px solid var(--nude)', display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ padding: '1rem 1.2rem', border: 'none', borderBottom: `3px solid ${activeTab === id ? 'var(--sage)' : 'transparent'}`, background: 'transparent', color: activeTab === id ? 'var(--sage-dark)' : 'var(--text-medium)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: activeTab === id ? 700 : 400, fontFamily: 'Lato', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'guests' && <GuestManager />}
        {activeTab === 'photos' && <PhotoManager />}
        {activeTab === 'venues' && <VenueConfig />}
        {activeTab === 'confirmations' && <ConfirmationsManager />}
        {activeTab === 'gifts' && <GiftManager />}
      </div>
    </div>
  )
}
