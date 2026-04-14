import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { ExternalLink, Copy, Check, Gift, CreditCard, Send, ChevronDown, ChevronUp } from 'lucide-react'

const STORE_COLORS = { amazon: '#FF9900', mercadolibre: '#2D3277', liverpool: '#DA291C', palacio: '#1a1a1a', otro: '#8B9D77' }
const STORE_ICONS = { amazon: '📦', mercadolibre: '🛒', liverpool: '🎁', palacio: '👑', otro: '🔗' }

export default function GiftTable() {
  const [config, setConfig] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [showBanco, setShowBanco] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [form, setForm] = useState({ nombre: '', monto: '', mensaje: '', metodo: 'transferencia' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    supabase.from('configuracion').select('*').eq('clave', 'mesa_regalos').single().then(({ data }) => {
      if (data?.valor) try { setConfig(JSON.parse(data.valor)) } catch {}
    })
  }, [])

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2200)
  }

  const sendNotif = async () => {
    if (!form.nombre.trim()) return
    setSending(true)
    await supabase.from('mensajes_regalo').insert([form])
    setSent(true)
    setSending(false)
  }

  if (!config || !config.mostrar_mesa) return null

  const hasLinks = config.links?.length > 0
  const hasBanco = config.banco_titular || config.banco_clabe || config.banco_cuenta

  return (
    <section style={{ padding: '6rem 2rem', background: 'linear-gradient(160deg, #f0f4ec 0%, var(--nude-light) 100%)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--sage-dark)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✦ ✦ ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-dark)', fontWeight: 400, marginBottom: '0.8rem' }}>Mesa de Regalos</h2>
          <div style={{ width: '50px', height: '2px', background: 'var(--sage)', margin: '0 auto 1.2rem' }} />
          {config.mensaje_intro && (
            <p style={{ color: 'var(--text-medium)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
              {config.mensaje_intro}
            </p>
          )}
        </motion.div>

        {/* Store links */}
        {hasLinks && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Gift size={16} color="white" /></div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.05rem', color: 'var(--text-dark)', fontWeight: 400 }}>Listas de regalos en línea</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {config.links.map((link, i) => (
                <motion.a key={i} href={link.url} target="_blank" rel="noopener noreferrer" whileHover={{ x: 4 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', borderRadius: '14px', padding: '1rem 1.3rem', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${STORE_COLORS[link.tienda] || '#8B9D77'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>{STORE_ICONS[link.tienda] || '🔗'}</span>
                    <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.92rem' }}>{link.label || link.tienda}</p>
                  </div>
                  <ExternalLink size={15} color="var(--sage)" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bank transfer */}
        {hasBanco && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '1.5rem' }}>
            <button onClick={() => setShowBanco(v => !v)} style={{ width: '100%', background: 'white', border: 'none', borderRadius: '14px', padding: '1.1rem 1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--nude-deeper)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CreditCard size={16} color="white" /></div>
                <p style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: 'var(--text-dark)', fontWeight: 400 }}>Transferencia Bancaria</p>
              </div>
              {showBanco ? <ChevronUp size={18} color="var(--text-medium)" /> : <ChevronDown size={18} color="var(--text-medium)" />}
            </button>

            <AnimatePresence>
              {showBanco && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ background: 'white', borderRadius: '0 0 14px 14px', padding: '1.3rem', borderTop: '1px solid var(--nude)', marginTop: '-4px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
                      {[
                        { label: 'Banco', value: config.banco_banco, field: 'banco' },
                        { label: 'Titular', value: config.banco_titular, field: 'titular' },
                        { label: 'No. Cuenta', value: config.banco_cuenta, field: 'cuenta' },
                        { label: 'CLABE', value: config.banco_clabe, field: 'clabe' },
                        { label: 'Concepto', value: config.banco_concepto, field: 'concepto' },
                      ].filter(f => f.value).map(f => (
                        <div key={f.field} style={{ background: 'var(--nude-light)', borderRadius: '10px', padding: '0.8rem 1rem' }}>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{f.label}</p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.88rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{f.value}</p>
                            <button onClick={() => copyToClipboard(f.value, f.field)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === f.field ? '#16a34a' : 'var(--sage)', padding: '0.15rem', flexShrink: 0 }}>
                              {copiedField === f.field ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Deposit notification */}
        {(hasLinks || hasBanco) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {sent ? (
              <div style={{ textAlign: 'center', background: 'white', borderRadius: '18px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💌</p>
                <h3 style={{ fontFamily: 'Playfair Display', color: 'var(--text-dark)', marginBottom: '0.4rem', fontWeight: 400 }}>¡Notificación enviada!</h3>
                <p style={{ color: 'var(--text-medium)', fontSize: '0.88rem' }}>Los novios recibirán tu aviso con todo el amor 🌿</p>
              </div>
            ) : !showNotif ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem', marginBottom: '0.9rem' }}>¿Ya realizaste tu regalo? Avísales a los novios 💐</p>
                <button onClick={() => setShowNotif(true)} style={{ background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '50px', padding: '0.85rem 2rem', cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Send size={15} /> Notificar a los novios
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.4rem', fontWeight: 400 }}>
                  💌 Avisar a los novios que hiciste tu regalo
                </h3>
                <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem', marginBottom: '1.3rem' }}>
                  Así sabrán exactamente de quién fue el detalle 🥰
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Tu nombre *</label>
                      <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Tío Juan" style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Monto o detalle</label>
                      <input value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} placeholder="Ej: $500 o lista Amazon" style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Método</label>
                      <select value={form.metodo} onChange={e => setForm(f => ({ ...f, metodo: e.target.value }))} style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white', boxSizing: 'border-box' }}>
                        <option value="transferencia">💳 Transferencia</option>
                        <option value="amazon">📦 Amazon</option>
                        <option value="mercadolibre">🛒 MercadoLibre</option>
                        <option value="liverpool">🎁 Liverpool</option>
                        <option value="otro">🔗 Otro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Mensaje (opcional)</label>
                    <textarea value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} placeholder="Ej: Con mucho cariño para ustedes 💕" style={{ width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', minHeight: '70px', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.7rem' }}>
                    <button onClick={() => setShowNotif(false)} style={{ flex: 1, padding: '0.8rem', border: '2px solid var(--nude)', borderRadius: '10px', background: 'white', cursor: 'pointer', color: 'var(--text-medium)', fontFamily: 'Lato', fontSize: '0.88rem' }}>
                      Cancelar
                    </button>
                    <button onClick={sendNotif} disabled={sending || !form.nombre.trim()} style={{ flex: 2, padding: '0.8rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Lato', fontWeight: 700, fontSize: '0.9rem', opacity: sending ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Send size={15} /> {sending ? 'Enviando...' : 'Enviar notificación'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}
