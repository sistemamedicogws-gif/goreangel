import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, QrCode, Copy, Check, Trash2, Users, Pencil, X, Save } from 'lucide-react'
import QRCode from 'qrcode'

export default function GuestManager() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nombre: '', familia: '', num_pases: 1 })
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(null)
  const [editGuest, setEditGuest] = useState(null) // guest being edited
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

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

  const openEdit = (g) => {
    setEditGuest(g)
    setEditForm({ nombre: g.nombre, familia: g.familia || '', num_pases: g.num_pases })
  }

  const saveEdit = async () => {
    if (!editForm.nombre.trim()) return
    setSaving(true)
    await supabase.from('invitados').update({
      nombre: editForm.nombre.trim(),
      familia: editForm.familia.trim(),
      num_pases: parseInt(editForm.num_pases) || 1
    }).eq('id', editGuest.id)
    await fetchGuests()
    setEditGuest(null)
    setSaving(false)
  }

  const deleteGuest = async (g) => {
    if (!window.confirm(`¿Eliminar el pase de "${g.nombre}"?\nEsto también invalida su QR. No se puede deshacer.`)) return
    await supabase.from('invitados').delete().eq('id', g.id)
    fetchGuests()
  }

  const downloadQR = async (guest) => {
    const url = `${APP_URL}/checkin/${guest.token}`
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 500; canvas.height = 580
    ctx.fillStyle = '#FDFBF7'
    ctx.fillRect(0, 0, 500, 580)
    ctx.strokeStyle = '#8B9D77'; ctx.lineWidth = 3
    ctx.strokeRect(12, 12, 476, 556)
    ctx.strokeStyle = '#E8D5C4'; ctx.lineWidth = 1
    ctx.strokeRect(18, 18, 464, 544)
    ctx.fillStyle = '#3D3530'; ctx.font = 'bold 22px serif'; ctx.textAlign = 'center'
    ctx.fillText('Ángel & Goreti', 250, 60)
    ctx.font = '14px sans-serif'; ctx.fillStyle = '#7A6E69'
    ctx.fillText('23 de Agosto · 2026', 250, 85)
    ctx.strokeStyle = '#8B9D77'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(80, 100); ctx.lineTo(420, 100); ctx.stroke()
    ctx.fillStyle = '#3D3530'; ctx.font = 'bold 20px serif'
    ctx.fillText(guest.nombre, 250, 130)
    if (guest.familia) { ctx.font = '13px sans-serif'; ctx.fillStyle = '#7A6E69'; ctx.fillText(guest.familia, 250, 150) }
    ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#8B9D77'
    ctx.fillText(`${guest.num_pases} ${guest.num_pases === 1 ? 'PASE' : 'PASES'}`, 250, 172)
    const qrDataUrl = await QRCode.toDataURL(url, { width: 240, margin: 1, color: { dark: '#3D3530', light: '#FFFFFF' } })
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 130, 185, 240, 240)
      ctx.strokeStyle = '#E8D5C4'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(80, 440); ctx.lineTo(420, 440); ctx.stroke()
      ctx.font = '11px sans-serif'; ctx.fillStyle = '#7A6E69'
      ctx.fillText('Presenta este código a la entrada', 250, 462)
      ctx.fillText('Pase personal e intransferible', 250, 480)
      ctx.fillStyle = '#8B9D77'; ctx.font = 'bold 11px sans-serif'
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

  const filtered = guests.filter(g =>
    g.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (g.familia || '').toLowerCase().includes(search.toLowerCase())
  )

  const stats = [
    { label: 'Total invitados', value: guests.length },
    { label: 'Total pases', value: guests.reduce((a, g) => a + (g.num_pases || 0), 0) },
    { label: 'Ya llegaron', value: guests.filter(g => g.checked_in).length },
    { label: 'Pendientes', value: guests.filter(g => !g.checked_in).length },
  ]

  const inp = { padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white' }

  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '0.4rem', color: 'var(--text-dark)' }}>
        Gestión de Invitados
      </h2>
      <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
        Lista maestra de pases QR. Puedes agregar manualmente o crear desde Confirmaciones.
      </p>

      {/* Add form */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '2 1 160px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Nombre / Familia *</label>
          <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addGuest()} placeholder="Ej: Familia García" />
        </div>
        <div style={{ flex: '2 1 160px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Referencia</label>
          <input style={{ ...inp, width: '100%', boxSizing: 'border-box' }} value={form.familia} onChange={e => setForm(f => ({ ...f, familia: e.target.value }))} placeholder="Ej: Lado del novio" />
        </div>
        <div style={{ flex: '0 1 100px' }}>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}># Pases</label>
          <input type="number" min="1" max="30" style={{ ...inp, width: '100%', boxSizing: 'border-box' }} value={form.num_pases} onChange={e => setForm(f => ({ ...f, num_pases: e.target.value }))} />
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

      {/* Search */}
      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar invitado..." style={{ ...inp, width: '100%', boxSizing: 'border-box', paddingLeft: '1rem' }} />
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-medium)' }}>Cargando...</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-medium)' }}>
            <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>{guests.length === 0 ? 'Aún no hay invitados' : 'Sin resultados'}</p>
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
                {filtered.map((g, i) => (
                  <tr key={g.id} style={{ borderTop: '1px solid var(--nude)', background: i % 2 === 0 ? 'white' : '#fdfcfb' }}>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.92rem' }}>{g.nombre}</td>
                    <td style={{ padding: '0.9rem 1rem', color: 'var(--text-medium)', fontSize: '0.88rem' }}>{g.familia || '—'}</td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ background: 'var(--sage-light)', color: 'var(--sage-deeper)', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>{g.num_pases}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span style={{ background: g.checked_in ? '#dcfce7' : '#fef9c3', color: g.checked_in ? '#166534' : '#854d0e', padding: '0.25rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                        {g.checked_in ? '✓ Llegó' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button onClick={() => downloadQR(g)} title="Descargar QR" style={{ background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.4rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontFamily: 'Lato' }}>
                          <QrCode size={13} /> QR
                        </button>
                        <button onClick={() => copyLink(g)} title="Copiar link" style={{ background: copied === g.id ? '#166534' : 'var(--nude-deeper)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.4rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', transition: 'background 0.2s' }}>
                          {copied === g.id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                        <button onClick={() => openEdit(g)} title="Editar" style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '8px', padding: '0.4rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}>
                          <Pencil size={13} /> Editar
                        </button>
                        <button onClick={() => deleteGuest(g)} title="Eliminar" style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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

      {/* EDIT MODAL */}
      {editGuest && (
        <div onClick={() => !saving && setEditGuest(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--text-dark)', fontWeight: 400 }}>Editar Invitado</h3>
              <button onClick={() => setEditGuest(null)} style={{ background: 'var(--nude-light)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="var(--text-medium)" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Nombre / Familia *</label>
                <input value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} style={{ ...inp, width: '100%', boxSizing: 'border-box' }} placeholder="Nombre del invitado" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Referencia</label>
                <input value={editForm.familia} onChange={e => setEditForm(f => ({ ...f, familia: e.target.value }))} style={{ ...inp, width: '100%', boxSizing: 'border-box' }} placeholder="Lado del novio, amigos, etc." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}># Pases</label>
                <input type="number" min="1" max="30" value={editForm.num_pases} onChange={e => setEditForm(f => ({ ...f, num_pases: e.target.value }))} style={{ ...inp, width: '120px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ background: 'var(--nude-light)', borderRadius: '10px', padding: '0.8rem 1rem', fontSize: '0.78rem', color: 'var(--text-medium)' }}>
                ⚠️ El link del QR <strong>no cambia</strong> al editar — el invitado puede seguir usando el mismo.
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button onClick={() => setEditGuest(null)} style={{ flex: 1, padding: '0.85rem', border: '2px solid var(--nude)', borderRadius: '12px', background: 'white', cursor: 'pointer', color: 'var(--text-medium)', fontFamily: 'Lato' }}>
                  Cancelar
                </button>
                <button onClick={saveEdit} disabled={saving || !editForm.nombre.trim()} style={{ flex: 2, padding: '0.85rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}>
                  <Save size={15} /> {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
