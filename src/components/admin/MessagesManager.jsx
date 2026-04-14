import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Download, MessageSquare, RefreshCw } from 'lucide-react'
import * as XLSX from 'xlsx'

const METODO_LABEL = { transferencia: '💳 Transferencia', amazon: '📦 Amazon', mercadolibre: '🛒 MercadoLibre', liverpool: '🎁 Liverpool', otro: '🔗 Otro' }

export default function MessagesManager() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchMessages() }, [])

  const fetchMessages = async () => {
    setLoading(true)
    const { data } = await supabase.from('mensajes_regalo').select('*').order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(messages.map(m => ({
      'Nombre': m.nombre,
      'Método': m.metodo,
      'Monto': m.monto || '',
      'Mensaje': m.mensaje || '',
      'Fecha': new Date(m.created_at).toLocaleDateString('es-MX')
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Mensajes de Regalo')
    XLSX.writeFile(wb, 'Mensajes-Regalo-Boda.xlsx')
  }

  const totalEstimado = messages.reduce((a, m) => {
    const n = parseFloat((m.monto || '').replace(/[^0-9.]/g, ''))
    return isNaN(n) ? a : a + n
  }, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--text-dark)' }}>Mensajes de Regalo</h2>
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          <button onClick={fetchMessages} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--nude-light)', color: 'var(--text-medium)', border: '1px solid var(--nude)', borderRadius: '10px', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Lato' }}>
            <RefreshCw size={14} /> Actualizar
          </button>
          {messages.length > 0 && (
            <button onClick={downloadExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.6rem 1.1rem', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Lato', fontWeight: 700 }}>
              <Download size={15} /> Excel
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--sage)' }}>
          <p style={{ fontSize: '1.9rem', fontFamily: 'Playfair Display', color: 'var(--sage-dark)', fontWeight: 700, lineHeight: 1 }}>{messages.length}</p>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-medium)', marginTop: '0.3rem' }}>Mensajes recibidos</p>
        </div>
        {totalEstimado > 0 && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--nude-deeper)' }}>
            <p style={{ fontSize: '1.4rem', fontFamily: 'Playfair Display', color: 'var(--nude-deeper)', fontWeight: 700, lineHeight: 1 }}>${totalEstimado.toLocaleString('es-MX')}</p>
            <p style={{ fontSize: '0.73rem', color: 'var(--text-medium)', marginTop: '0.3rem' }}>Total estimado recibido</p>
          </div>
        )}
      </div>

      {/* Messages */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-medium)', padding: '2rem' }}>Cargando mensajes...</p>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-medium)' }}>
          <MessageSquare size={44} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.25 }} />
          <p>Aún no hay mensajes de regalo</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>Los invitados podrán enviarte mensajes desde la sección Mesa de Regalos</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {messages.map(m => (
            <div key={m.id} style={{ background: 'white', borderRadius: '16px', padding: '1.3rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--sage), var(--nude-deeper))' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{m.nombre}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>
                    {new Date(m.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: 'var(--nude-light)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--text-medium)' }}>
                    {METODO_LABEL[m.metodo] || m.metodo}
                  </span>
                  {m.monto && <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--sage-dark)', marginTop: '0.3rem' }}>{m.monto}</p>}
                </div>
              </div>
              {m.mensaje && (
                <p style={{ color: 'var(--text-medium)', fontSize: '0.88rem', lineHeight: 1.6, fontStyle: 'italic', borderTop: '1px solid var(--nude)', paddingTop: '0.8rem' }}>
                  "{m.mensaje}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
