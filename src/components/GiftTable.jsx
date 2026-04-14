import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { ExternalLink, Copy, Check, Gift, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'

const STORE_COLORS = { amazon: '#FF9900', mercadolibre: '#2D3277', liverpool: '#DA291C', palacio: '#1a1a1a', otro: '#8B9D77' }
const STORE_ICONS = { amazon: '📦', mercadolibre: '🛒', liverpool: '🎁', palacio: '👑', otro: '🔗' }

export default function GiftTable() {
  const [config, setConfig] = useState(null)
  const [copiedField, setCopiedField] = useState(null)
  const [showBanco, setShowBanco] = useState(false)

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
              <div style={{ width: '32px', height: '32px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gift size={16} color="white" />
              </div>
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

        {/* Bank transfer — collapsible */}
        {hasBanco && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <button
              onClick={() => setShowBanco(v => !v)}
              style={{ width: '100%', background: 'white', border: 'none', borderRadius: showBanco ? '14px 14px 0 0' : '14px', padding: '1.1rem 1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'border-radius 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--nude-deeper)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={16} color="white" />
                </div>
                <p style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: 'var(--text-dark)', fontWeight: 400 }}>Transferencia Bancaria</p>
              </div>
              {showBanco ? <ChevronUp size={18} color="var(--text-medium)" /> : <ChevronDown size={18} color="var(--text-medium)" />}
            </button>

            <AnimatePresence>
              {showBanco && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ background: 'white', borderRadius: '0 0 14px 14px', padding: '1.3rem', borderTop: '1px solid var(--nude)', boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }}>
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
                            <button onClick={() => copyToClipboard(f.value, f.field)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === f.field ? '#16a34a' : 'var(--sage)', padding: '0.15rem', flexShrink: 0, transition: 'color 0.2s' }}>
                              {copiedField === f.field ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p style={{ textAlign: 'center', color: 'var(--text-medium)', fontSize: '0.78rem', marginTop: '1.1rem', fontStyle: 'italic' }}>
                      Por favor incluye tu nombre en el concepto de la transferencia 💚
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  )
}
