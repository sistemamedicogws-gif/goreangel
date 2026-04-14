import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Download, Users, UserCheck, UserX, Trash2, RefreshCw, Send, Check, MessageCircle, Pencil, X, Save } from 'lucide-react'
import * as XLSX from 'xlsx'

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://goreangel.vercel.app'

export default function ConfirmationsManager() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deletingId, setDeletingId] = useState(null)
  const [creatingId, setCreatingId] = useState(null)
  const [successId, setSuccessId] = useState(null)

  // Edit confirmation modal
  const [editRow, setEditRow] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: rows } = await supabase.from('confirmaciones').select('*').order('created_at', { ascending: false })
    setData(rows || [])
    setLoading(false)
  }

  const deleteRow = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la confirmación de "${nombre}"?`)) return
    setDeletingId(id)
    await supabase.from('confirmaciones').delete().eq('id', id)
    setData(prev => prev.filter(r => r.id !== id))
    setDeletingId(null)
  }

  // ── FLUJO C: Crear pase + abrir WhatsApp ──
  const crearPaseYWhatsApp = async (conf) => {
    setCreatingId(conf.id)

    // 1. Crear invitado en la BD
    const { data: newGuest, error } = await supabase.from('invitados').insert([{
      nombre: conf.nombre,
      familia: '',
      num_pases: conf.num_personas || 1
    }]).select().single()

    if (error || !newGuest) {
      alert('Error al crear el pase. Intenta de nuevo.')
      setCreatingId(null)
      return
    }

    // 2. Vincular confirmación con invitado
    await supabase.from('confirmaciones').update({ invitado_id: newGuest.id }).eq('id', conf.id)

    // 3. Actualizar estado local
    setData(prev => prev.map(r => r.id === conf.id ? { ...r, invitado_id: newGuest.id, _token: newGuest.token } : r))
    setSuccessId(conf.id)
    setTimeout(() => setSuccessId(null), 4000)

    // 4. Construir link y abrir WhatsApp
    const link = `${APP_URL}/checkin/${newGuest.token}`
    const tel = conf.telefono?.replace(/\D/g, '') || ''
    const mensaje = encodeURIComponent(
      `¡Hola ${conf.nombre}! 💒✨\n\n` +
      `Con mucho amor te invitamos a celebrar nuestra boda.\n\n` +
      `📅 Domingo 23 de agosto de 2026\n` +
      `⏰ 12:00 p.m. · Zacatecas, México\n\n` +
      `🎟 Tu pase de entrada (${newGuest.num_pases} ${newGuest.num_pases === 1 ? 'pase' : 'pases'}):\n` +
      `${link}\n\n` +
      `Preséntalo a la entrada el día del evento 🌿\n` +
      `¡Te esperamos con todo nuestro cariño!\n\n` +
      `— Ángel & Goreti 💚`
    )

    const waUrl = tel
      ? `https://wa.me/52${tel}?text=${mensaje}`
      : `https://wa.me/?text=${mensaje}`

    window.open(waUrl, '_blank')
    setCreatingId(null)
  }

  // ── EDITAR CONFIRMACIÓN ──
  const openEdit = (row) => {
    setEditRow(row)
    setEditForm({ nombre: row.nombre, telefono: row.telefono || '', num_personas: row.num_personas || 1, asistira: row.asistira, restriccion_alimentaria: row.restriccion_alimentaria || '', mensaje: row.mensaje || '' })
  }

  const saveEdit = async () => {
    if (!editForm.nombre.trim()) return
    setSaving(true)
    await supabase.from('confirmaciones').update({
      nombre: editForm.nombre.trim(),
      telefono: editForm.telefono.trim(),
      num_personas: parseInt(editForm.num_personas) || 1,
      asistira: editForm.asistira,
      restriccion_alimentaria: editForm.restriccion_alimentaria.trim(),
      mensaje: editForm.mensaje.trim()
    }).eq('id', editRow.id)
    await fetchData()
    setEditRow(null)
    setSaving(false)
  }

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new()
    const attending = data.filter(c => c.asistira)
    const notAttending = data.filter(c => !c.asistira)
    const makeSheet = (rows) => XLSX.utils.json_to_sheet(rows.map(c => ({
      'Nombre': c.nombre, 'Teléfono': c.telefono || '', '# Personas': c.num_personas,
      'Restricción': c.restriccion_alimentaria || '', 'Mensaje': c.mensaje || '',
      'Pase QR': c.invitado_id ? '✓ Creado' : 'Pendiente',
      'Fecha': new Date(c.created_at).toLocaleDateString('es-MX')
    })))
    XLSX.utils.book_append_sheet(wb, makeSheet(attending), '✓ Confirman')
    XLSX.utils.book_append_sheet(wb, makeSheet(notAttending), '✗ No confirman')
    XLSX.writeFile(wb, 'Confirmaciones-Boda.xlsx')
  }

  const filtered = data.filter(c => filter === 'yes' ? c.asistira : filter === 'no' ? !c.asistira : true)
  const attending = data.filter(c => c.asistira)
  const totalPeople = attending.reduce((a, c) => a + (c.num_personas || 0), 0)
  const conPase = data.filter(c => c.invitado_id).length

  const inp = { width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white', boxSizing: 'border-box' }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Confirmaciones de Asistencia</h2>
          <p style={{ color: 'var(--text-medium)', fontSize: '0.8rem' }}>
            {conPase} de {attending.length} invitados con pase QR enviado
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--nude-light)', color: 'var(--text-medium)', border: '1px solid var(--nude)', borderRadius: '10px', padding: '0.6rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Lato' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={downloadExcel} disabled={data.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'Lato', fontWeight: 700, opacity: data.length === 0 ? 0.5 : 1 }}>
            <Download size={15} /> Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Respuestas', value: data.length, color: 'var(--sage)' },
          { label: 'Confirman', value: attending.length, color: '#16a34a' },
          { label: 'Total personas', value: totalPeople, color: 'var(--nude-deeper)' },
          { label: 'No confirman', value: data.length - attending.length, color: '#dc2626' },
          { label: 'Pases enviados', value: conPase, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${s.color}` }}>
            <p style={{ fontSize: '1.9rem', fontFamily: 'Playfair Display', color: s.color, fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-medium)', marginTop: '0.3rem' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {[{ id: 'all', label: 'Todos' }, { id: 'yes', label: '✓ Confirman' }, { id: 'no', label: '✗ No confirman' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '0.45rem 1rem', border: '2px solid', borderColor: filter === f.id ? 'var(--sage)' : 'var(--nude)', background: filter === f.id ? 'var(--sage)' : 'white', color: filter === f.id ? 'white' : 'var(--text-medium)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Lato', transition: 'all 0.2s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards grid — better for mobile */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-medium)', padding: '2rem' }}>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-medium)', padding: '2.5rem' }}>Sin confirmaciones aún</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background: 'white', borderRadius: '16px', padding: '1.3rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${c.asistira ? 'var(--sage)' : '#fca5a5'}`, position: 'relative', opacity: deletingId === c.id ? 0.4 : 1, transition: 'opacity 0.2s' }}>

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '1rem', marginBottom: '0.15rem' }}>{c.nombre}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ background: c.asistira ? '#dcfce7' : '#fee2e2', color: c.asistira ? '#166534' : '#991b1b', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.73rem', fontWeight: 600 }}>
                      {c.asistira ? '✓ Confirma' : '✗ No confirma'}
                    </span>
                    {c.asistira && <span style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>{c.num_personas} {c.num_personas === 1 ? 'persona' : 'personas'}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => openEdit(c)} style={{ background: '#eff6ff', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex', color: '#2563eb' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteRow(c.id, c.nombre)} disabled={deletingId === c.id} style={{ background: '#fee2e2', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex', color: '#dc2626' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-medium)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {c.telefono && <p>📱 {c.telefono}</p>}
                {c.restriccion_alimentaria && <p>🥗 {c.restriccion_alimentaria}</p>}
                {c.mensaje && <p style={{ fontStyle: 'italic' }}>💬 "{c.mensaje}"</p>}
                <p style={{ color: 'rgba(0,0,0,0.3)', fontSize: '0.72rem' }}>{new Date(c.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              {/* Action button */}
              {c.asistira && (
                c.invitado_id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, background: '#f0fdf4', borderRadius: '10px', padding: '0.55rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} color="#16a34a" />
                      <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>Pase creado</span>
                    </div>
                    {/* Resend WhatsApp */}
                    <button
                      onClick={() => {
                        const link = `${APP_URL}/checkin/${c._token || ''}`
                        const tel = (c.telefono || '').replace(/\D/g, '')
                        const msg = encodeURIComponent(`¡Hola ${c.nombre}! 🎊 Te reenvíamos tu pase para nuestra boda el 23 de agosto:\n${link}\n— Ángel & Goreti 💚`)
                        window.open(tel ? `https://wa.me/52${tel}?text=${msg}` : `https://wa.me/?text=${msg}`, '_blank')
                      }}
                      style={{ background: '#25D366', border: 'none', borderRadius: '10px', padding: '0.55rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'white', fontSize: '0.78rem', fontFamily: 'Lato', fontWeight: 700 }}
                    >
                      <MessageCircle size={13} /> Reenviar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => crearPaseYWhatsApp(c)}
                    disabled={creatingId === c.id}
                    style={{ width: '100%', padding: '0.75rem', background: successId === c.id ? '#dcfce7' : 'linear-gradient(135deg, #25D366, #1da851)', color: successId === c.id ? '#166534' : 'white', border: 'none', borderRadius: '12px', cursor: creatingId === c.id ? 'not-allowed' : 'pointer', fontFamily: 'Lato', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', opacity: creatingId === c.id ? 0.7 : 1, transition: 'all 0.3s' }}
                  >
                    {creatingId === c.id ? (
                      <>⏳ Creando pase...</>
                    ) : successId === c.id ? (
                      <><Check size={15} /> ¡Pase creado y WhatsApp abierto!</>
                    ) : (
                      <><MessageCircle size={15} /> 📲 Crear pase y enviar por WhatsApp</>
                    )}
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editRow && (
        <div onClick={() => !saving && setEditRow(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', color: 'var(--text-dark)', fontWeight: 400 }}>Editar Confirmación</h3>
              <button onClick={() => setEditRow(null)} style={{ background: 'var(--nude-light)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="var(--text-medium)" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Nombre *</label>
                <input value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} style={inp} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Teléfono</label>
                  <input value={editForm.telefono} onChange={e => setEditForm(f => ({ ...f, telefono: e.target.value }))} style={inp} placeholder="+52 000 000 0000" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}># Personas</label>
                  <input type="number" min="1" value={editForm.num_personas} onChange={e => setEditForm(f => ({ ...f, num_personas: e.target.value }))} style={inp} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>¿Asistirá?</label>
                <div style={{ display: 'flex', gap: '0.7rem' }}>
                  {[{ v: true, l: '✓ Sí confirma' }, { v: false, l: '✗ No confirma' }].map(o => (
                    <button key={String(o.v)} onClick={() => setEditForm(f => ({ ...f, asistira: o.v }))} style={{ flex: 1, padding: '0.7rem', border: '2px solid', borderColor: editForm.asistira === o.v ? 'var(--sage)' : 'var(--nude)', background: editForm.asistira === o.v ? 'var(--sage)' : 'white', color: editForm.asistira === o.v ? 'white' : 'var(--text-medium)', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Lato' }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Restricción alimentaria</label>
                <input value={editForm.restriccion_alimentaria} onChange={e => setEditForm(f => ({ ...f, restriccion_alimentaria: e.target.value }))} style={inp} placeholder="Vegetariano, alérgico a..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Mensaje</label>
                <textarea value={editForm.mensaje} onChange={e => setEditForm(f => ({ ...f, mensaje: e.target.value }))} style={{ ...inp, minHeight: '70px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button onClick={() => setEditRow(null)} style={{ flex: 1, padding: '0.85rem', border: '2px solid var(--nude)', borderRadius: '12px', background: 'white', cursor: 'pointer', color: 'var(--text-medium)', fontFamily: 'Lato' }}>
                  Cancelar
                </button>
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
