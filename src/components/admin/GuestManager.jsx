import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, QrCode, Trash2, Users, Pencil, X, Save, MessageCircle, Check, ChevronDown, ChevronUp } from 'lucide-react'
import QRCode from 'qrcode'

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://goreangel.vercel.app'
const TZ = 'America/Mexico_City'
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: TZ }) : ''

function GuestCard({ g, onEdit, onDelete, onCreatePase, onWhatsApp, onDownloadQR, creating }) {
  const [expanded, setExpanded] = useState(false)
  const hasRSVP = !!g._conf
  const hasTel = g._conf?.telefono || g.telefono
  const hasDetail = hasRSVP && (g._conf.restriccion_alimentaria || g._conf.mensaje)

  return (
    <div style={{
      background: 'white', borderRadius: '16px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      borderLeft: `5px solid ${g._type === 'sin_pase' ? '#f59e0b' : g.checked_in ? '#16a34a' : 'var(--sage)'}`,
      overflow: 'hidden', transition: 'box-shadow 0.2s'
    }}>
      {/* Main row */}
      <div style={{ padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Status icon */}
        <div style={{ flexShrink: 0, width: '38px', height: '38px', borderRadius: '50%', background: g._type === 'sin_pase' ? '#fef3c7' : g.checked_in ? '#dcfce7' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
          {g._type === 'sin_pase' ? '⚠️' : g.checked_in ? '✅' : '🎟'}
        </div>

        {/* Name + badges */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <p style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '1rem' }}>{g.nombre}</p>
            {g.familia && <span style={{ color: 'var(--text-medium)', fontSize: '0.8rem' }}>· {g.familia}</span>}
          </div>

          {/* Status badges row */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: 'var(--sage-light)', color: 'var(--sage-deeper)', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
              🎟 {g.num_pases} {g.num_pases === 1 ? 'pase' : 'pases'}
            </span>

            {g._type === 'guest' && (
              <span style={{ background: g.checked_in ? '#dcfce7' : '#fef9c3', color: g.checked_in ? '#166534' : '#854d0e', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>
                {g.checked_in ? `✓ Llegó ${fmtTime(g.checked_in_at)}` : '⏳ Pendiente'}
              </span>
            )}

            {g._type === 'sin_pase' && (
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>
                ⚠️ Sin pase QR
              </span>
            )}

            {hasRSVP && (
              <span style={{ background: g._conf.asistira ? '#dcfce7' : '#fee2e2', color: g._conf.asistira ? '#166534' : '#991b1b', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem' }}>
                {g._conf.asistira ? '✓ RSVP' : '✗ RSVP'}
              </span>
            )}

            {hasTel && (
              <span style={{ color: 'var(--text-medium)', fontSize: '0.75rem' }}>
                📱 {g._conf?.telefono || g.telefono}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flexShrink: 0, alignItems: 'center' }}>
          {g._type === 'guest' ? (
            <>
              <button onClick={() => onDownloadQR(g)} title="Descargar QR" style={{ background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontFamily: 'Lato', whiteSpace: 'nowrap' }}>
                <QrCode size={13} /> QR
              </button>
              <button onClick={() => onWhatsApp(g)} title="Enviar por WhatsApp" style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontFamily: 'Lato', whiteSpace: 'nowrap' }}>
                <MessageCircle size={13} /> WA
              </button>
              <button onClick={() => onEdit(g)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '8px', padding: '0.5rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}>
                <Pencil size={13} /> Editar
              </button>
              <button onClick={() => onDelete(g)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.5rem 0.6rem', cursor: 'pointer', display: 'flex' }}>
                <Trash2 size={13} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onCreatePase(g)} disabled={creating} style={{ background: 'linear-gradient(135deg, #25D366, #1da851)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.55rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Lato', fontWeight: 700, fontSize: '0.82rem', opacity: creating ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                <MessageCircle size={14} />
                {creating ? 'Creando...' : '📲 Crear pase + WA'}
              </button>
              <button onClick={() => onEdit(g)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '8px', padding: '0.5rem 0.6rem', cursor: 'pointer', display: 'flex' }}>
                <Pencil size={13} />
              </button>
              <button onClick={() => onDelete(g)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.5rem 0.6rem', cursor: 'pointer', display: 'flex' }}>
                <Trash2 size={13} />
              </button>
            </>
          )}

          {/* Expand toggle if has RSVP details */}
          {hasDetail && (
            <button onClick={() => setExpanded(v => !v)} style={{ background: 'var(--nude-light)', border: '1px solid var(--nude)', borderRadius: '8px', padding: '0.5rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-medium)' }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* RSVP detail panel — expandable */}
      {hasDetail && expanded && (
        <div style={{ borderTop: '1px solid var(--nude)', background: 'var(--nude-light)', padding: '0.9rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {g._conf.restriccion_alimentaria && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🥗</span>
              <div>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.1rem' }}>Restricción alimentaria</p>
                <p style={{ color: 'var(--text-dark)', fontSize: '0.88rem', fontWeight: 600 }}>{g._conf.restriccion_alimentaria}</p>
              </div>
            </div>
          )}
          {g._conf.mensaje && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>💬</span>
              <div>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.1rem' }}>Mensaje</p>
                <p style={{ color: 'var(--text-dark)', fontSize: '0.88rem', fontStyle: 'italic' }}>"{g._conf.mensaje}"</p>
              </div>
            </div>
          )}
          <p style={{ fontSize: '0.7rem', color: 'var(--text-medium)' }}>
            📅 Confirmó: {new Date(g._conf.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TZ })}
          </p>
        </div>
      )}
    </div>
  )
}

export default function GuestManager() {
  const [guests, setGuests] = useState([])
  const [confirmations, setConfirmations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [addForm, setAddForm] = useState({ nombre: '', familia: '', num_pases: 1 })
  const [adding, setAdding] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [creatingId, setCreatingId] = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: g }, { data: c }] = await Promise.all([
      supabase.from('invitados').select('*').order('created_at', { ascending: false }),
      supabase.from('confirmaciones').select('*').order('created_at', { ascending: false })
    ])
    setGuests(g || [])
    setConfirmations(c || [])
    setLoading(false)
  }

  const unified = useMemo(() => {
    const withPase = (guests || []).map(g => ({
      ...g, _type: 'guest',
      _conf: (confirmations || []).find(c => c.invitado_id === g.id) || null
    }))
    const sinPase = (confirmations || [])
      .filter(c => c.asistira && !c.invitado_id)
      .map(c => ({
        id: `conf-${c.id}`, _confId: c.id,
        nombre: c.nombre, num_pases: c.num_personas || 1,
        familia: '', telefono: c.telefono,
        checked_in: false, token: null,
        _type: 'sin_pase', _conf: c
      }))
    return [...withPase, ...sinPase]
  }, [guests, confirmations])

  const filtered = unified.filter(g => {
    const ms = g.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (g.familia || '').toLowerCase().includes(search.toLowerCase())
    if (filter === 'pase') return ms && g._type === 'guest'
    if (filter === 'sin_pase') return ms && g._type === 'sin_pase'
    if (filter === 'llegaron') return ms && g.checked_in
    if (filter === 'pendientes') return ms && !g.checked_in
    return ms
  })

  const totalPases = guests.reduce((a, g) => a + (g.num_pases || 0), 0)
  const llegaron = guests.filter(g => g.checked_in).length
  const sinPaseCount = unified.filter(g => g._type === 'sin_pase').length

  const addGuest = async () => {
    if (!addForm.nombre.trim()) return
    setAdding(true)
    await supabase.from('invitados').insert([{ ...addForm, num_pases: parseInt(addForm.num_pases) || 1 }])
    setAddForm({ nombre: '', familia: '', num_pases: 1 })
    await fetchAll()
    setAdding(false)
  }

  const deleteGuest = async (g) => {
    const msg = g._type === 'guest'
      ? `¿Eliminar el pase de "${g.nombre}"? El QR quedará inválido.`
      : `¿Eliminar la confirmación de "${g.nombre}"?`
    if (!window.confirm(msg)) return
    if (g._type === 'guest') await supabase.from('invitados').delete().eq('id', g.id)
    else await supabase.from('confirmaciones').delete().eq('id', g._confId)
    fetchAll()
  }

  const openEdit = (g) => {
    setEditTarget(g)
    setEditForm(g._type === 'guest'
      ? { nombre: g.nombre, familia: g.familia || '', num_pases: g.num_pases }
      : { nombre: g.nombre, telefono: g._conf?.telefono || '', num_pases: g.num_pases }
    )
  }

  const saveEdit = async () => {
    if (!editForm.nombre.trim()) return
    setSaving(true)
    if (editTarget._type === 'guest') {
      await supabase.from('invitados').update({
        nombre: editForm.nombre.trim(), familia: editForm.familia.trim(),
        num_pases: parseInt(editForm.num_pases) || 1
      }).eq('id', editTarget.id)
    } else {
      await supabase.from('confirmaciones').update({
        nombre: editForm.nombre.trim(), telefono: editForm.telefono.trim(),
        num_personas: parseInt(editForm.num_pases) || 1
      }).eq('id', editTarget._confId)
    }
    await fetchAll()
    setEditTarget(null)
    setSaving(false)
  }

  const downloadQR = async (g) => {
    if (!g.token) return
    const url = `${APP_URL}/checkin/${g.token}`
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 500; canvas.height = 580
    ctx.fillStyle = '#FDFBF7'; ctx.fillRect(0, 0, 500, 580)
    ctx.strokeStyle = '#8B9D77'; ctx.lineWidth = 3; ctx.strokeRect(12, 12, 476, 556)
    ctx.strokeStyle = '#E8D5C4'; ctx.lineWidth = 1; ctx.strokeRect(18, 18, 464, 544)
    ctx.fillStyle = '#3D3530'; ctx.font = 'bold 22px serif'; ctx.textAlign = 'center'
    ctx.fillText('Ángel & Goreti', 250, 60)
    ctx.font = '14px sans-serif'; ctx.fillStyle = '#7A6E69'; ctx.fillText('23 · Agosto · 2026', 250, 85)
    ctx.strokeStyle = '#8B9D77'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(80, 100); ctx.lineTo(420, 100); ctx.stroke()
    ctx.fillStyle = '#3D3530'; ctx.font = 'bold 20px serif'; ctx.fillText(g.nombre, 250, 130)
    if (g.familia) { ctx.font = '13px sans-serif'; ctx.fillStyle = '#7A6E69'; ctx.fillText(g.familia, 250, 150) }
    ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#8B9D77'
    ctx.fillText(`${g.num_pases} ${g.num_pases === 1 ? 'PASE' : 'PASES'}`, 250, 172)
    const qrDataUrl = await QRCode.toDataURL(url, { width: 240, margin: 1, color: { dark: '#3D3530', light: '#FFFFFF' } })
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 130, 185, 240, 240)
      ctx.strokeStyle = '#E8D5C4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(80, 440); ctx.lineTo(420, 440); ctx.stroke()
      ctx.font = '11px sans-serif'; ctx.fillStyle = '#7A6E69'
      ctx.fillText('Presenta este código a la entrada', 250, 462)
      ctx.fillText('Pase personal e intransferible', 250, 480)
      ctx.fillStyle = '#8B9D77'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('✦ ✦ ✦', 250, 540)
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `Pase-${g.nombre.replace(/\s+/g, '_')}.png`
      link.click()
    }
    img.src = qrDataUrl
  }

  const sendWhatsApp = (g) => {
    const url = `${APP_URL}/checkin/${g.token}`
    const tel = (g._conf?.telefono || g.telefono || '').replace(/\D/g, '')
    const msg = encodeURIComponent(
      `¡Hola ${g.nombre}! 💒✨\n\n` +
      `Con mucho amor te invitamos a celebrar nuestra boda.\n\n` +
      `📅 Domingo 23 de agosto de 2026\n` +
      `⏰ 12:00 p.m. · Zacatecas, México\n\n` +
      `🎟 Tu pase de entrada (${g.num_pases} ${g.num_pases === 1 ? 'pase' : 'pases'}):\n` +
      `${url}\n\n` +
      `Preséntalo a la entrada el día del evento 🌿\n` +
      `¡Te esperamos con todo nuestro cariño!\n\n` +
      `— Ángel & Goreti 💚`
    )
    window.open(tel ? `https://wa.me/52${tel}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank')
  }

  const crearPase = async (g) => {
    setCreatingId(g._confId)
    const { data: newGuest } = await supabase.from('invitados').insert([{
      nombre: g.nombre, familia: '', num_pases: g.num_pases
    }]).select().single()
    if (!newGuest) { setCreatingId(null); return }
    await supabase.from('confirmaciones').update({ invitado_id: newGuest.id }).eq('id', g._confId)
    await fetchAll()
    setCreatingId(null)
    const url = `${APP_URL}/checkin/${newGuest.token}`
    const tel = (g._conf?.telefono || '').replace(/\D/g, '')
    const msg = encodeURIComponent(`¡Hola ${g.nombre}! 💒✨\n\nCon mucho amor te invitamos a celebrar nuestra boda.\n\n📅 Domingo 23 de agosto de 2026\n⏰ 12:00 p.m. · Zacatecas, México\n\n🎟 Tu pase de entrada (${newGuest.num_pases} ${newGuest.num_pases === 1 ? 'pase' : 'pases'}):\n${url}\n\nPreséntalo a la entrada el día del evento 🌿\n¡Te esperamos con todo nuestro cariño!\n\n— Ángel & Goreti 💚`)
    window.open(tel ? `https://wa.me/52${tel}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank')
  }

  const inp = { padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white', boxSizing: 'border-box' }

  const FILTERS = [
    { id: 'all', label: `Todos (${unified.length})` },
    { id: 'pase', label: `Con pase (${guests.length})` },
    { id: 'sin_pase', label: `Sin pase (${sinPaseCount})`, warn: sinPaseCount > 0 },
    { id: 'llegaron', label: `Llegaron (${llegaron})` },
    { id: 'pendientes', label: `Pendientes (${guests.length - llegaron})` },
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.3rem' }}>Invitados</h2>
        <p style={{ color: 'var(--text-medium)', fontSize: '0.8rem' }}>Vista unificada · pases QR + confirmaciones RSVP · da clic en ⌄ para ver detalles</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total con pase', value: guests.length, color: 'var(--sage)' },
          { label: 'Total pases', value: totalPases, color: 'var(--sage-dark)' },
          { label: 'Ya llegaron', value: llegaron, color: '#16a34a' },
          { label: 'Sin pase QR', value: sinPaseCount, color: sinPaseCount > 0 ? '#d97706' : 'var(--text-medium)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '0.9rem 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '1.7rem', fontFamily: 'Playfair Display', color: s.color, fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-medium)', marginTop: '0.25rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.3rem 1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>Agregar invitado manualmente</p>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <input style={{ ...inp, flex: '2 1 160px' }} value={addForm.nombre} onChange={e => setAddForm(f => ({ ...f, nombre: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addGuest()} placeholder="Nombre / Familia *" />
          <input style={{ ...inp, flex: '2 1 140px' }} value={addForm.familia} onChange={e => setAddForm(f => ({ ...f, familia: e.target.value }))} placeholder="Referencia (lado del novio...)" />
          <input type="number" min="1" max="30" style={{ ...inp, flex: '0 1 90px' }} value={addForm.num_pases} onChange={e => setAddForm(f => ({ ...f, num_pases: e.target.value }))} />
          <button onClick={addGuest} disabled={adding || !addForm.nombre.trim()} style={{ padding: '0.7rem 1.2rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Lato', fontWeight: 700, opacity: adding ? 0.7 : 1, whiteSpace: 'nowrap' }}>
            <Plus size={15} /> Agregar
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar..." style={{ ...inp, flex: '1 1 180px', maxWidth: '280px' }} />
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '0.45rem 0.9rem', border: '2px solid', borderColor: filter === f.id ? (f.warn ? '#d97706' : 'var(--sage)') : 'var(--nude)', background: filter === f.id ? (f.warn ? '#fef3c7' : 'var(--sage)') : 'white', color: filter === f.id ? (f.warn ? '#92400e' : 'white') : 'var(--text-medium)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Lato', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-medium)', padding: '2rem' }}>Cargando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-medium)' }}>
          <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.25, display: 'block' }} />
          <p>{unified.length === 0 ? 'Aún no hay invitados' : 'Sin resultados'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {filtered.map(g => (
            <GuestCard
              key={g.id}
              g={g}
              onEdit={openEdit}
              onDelete={deleteGuest}
              onCreatePase={crearPase}
              onWhatsApp={sendWhatsApp}
              onDownloadQR={downloadQR}
              creating={creatingId === g._confId}
            />
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editTarget && (
        <div onClick={() => !saving && setEditTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--text-dark)', fontWeight: 400 }}>
                {editTarget._type === 'guest' ? 'Editar Invitado' : 'Editar Confirmación'}
              </h3>
              <button onClick={() => setEditTarget(null)} style={{ background: 'var(--nude-light)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="var(--text-medium)" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Nombre *</label>
                <input value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} style={{ ...inp, width: '100%' }} />
              </div>
              {editTarget._type === 'guest' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Referencia</label>
                  <input value={editForm.familia} onChange={e => setEditForm(f => ({ ...f, familia: e.target.value }))} style={{ ...inp, width: '100%' }} placeholder="Lado del novio..." />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Teléfono</label>
                  <input value={editForm.telefono} onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))} style={{ ...inp, width: '100%' }} placeholder="+52 000 000 0000" />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}># Pases</label>
                <input type="number" min="1" max="30" value={editForm.num_pases} onChange={e => setEditForm(f => ({ ...f, num_pases: e.target.value }))} style={{ ...inp, maxWidth: '120px' }} />
              </div>
              {editTarget._type === 'guest' && (
                <div style={{ background: 'var(--nude-light)', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.78rem', color: 'var(--text-medium)' }}>
                  ⚠️ El QR no cambia al editar — el invitado puede seguir usando el mismo link.
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => setEditTarget(null)} style={{ flex: 1, padding: '0.85rem', border: '2px solid var(--nude)', borderRadius: '12px', background: 'white', cursor: 'pointer', color: 'var(--text-medium)', fontFamily: 'Lato' }}>Cancelar</button>
                <button onClick={saveEdit} disabled={saving || !editForm.nombre.trim()} style={{ flex: 2, padding: '0.85rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}>
                  <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
