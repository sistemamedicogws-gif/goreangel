import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { ExternalLink, Copy, Check, Gift, CreditCard, Send } from 'lucide-react'

const STORE_COLORS = {
  amazon: '#FF9900', mercadolibre: '#2D3277', liverpool: '#DA291C',
  palacio: '#1a1a1a', otro: '#8B9D77'
}
const STORE_ICONS = {
  amazon: '📦', mercadolibre: '🛒', liverpool: '🎁', palacio: '👑', otro: '🔗'
}

export default function GiftTable() {
  const [config, setConfig] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [showMsgForm, setShowMsgForm] = useState(false)
  const [msgForm, setMsgForm] = useState({ nombre: '', metodo: 'transferencia', monto: '', mensaje: '' })
  const [msgSent, setMsgSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('configuracion').select('*').eq('clave', 'mesa_regalos').single()
      if (data?.valor) {
        try { setConfig(JSON.parse(data.valor)) } catch {}
      }
    }
    fetchConfig()
  }, [])

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const sendMessage = async () => {
    if (!msgForm.nombre.trim()) return
    setSending(true)
    await supabase.from('mensajes_regalo').insert([msgForm])
    setMsgSent(true)
    setSending(false)
  }

  if (!config || !config.mostrar_mesa) return null

  const hasLinks = config.links && config.links.length > 0
  const hasBanco = config.banco_titular || config.banco_clabe || config.banco_cuenta

  return (
    <section style={{ padding: '6rem 2rem', background: 'linear-gradient(150deg, var(--sage-light) 0%, var(--nude-light) 100%)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--sage-dark)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✦ ✦ ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-dark)', fontWeight: 400, marginBottom: '0.8rem' }}>Mesa de Regalos</h2>
          <div style={{ width: '50px', height: '2px', background: 'var(--sage)', margin: '0 auto 1.2rem' }} />
          {config.mensaje_intro && (
            <p style={{ color: 'var(--text-medium)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem' }}>
              {config.mensaje_intro}
            </p>
          )}
        </motion.div>

        {/* Store links */}
        {hasLinks && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gift size={16} color="white" />
              </div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 400 }}>Tiendas en línea</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {config.links.map((link, i) => (
                <motion.a key={i} href={link.url} target="_blank" rel="noopener noreferrer" whileHover={{ x: 4 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderRadius: '16px', padding: '1rem 1.3rem', textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `2px solid transparent`, transition: 'border-color 0.2s', borderLeftColor: STORE_COLORS[link.tienda] || '#8B9D77', borderLeftWidth: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>{STORE_ICONS[link.tienda] || '🔗'}</span>
                    <div>
                      <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.95rem' }}>{link.label || link.tienda}</p>
                      <p style={{ color: 'var(--text-medium)', fontSize: '0.75rem' }}>{link.url.split('/')[2]}</p>
                    </div>
                  </div>
                  <ExternalLink size={16} color="var(--sage)" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bank transfer */}
        {hasBanco && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--nude-deeper)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={16} color="white" />
              </div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 400 }}>Transferencia Bancaria</h3>
            </div>
            <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Banco', value: config.banco_banco, field: 'banco' },
                  { label: 'Titular', value: config.banco_titular, field: 'titular' },
                  { label: 'No. de cuenta', value: config.banco_cuenta, field: 'cuenta' },
                  { label: 'CLABE', value: config.banco_clabe, field: 'clabe' },
                  { label: 'Concepto', value: config.banco_concepto, field: 'concepto' },
                ].filter(f => f.value).map(f => (
                  <div key={f.field} style={{ background: 'var(--nude-light)', borderRadius: '12px', padding: '0.9rem 1rem' }}>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>{f.label}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'monospace' }}>{f.value}</p>
                      <button onClick={() => copyToClipboard(f.value, f.field)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === f.field ? '#16a34a' : 'var(--sage)', padding: '0.2rem', flexShrink: 0 }}>
                        {copiedField === f.field ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Message form */}
        {(hasLinks || hasBanco) && !msgSent && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {!showMsgForm ? (
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setShowMsgForm(true)} style={{ background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '50px', padding: '0.9rem 2rem', cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Send size={15} /> Enviar mensaje de regalo a los novios
                </button>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '1.2rem', fontWeight: 400 }}>
                  💌 Enviar mensaje a los novios
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Tu nombre *</label>
                      <input value={msgForm.nombre} onChange={e => setMsgForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre o familia" style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Método</label>
                      <select value={msgForm.metodo} onChange={e => setMsgForm(f => ({ ...f, metodo: e.target.value }))} style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white', boxSizing: 'border-box' }}>
                        <option value="transferencia">Transferencia</option>
                        <option value="amazon">Amazon</option>
                        <option value="mercadolibre">MercadoLibre</option>
                        <option value="liverpool">Liverpool</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Monto (opcional)</label>
                      <input value={msgForm.monto} onChange={e => setMsgForm(f => ({ ...f, monto: e.target.value }))} placeholder="$500" style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Mensaje para los novios</label>
                    <textarea value={msgForm.mensaje} onChange={e => setMsgForm(f => ({ ...f, mensaje: e.target.value }))} placeholder="Un mensaje con mucho amor..." style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.7rem' }}>
                    <button onClick={() => setShowMsgForm(false)} style={{ flex: 1, padding: '0.8rem', border: '2px solid var(--nude)', borderRadius: '10px', background: 'white', cursor: 'pointer', color: 'var(--text-medium)', fontFamily: 'Lato' }}>
                      Cancelar
                    </button>
                    <button onClick={sendMessage} disabled={sending || !msgForm.nombre.trim()} style={{ flex: 2, padding: '0.8rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700, opacity: sending ? 0.7 : 1 }}>
                      {sending ? 'Enviando...' : '💌 Enviar mensaje'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {msgSent && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '18px' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💌</p>
            <h3 style={{ fontFamily: 'Playfair Display', color: 'var(--text-dark)', marginBottom: '0.4rem', fontWeight: 400 }}>¡Mensaje enviado!</h3>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.9rem' }}>Los novios recibirán tu mensaje con mucho amor 🌿</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
