import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, Plus, Trash2, Gift, CreditCard } from 'lucide-react'

const DEFAULT_CONFIG = {
  mostrar_mesa: true,
  links: [],
  banco_nombre: '',
  banco_titular: '',
  banco_clabe: '',
  banco_cuenta: '',
  banco_banco: '',
  banco_concepto: 'Regalo boda Ángel & Goreti',
  mensaje_intro: '¡Tu presencia es nuestro mejor regalo! Si deseas hacernos un presente, aquí te dejamos algunas opciones:'
}

const STORES = [
  { id: 'amazon', label: 'Amazon', color: '#FF9900', icon: '📦' },
  { id: 'mercadolibre', label: 'MercadoLibre', color: '#FFE600', icon: '🛒' },
  { id: 'liverpool', label: 'Liverpool', color: '#DA291C', icon: '🎁' },
  { id: 'palacio', label: 'El Palacio de Hierro', color: '#1a1a1a', icon: '👑' },
  { id: 'otro', label: 'Otro', color: '#8B9D77', icon: '🔗' },
]

export default function GiftManager() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchConfig() }, [])

  const fetchConfig = async () => {
    const { data } = await supabase.from('configuracion').select('*').eq('clave', 'mesa_regalos').single()
    if (data?.valor) {
      try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(data.valor) }) } catch {}
    }
    setLoading(false)
  }

  const saveConfig = async () => {
    setSaving(true)
    const { error } = await supabase.from('configuracion').upsert({ clave: 'mesa_regalos', valor: JSON.stringify(config) })
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))

  const addLink = () => set('links', [...config.links, { tienda: 'otro', label: '', url: '' }])
  const removeLink = (i) => set('links', config.links.filter((_, idx) => idx !== i))
  const updateLink = (i, k, v) => set('links', config.links.map((l, idx) => idx === i ? { ...l, [k]: v } : l))

  const inp = { width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white', boxSizing: 'border-box' }

  if (loading) return <p style={{ color: 'var(--text-medium)', padding: '2rem' }}>Cargando...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--text-dark)' }}>Mesa de Regalos</h2>
        <button onClick={saveConfig} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: saved ? '#166534' : 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1.4rem', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Lato', fontWeight: 700, transition: 'background 0.3s' }}>
          <Save size={16} /> {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Toggle */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.3rem 1.5rem', marginBottom: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Mostrar sección en la invitación</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-medium)' }}>Activa/desactiva la sección de mesa de regalos</p>
        </div>
        <button onClick={() => set('mostrar_mesa', !config.mostrar_mesa)} style={{ width: '52px', height: '28px', borderRadius: '14px', background: config.mostrar_mesa ? 'var(--sage)' : '#d1d5db', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
          <div style={{ position: 'absolute', top: '3px', left: config.mostrar_mesa ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
        </button>
      </div>

      {/* Intro message */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Mensaje introductorio</label>
        <textarea value={config.mensaje_intro} onChange={e => set('mensaje_intro', e.target.value)} style={{ ...inp, minHeight: '70px', resize: 'vertical' }} />
      </div>

      {/* Store links */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Gift size={18} color="var(--sage)" />
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: 'var(--text-dark)' }}>Links de Tiendas</h3>
          </div>
          <button onClick={addLink} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Lato' }}>
            <Plus size={14} /> Agregar
          </button>
        </div>

        {config.links.length === 0 ? (
          <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
            Sin links agregados aún. Da clic en "Agregar" para añadir tiendas.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {config.links.map((link, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', flexWrap: 'wrap', padding: '1rem', background: 'var(--nude-light)', borderRadius: '12px' }}>
                <select value={link.tienda} onChange={e => updateLink(i, 'tienda', e.target.value)} style={{ ...inp, maxWidth: '160px', flex: '0 1 160px' }}>
                  {STORES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                </select>
                <input value={link.label} onChange={e => updateLink(i, 'label', e.target.value)} placeholder="Texto del botón (ej: Mi lista Amazon)" style={{ ...inp, flex: '1 1 180px' }} />
                <input value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} placeholder="https://..." style={{ ...inp, flex: '2 1 240px' }} />
                <button onClick={() => removeLink(i)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '0.7rem', cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bank transfer */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
          <CreditCard size={18} color="var(--sage)" />
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: 'var(--text-dark)' }}>Datos Bancarios / Transferencia</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
          {[
            { k: 'banco_banco', label: 'Banco', placeholder: 'BBVA, Banamex, HSBC...' },
            { k: 'banco_titular', label: 'Titular de la cuenta', placeholder: 'Nombre completo' },
            { k: 'banco_cuenta', label: 'Número de cuenta', placeholder: '1234 5678 9012 3456' },
            { k: 'banco_clabe', label: 'CLABE interbancaria', placeholder: '18 dígitos' },
            { k: 'banco_concepto', label: 'Concepto sugerido', placeholder: 'Ej: Regalo boda' },
          ].map(f => (
            <div key={f.k}>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>{f.label}</label>
              <input value={config[f.k] || ''} onChange={e => set(f.k, e.target.value)} placeholder={f.placeholder} style={inp} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
