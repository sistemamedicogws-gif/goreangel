import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, QrCode, Copy, Check, Trash2, Users } from 'lucide-react'
import QRCode from 'qrcode'

export default function GuestManager() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nombre: '', familia: '', num_pases: 1 })
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(null)

  const APP_URL = window.location.origin

  useEffect(() => { fetchGuests() }, [])

  const fetchGuests = async () => {
    setLoading(true)
    const { data } = await supabase.from('invitados').select('*').order('created_at', { ascending: false })
    setGuests(data || [])
    setLoading(false)
  }

  const addGuest = async () => {
    if (!form.nombre.trim()) return
    setAdding(true)
    await supabase.from('invitados').insert([{ ...form, num_pases: parseInt(form.num_pases) || 1 }])
    setForm({ nombre: '', familia: '', num_pases: 1 })
    await fetchGuests()
    setAdding(false)
  }

  const deleteGuest = async (id) => {
    if (!window.confirm('¿Eliminar este invitado? Esta acción no se puede deshacer.')) return
    await supabase.from('invitados').delete().eq('id', id)
    fetchGuests()
  }

  const downloadQR = async (guest) => {
    const url = `${APP_URL}/checkin/${guest.token}`
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 500; canvas.height = 580

    // Background
    ctx.fillStyle = '#FDFBF7'
    ctx.fillRect(0, 0, 500, 580)

    // Decorative border
    ctx.strokeStyle = '#8B9D77'
    ctx.lineWidth = 3
    ctx.strokeRect(12, 12, 476, 556)
    ctx.strokeStyle = '#E8D5C4'
    ctx.lineWidth = 1
    ctx.strokeRect(18, 18, 464, 544)

    // Title
    ctx.fillStyle = '#3D3530'
    ctx.font = 'bold 22px serif'
    ctx.textAlign = 'center'
    ctx.fillText('Ángel & Goreti', 250, 60)
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#7A6E69'
    ctx.fillText('23 de Agosto · 2026', 250, 85)

    // Divider
    ctx.strokeStyle = '#8B9D77'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(80, 100); ctx.lineTo(420, 100); ctx.stroke()

    // Guest name
    ctx.fillStyle = '#3D3530'
    ctx.font = 'bold 20px serif'
    ctx.fillText(guest.nombre, 250, 130)
    if (guest.familia) {
      ctx.font = '13px sans-serif'
      ctx.fillStyle = '#7A6E69'
      ctx.fillText(guest.familia, 250, 150)
    }

    // Pases
    ctx.font = 'bold 13px sans-serif'
    ctx.fillStyle = '#8B9D77'
    ctx.fillText(`${guest.num_pases} ${guest.num_pases === 1 ? 'PASE' : 'PASES'}`, 250, 172)

    // QR code
    const qrDataUrl = await QRCode.toDataURL(url, { width: 240, margin: 1, color: { dark: '#3D3530', light: '#FFFFFF' } })
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 130, 185, 240, 240)

      // Bottom
      ctx.strokeStyle = '#E8D5C4'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(80, 440); ctx.lineTo(420, 440); ctx.stroke()
      ctx.font = '11px sans-serif'
      ctx.fillStyle = '#7A6E69'
      ctx.fillText('Presenta este código a la entrada', 250, 462)
      ctx.fillText('Tu pase de entrada personal e intransferible', 250, 480)
      ctx.fillStyle = '#8B9D77'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText('✦ ✦ ✦', 250, 540)

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `Pase-${guest.nombre.replace(/\s+/g, '_')}.png`
      link.click()
    }
    img.src = qrDataUrl
  }

  const copyLink = (guest) => {
    navigator.clipboard.writeText(`${APP_URL}/checkin/${guest.token}`)
    setCopied(guest.id)
    setTimeout(() => setCopied(null), 2500)
  }

  const inp = { padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white' }

  const stats = [
    { label: 'Total invitados', value: guests.length },
    { label: 'Total pases', value: guests.reduce((a, g) => a + (g.num_pases || 0), 0) },
    { label: 'Ya llegaron', value: guests.filter(g => g.checked_in).length },
    { label: 'Pendientes', value: guests.filter(g => !g.checked_in).length },
  ]

  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
        Gestión de Invitados
      </h2>

      {/* Add form */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '2 1 160px' }}>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Nombre / Familia *</label>
          <input style={{ ...inp, width: '100%' }} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addGuest()} placeholder="Ej: Familia García" />
        </div>
        <div style={{ flex: '2 1 160px' }}>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Referencia</label>
          <input style={{ ...inp, width: '100%' }} value={form.familia} onChange={e => setForm(f => ({ ...f, familia: e.target.value }))} placeholder="Ej: Lado del novio" />
        </div>
        <div style={{ flex: '0 1 100px' }}>
          <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}># Pases</label>
          <input type="number" min="1" max="30" style={{ ...inp, width: '100%' }} value={form.num_pases} onChange={e => setForm(f => ({ ...f, num_pases: e.target.value }))} />
        </div>
        <button onClick={addGuest} disabled={adding || !form.nombre.trim()} style={{ padding: '0.7rem 1.4rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Lato', fontWeight: 700, opacity: adding ? 0.7 : 1, whiteSpace: 'nowrap' }}>
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '1.9rem', fontFamily: 'Playfair Display', color: 'var(--sage-dark)', fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-medium)', marginTop: '0.3rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-medium)' }}>Cargando invitados...</p>
        ) : guests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-medium)' }}>
            <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>Aún no hay invitados registrados</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--nude-light)' }}>
                  {['Nombre / Familia', 'Referencia', 'Pases', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-medium)', fontFamily: 'Lato', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guests.map((g, i) => (
                  <tr key={g.id} style={{ borderTop: '1px solid var(--nude)', background: i % 2 === 0 ? 'white' : '#fdfcfb' }}>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.92rem' }}>{g.nombre}</td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-medium)', fontSize: '0.88rem' }}>{g.familia || '—'}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ background: 'var(--sage-light)', color: 'var(--sage-deeper)', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                        {g.num_pases}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ background: g.checked_in ? '#dcfce7' : '#fef9c3', color: g.checked_in ? '#166534' : '#854d0e', padding: '0.25rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                        {g.checked_in ? '✓ Llegó' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button onClick={() => downloadQR(g)} title="Descargar QR" style={{ background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontFamily: 'Lato' }}>
                          <QrCode size={13} /> QR
                        </button>
                        <button onClick={() => copyLink(g)} title="Copiar link" style={{ background: copied === g.id ? '#166534' : 'var(--nude-deeper)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', transition: 'background 0.2s' }}>
                          {copied === g.id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                        <button onClick={() => deleteGuest(g.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
