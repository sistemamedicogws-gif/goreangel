import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Download, Users, UserCheck, UserX, Trash2, RefreshCw } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function ConfirmationsManager() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: rows } = await supabase.from('confirmaciones').select('*').order('created_at', { ascending: false })
    setData(rows || [])
    setLoading(false)
  }

  const deleteRow = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar la confirmación de "${nombre}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(id)
    await supabase.from('confirmaciones').delete().eq('id', id)
    setData(prev => prev.filter(r => r.id !== id))
    setDeletingId(null)
  }

  const downloadExcel = () => {
    const attending = data.filter(c => c.asistira)
    const notAttending = data.filter(c => !c.asistira)
    const wb = XLSX.utils.book_new()
    const makeSheet = (rows, keys) => XLSX.utils.json_to_sheet(rows.map(c => {
      const obj = {}
      keys.forEach(([k, label]) => obj[label] = c[k] ?? '')
      return obj
    }))
    XLSX.utils.book_append_sheet(wb, makeSheet(attending, [
      ['nombre', 'Nombre'], ['telefono', 'Teléfono'], ['num_personas', '# Personas'],
      ['restriccion_alimentaria', 'Restricción'], ['mensaje', 'Mensaje'], ['created_at', 'Fecha']
    ]), '✓ Confirman asistencia')
    XLSX.utils.book_append_sheet(wb, makeSheet(notAttending, [
      ['nombre', 'Nombre'], ['telefono', 'Teléfono'], ['mensaje', 'Mensaje'], ['created_at', 'Fecha']
    ]), '✗ No confirman')
    XLSX.writeFile(wb, 'Confirmaciones-Boda-Angel-Goreti.xlsx')
  }

  const filtered = data.filter(c => filter === 'yes' ? c.asistira : filter === 'no' ? !c.asistira : true)
  const attending = data.filter(c => c.asistira)
  const totalPeople = attending.reduce((a, c) => a + (c.num_personas || 0), 0)

  const statCards = [
    { label: 'Respuestas totales', value: data.length, color: 'var(--sage)', Icon: Users },
    { label: 'Confirman asistencia', value: attending.length, color: '#16a34a', Icon: UserCheck },
    { label: 'Total de personas', value: totalPeople, color: 'var(--nude-deeper)', Icon: Users },
    { label: 'No confirman', value: data.length - attending.length, color: '#dc2626', Icon: UserX },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--text-dark)' }}>Confirmaciones de Asistencia</h2>
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--nude-light)', color: 'var(--text-medium)', border: '1px solid var(--nude)', borderRadius: '10px', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Lato' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={downloadExcel} disabled={data.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'Lato', fontWeight: 700, opacity: data.length === 0 ? 0.5 : 1 }}>
            <Download size={15} /> Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}` }}>
            <p style={{ fontSize: '1.9rem', fontFamily: 'Playfair Display', color, fontWeight: 700, lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.73rem', color: 'var(--text-medium)', marginTop: '0.3rem' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {[{ id: 'all', label: 'Todos' }, { id: 'yes', label: '✓ Confirman' }, { id: 'no', label: '✗ No confirman' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '0.45rem 1rem', border: '2px solid', borderColor: filter === f.id ? 'var(--sage)' : 'var(--nude)', background: filter === f.id ? 'var(--sage)' : 'white', color: filter === f.id ? 'white' : 'var(--text-medium)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Lato', transition: 'all 0.2s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-medium)' }}>Cargando...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-medium)' }}>No hay confirmaciones aún</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--nude-light)' }}>
                  {['Nombre', 'Teléfono', 'Asistirá', 'Personas', 'Restricción', 'Mensaje', 'Fecha', ''].map(h => (
                    <th key={h} style={{ padding: '0.9rem 0.8rem', textAlign: 'left', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-medium)', fontFamily: 'Lato', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderTop: '1px solid var(--nude)', background: i % 2 === 0 ? 'white' : '#fdfcfb', opacity: deletingId === c.id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                    <td style={{ padding: '0.9rem 0.8rem', fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{c.nombre}</td>
                    <td style={{ padding: '0.9rem 0.8rem', color: 'var(--text-medium)', fontSize: '0.85rem' }}>{c.telefono || '—'}</td>
                    <td style={{ padding: '0.9rem 0.8rem' }}>
                      <span style={{ background: c.asistira ? '#dcfce7' : '#fee2e2', color: c.asistira ? '#166534' : '#991b1b', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                        {c.asistira ? '✓ Sí' : '✗ No'}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 0.8rem', color: 'var(--text-medium)', textAlign: 'center' }}>{c.asistira ? c.num_personas : '—'}</td>
                    <td style={{ padding: '0.9rem 0.8rem', color: 'var(--text-medium)', fontSize: '0.82rem' }}>{c.restriccion_alimentaria || 'Ninguna'}</td>
                    <td style={{ padding: '0.9rem 0.8rem', color: 'var(--text-medium)', fontSize: '0.82rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.mensaje}>{c.mensaje || '—'}</td>
                    <td style={{ padding: '0.9rem 0.8rem', color: 'var(--text-medium)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleDateString('es-MX')}</td>
                    <td style={{ padding: '0.9rem 0.8rem' }}>
                      <button
                        onClick={() => deleteRow(c.id, c.nombre)}
                        disabled={deletingId === c.id}
                        title="Eliminar"
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontFamily: 'Lato', whiteSpace: 'nowrap' }}
                      >
                        <Trash2 size={13} /> Borrar
                      </button>
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
