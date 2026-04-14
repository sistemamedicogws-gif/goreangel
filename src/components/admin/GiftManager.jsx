import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, Plus, Trash2, Gift, CreditCard, Upload, X } from 'lucide-react'

const DEFAULT_CONFIG = {
  mostrar_mesa: true,
  links: [],
  tarjetas: [],
  mensaje_intro: '¡Tu presencia es nuestro mejor regalo! Si deseas hacernos un presente, aquí te dejamos algunas opciones:'
}

const ICON_SIZE_PX = 80 // recommended icon size

export default function GiftManager() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const iconRefs = useRef({})
  const bancoRefs = useRef({})

  useEffect(() => { fetchConfig() }, [])

  const fetchConfig = async () => {
    const { data } = await supabase.from('configuracion').select('*').eq('clave', 'mesa_regalos').single()
    if (data?.valor) {
      try {
        const parsed = JSON.parse(data.valor)
        // Migrate old single banco to tarjetas array
        if (!parsed.tarjetas) {
          const oldBanco = {
            banco: parsed.banco_banco || '',
            titular: parsed.banco_titular || '',
            cuenta: parsed.banco_cuenta || '',
            clabe: parsed.banco_clabe || '',
            concepto: parsed.banco_concepto || 'Regalo boda Ángel & Goreti'
          }
          parsed.tarjetas = (oldBanco.titular || oldBanco.clabe) ? [oldBanco] : []
        }
        setConfig({ ...DEFAULT_CONFIG, ...parsed })
      } catch {}
    }
    setLoading(false)
  }

  const saveConfig = async () => {
    setSaving(true)
    await supabase.from('configuracion').upsert({ clave: 'mesa_regalos', valor: JSON.stringify(config) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))

  // Links
  const addLink = () => set('links', [...(config.links || []), { label: '', url: '', iconUrl: '' }])
  const removeLink = (i) => set('links', config.links.filter((_, idx) => idx !== i))
  const updateLink = (i, k, v) => set('links', config.links.map((l, idx) => idx === i ? { ...l, [k]: v } : l))

  const uploadIcon = async (i, file) => {
    if (!file || !file.type.startsWith('image/')) return
    const ext = file.name.split('.').pop().toLowerCase()
    const name = `iconos/icon-${Date.now()}-${i}.${ext}`
    const { error } = await supabase.storage.from('galeria').upload(name, file, { upsert: true })
    if (!error) {
      const url = supabase.storage.from('galeria').getPublicUrl(name).data.publicUrl
      updateLink(i, 'iconUrl', url)
    }
  }

  const uploadBancoIcon = async (i, file) => {
    if (!file || !file.type.startsWith('image/')) return
    const ext = file.name.split('.').pop().toLowerCase()
    const name = `iconos/banco-${Date.now()}-${i}.${ext}`
    const { error } = await supabase.storage.from('galeria').upload(name, file, { upsert: true })
    if (!error) {
      const url = supabase.storage.from('galeria').getPublicUrl(name).data.publicUrl
      updateTarjeta(i, 'iconUrl', url)
    }
  }

  // Bank cards
  const addTarjeta = () => set('tarjetas', [...(config.tarjetas || []), { banco: '', titular: '', cuenta: '', clabe: '', concepto: 'Regalo boda Ángel & Goreti', iconUrl: '' }])
  const removeTarjeta = (i) => set('tarjetas', config.tarjetas.filter((_, idx) => idx !== i))
  const updateTarjeta = (i, k, v) => set('tarjetas', config.tarjetas.map((t, idx) => idx === i ? { ...t, [k]: v } : t))

  const inp = { width: '100%', padding: '0.65rem 0.9rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white', boxSizing: 'border-box' }

  if (loading) return <p style={{ color: 'var(--text-medium)', padding: '2rem' }}>Cargando...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Mesa de Regalos</h2>
          <p style={{ color: 'var(--text-medium)', fontSize: '0.8rem' }}>Configura las opciones que verán los invitados</p>
        </div>
        <button onClick={saveConfig} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: saved ? '#166534' : 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1.4rem', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Lato', fontWeight: 700, transition: 'background 0.3s' }}>
          <Save size={16} /> {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {/* Toggle visible */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.2rem 1.5rem', marginBottom: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.15rem' }}>Mostrar en la invitación</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-medium)' }}>Activa/desactiva la sección de mesa de regalos</p>
        </div>
        <button onClick={() => set('mostrar_mesa', !config.mostrar_mesa)} style={{ width: '52px', height: '28px', borderRadius: '14px', background: config.mostrar_mesa ? 'var(--sage)' : '#d1d5db', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
          <div style={{ position: 'absolute', top: '3px', left: config.mostrar_mesa ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
        </button>
      </div>

      {/* Intro message */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.3rem 1.5rem', marginBottom: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Mensaje introductorio</label>
        <textarea value={config.mensaje_intro} onChange={e => set('mensaje_intro', e.target.value)} style={{ ...inp, minHeight: '65px', resize: 'vertical' }} />
      </div>

      {/* ── STORE LINKS ── */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Gift size={17} color="var(--sage)" />
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: 'var(--text-dark)' }}>Links de tiendas</h3>
          </div>
          <button onClick={addLink} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Lato' }}>
            <Plus size={14} /> Agregar tienda
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-medium)', marginBottom: '1.2rem' }}>
          Icono recomendado: imagen cuadrada de <strong>{ICON_SIZE_PX}×{ICON_SIZE_PX}px</strong> en PNG con fondo transparente o blanco.
        </p>

        {(config.links || []).length === 0 ? (
          <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem', textAlign: 'center', padding: '1.2rem' }}>Sin tiendas. Da clic en "Agregar tienda".</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(config.links || []).map((link, i) => (
              <div key={i} style={{ background: 'var(--nude-light)', borderRadius: '14px', padding: '1.1rem 1.2rem', display: 'flex', gap: '0.8rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Icon upload */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <div
                    onClick={() => iconRefs.current[i]?.click()}
                    style={{ width: '64px', height: '64px', borderRadius: '14px', overflow: 'hidden', background: 'white', border: '2px dashed var(--sage)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
                  >
                    {link.iconUrl ? (
                      <img src={link.iconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Upload size={18} color="var(--sage)" />
                        <p style={{ fontSize: '0.55rem', color: 'var(--sage)', marginTop: '0.2rem', lineHeight: 1.2 }}>Icono</p>
                      </div>
                    )}
                  </div>
                  {link.iconUrl && (
                    <button onClick={() => updateLink(i, 'iconUrl', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <X size={10} /> quitar
                    </button>
                  )}
                  <input ref={el => iconRefs.current[i] = el} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadIcon(i, e.target.files[0])} />
                </div>

                {/* Fields */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '200px' }}>
                  <input value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} placeholder="Nombre de la tienda (ej: Mi lista Liverpool)" style={inp} />
                  <input value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} placeholder="https://..." style={inp} />
                </div>

                <button onClick={() => removeLink(i)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BANK CARDS ── */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CreditCard size={17} color="var(--sage)" />
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: 'var(--text-dark)' }}>Datos bancarios</h3>
          </div>
          <button onClick={addTarjeta} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--nude-deeper)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Lato' }}>
            <Plus size={14} /> Agregar cuenta
          </button>
        </div>

        {(config.tarjetas || []).length === 0 ? (
          <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem', textAlign: 'center', padding: '1.2rem' }}>Sin cuentas. Da clic en "Agregar cuenta".</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(config.tarjetas || []).map((t, i) => (
              <div key={i} style={{ background: 'var(--nude-light)', borderRadius: '14px', padding: '1.2rem', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                  <p style={{ fontFamily: 'Playfair Display', fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                    💳 Cuenta {i + 1}{t.banco ? ` · ${t.banco}` : ''}
                  </p>
                  <button onClick={() => removeTarjeta(i)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  {/* Bank icon upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                    <div
                      onClick={() => bancoRefs.current[i]?.click()}
                      style={{ width: '64px', height: '64px', borderRadius: '14px', overflow: 'hidden', background: 'white', border: '2px dashed var(--sage)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {t.iconUrl ? (
                        <img src={t.iconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <Upload size={18} color="var(--sage)" />
                          <p style={{ fontSize: '0.55rem', color: 'var(--sage)', marginTop: '0.2rem', lineHeight: 1.2 }}>Logo</p>
                        </div>
                      )}
                    </div>
                    {t.iconUrl && (
                      <button onClick={() => updateTarjeta(i, 'iconUrl', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <X size={10} /> quitar
                      </button>
                    )}
                    <input ref={el => bancoRefs.current[i] = el} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadBancoIcon(i, e.target.files[0])} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-medium)', lineHeight: 1.5, marginTop: '0.3rem' }}>
                    Logo del banco<br/>
                    <span style={{ opacity: 0.7 }}>PNG 80×80px recomendado</span>
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.7rem' }}>
                  {[
                    { k: 'banco', label: 'Banco', placeholder: 'BBVA, Banamex...' },
                    { k: 'titular', label: 'Titular', placeholder: 'Nombre completo' },
                    { k: 'cuenta', label: 'No. de cuenta', placeholder: '0000 0000 0000' },
                    { k: 'clabe', label: 'CLABE', placeholder: '18 dígitos' },
                    { k: 'concepto', label: 'Concepto sugerido', placeholder: 'Regalo boda' },
                  ].map(f => (
                    <div key={f.k}>
                      <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{f.label}</label>
                      <input value={t[f.k] || ''} onChange={e => updateTarjeta(i, f.k, e.target.value)} placeholder={f.placeholder} style={inp} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
