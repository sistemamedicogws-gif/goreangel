import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Copy, Check, Gift, CreditCard, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

export default function GiftTable() {
  const [config, setConfig] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [openCard, setOpenCard] = useState(null)

  useEffect(() => {
    supabase.from('configuracion').select('*').eq('clave', 'mesa_regalos').single().then(({ data }) => {
      if (data?.valor) try { setConfig(JSON.parse(data.valor)) } catch {}
    })
  }, [])

  // Close modal on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setModalOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const copy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2200)
  }

  if (!config || !config.mostrar_mesa) return null

  const hasLinks = (config.links || []).length > 0
  const hasBanco = (config.tarjetas || []).length > 0

  return (
    <section style={{ padding: '6rem 2rem', background: 'linear-gradient(160deg, #f0f4ec 0%, var(--nude-light) 100%)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--sage-dark)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✦ ✦ ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-dark)', fontWeight: 400, marginBottom: '0.8rem' }}>Mesa de Regalos</h2>
          <div style={{ width: '50px', height: '2px', background: 'var(--sage)', margin: '0 auto 1.5rem' }} />
          {config.mensaje_intro && (
            <p style={{ color: 'var(--text-medium)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem', maxWidth: '460px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
              {config.mensaje_intro}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalOpen(true)}
            style={{ background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '50px', padding: '1rem 2.5rem', fontSize: '1rem', fontFamily: 'Lato', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(107,127,90,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '0.05em' }}
          >
            <Gift size={18} /> Ver opciones de regalo
          </motion.button>
        </motion.div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 9000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '24px 24px 16px 16px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 -12px 60px rgba(0,0,0,0.2)' }}
            >
              {/* Modal header */}
              <div style={{ padding: '1.3rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--nude)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <div style={{ width: '36px', height: '36px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Gift size={17} color="white" />
                  </div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: 400 }}>Mesa de Regalos</h3>
                </div>
                <button onClick={() => setModalOpen(false)} style={{ background: 'var(--nude-light)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} color="var(--text-medium)" />
                </button>
              </div>

              {/* Modal body - scrollable */}
              <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>

                {/* Store links */}
                {hasLinks && (
                  <div style={{ marginBottom: hasBanco ? '1.5rem' : 0 }}>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.8rem' }}>
                      🎁 Tiendas en línea
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {(config.links || []).map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', background: 'var(--nude-light)', borderRadius: '14px', padding: '0.9rem 1.1rem', textDecoration: 'none', border: '1px solid var(--nude)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--nude)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--nude-light)'}
                        >
                          {link.iconUrl ? (
                            <img src={link.iconUrl} alt="" style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '10px', background: 'white', padding: '4px', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }} />
                          ) : (
                            <div style={{ width: '44px', height: '44px', background: 'var(--sage-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Gift size={20} color="var(--sage-dark)" />
                            </div>
                          )}
                          <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.92rem', flex: 1 }}>{link.label || 'Ver lista'}</p>
                          <ExternalLink size={15} color="var(--sage)" style={{ flexShrink: 0 }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bank cards */}
                {hasBanco && (
                  <div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.8rem' }}>
                      💳 Transferencia bancaria
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {(config.tarjetas || []).map((t, i) => (
                        <div key={i} style={{ background: 'var(--nude-light)', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--nude)' }}>
                          <button onClick={() => setOpenCard(openCard === i ? null : i)} style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', textAlign: 'left' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--nude-deeper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {t.iconUrl
                                ? <img src={t.iconUrl} alt={t.banco} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                                : <CreditCard size={16} color="white" />
                              }
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{t.banco || `Cuenta ${i + 1}`}</p>
                              {t.titular && <p style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>{t.titular}</p>}
                            </div>
                            {openCard === i ? <ChevronUp size={16} color="var(--text-medium)" /> : <ChevronDown size={16} color="var(--text-medium)" />}
                          </button>

                          <AnimatePresence>
                            {openCard === i && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '0.5rem 1.1rem 1.1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.6rem', borderTop: '1px solid var(--nude)' }}>
                                  {[
                                    { label: 'Banco', value: t.banco },
                                    { label: 'Titular', value: t.titular },
                                    { label: 'No. Cuenta', value: t.cuenta },
                                    { label: 'CLABE', value: t.clabe },
                                    { label: 'Concepto', value: t.concepto },
                                  ].filter(f => f.value).map(f => (
                                    <div key={f.label} style={{ background: 'white', borderRadius: '8px', padding: '0.6rem 0.8rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                      <p style={{ fontSize: '0.6rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{f.label}</p>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                                        <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{f.value}</p>
                                        <button onClick={() => copy(f.value, `${i}-${f.label}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedField === `${i}-${f.label}` ? '#16a34a' : 'var(--sage)', padding: '2px', flexShrink: 0 }}>
                                          {copiedField === `${i}-${f.label}` ? <Check size={13} /> : <Copy size={13} />}
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-medium)', textAlign: 'center', padding: '0 1rem 0.8rem', fontStyle: 'italic' }}>
                                  Por favor incluye tu nombre en el concepto 💚
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--nude)', textAlign: 'center', flexShrink: 0 }}>
                <button onClick={() => setModalOpen(false)} style={{ background: 'var(--nude-light)', border: '1px solid var(--nude)', color: 'var(--text-medium)', borderRadius: '50px', padding: '0.7rem 2rem', cursor: 'pointer', fontFamily: 'Lato', fontSize: '0.9rem' }}>
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
