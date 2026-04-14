import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, MapPin, ExternalLink } from 'lucide-react'

const DEFAULT = {
  ceremonia_nombre: '',
  ceremonia_direccion: '',
  ceremonia_hora: '12:00 p.m.',
  ceremonia_maps_url: '',
  fiesta_nombre: '',
  fiesta_direccion: '',
  fiesta_hora: '2:00 p.m.',
  fiesta_maps_url: '',
}

export default function VenueConfig() {
  const [config, setConfig] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchConfig() }, [])

  const fetchConfig = async () => {
    const { data } = await supabase.from('configuracion').select('*').eq('clave', 'venues').single()
    if (data?.valor) {
      try { setConfig({ ...DEFAULT, ...JSON.parse(data.valor) }) } catch {}
    }
    setLoading(false)
  }

  const saveConfig = async () => {
    setSaving(true)
    await supabase.from('configuracion').upsert({ clave: 'venues', valor: JSON.stringify(config) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }))

  const inp = { width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white', boxSizing: 'border-box', transition: 'border-color 0.2s' }

  if (loading) return <p style={{ color: 'var(--text-medium)', padding: '2rem' }}>Cargando...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>Lugares del Evento</h2>
          <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem' }}>
            Configura los datos que aparecen en las cards de Ceremonia y Recepción de la invitación.
          </p>
        </div>
        <button onClick={saveConfig} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: saved ? '#166534' : 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1.4rem', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Lato', fontWeight: 700, transition: 'background 0.3s', whiteSpace: 'nowrap' }}>
          <Save size={16} /> {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Ceremonia */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderTop: '4px solid var(--sage)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.3rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.1rem' }}>⛪</span>
            </div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 600 }}>Ceremonia Religiosa</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Nombre del lugar</label>
              <input value={config.ceremonia_nombre} onChange={e => set('ceremonia_nombre', e.target.value)} placeholder="Ej: Parroquia de San Juan" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Dirección</label>
              <input value={config.ceremonia_direccion} onChange={e => set('ceremonia_direccion', e.target.value)} placeholder="Calle, Colonia, Ciudad" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Hora</label>
              <input value={config.ceremonia_hora} onChange={e => set('ceremonia_hora', e.target.value)} placeholder="12:00 p.m." style={{ ...inp, maxWidth: '160px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Link de ubicación (Google Maps / Waze)</label>
              <input value={config.ceremonia_maps_url} onChange={e => set('ceremonia_maps_url', e.target.value)} placeholder="https://maps.google.com/..." style={inp} />
              {config.ceremonia_maps_url && (
                <a href={config.ceremonia_maps_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--sage)', fontSize: '0.75rem', marginTop: '0.4rem', textDecoration: 'none' }}>
                  <ExternalLink size={12} /> Verificar link
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Recepción */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderTop: '4px solid var(--nude-deeper)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.3rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--nude-deeper)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.1rem' }}>🎉</span>
            </div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 600 }}>Recepción y Fiesta</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Nombre del lugar</label>
              <input value={config.fiesta_nombre} onChange={e => set('fiesta_nombre', e.target.value)} placeholder="Ej: Salón La Hacienda" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Dirección</label>
              <input value={config.fiesta_direccion} onChange={e => set('fiesta_direccion', e.target.value)} placeholder="Calle, Colonia, Ciudad" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Hora</label>
              <input value={config.fiesta_hora} onChange={e => set('fiesta_hora', e.target.value)} placeholder="2:00 p.m." style={{ ...inp, maxWidth: '160px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-medium)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>Link de ubicación (Google Maps / Waze)</label>
              <input value={config.fiesta_maps_url} onChange={e => set('fiesta_maps_url', e.target.value)} placeholder="https://maps.google.com/..." style={inp} />
              {config.fiesta_maps_url && (
                <a href={config.fiesta_maps_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--nude-deeper)', fontSize: '0.75rem', marginTop: '0.4rem', textDecoration: 'none' }}>
                  <ExternalLink size={12} /> Verificar link
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--nude-light)', borderRadius: '14px', padding: '1rem 1.2rem', marginTop: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
        <MapPin size={16} color="var(--sage-dark)" style={{ marginTop: '1px', flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
          <strong>¿Cómo obtener el link de Google Maps?</strong> Busca el lugar en Google Maps → clic en "Compartir" → "Copiar enlace". También puedes usar Waze o Apple Maps.
        </p>
      </div>
    </div>
  )
}
