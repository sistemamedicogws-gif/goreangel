import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, Trash2, Image } from 'lucide-react'

// Gallery uses ROOT of bucket (backward compatible with existing photos)
// Ceremony uses 'ceremonia/' prefix
// Fiesta uses 'fiesta/' prefix
const SECTIONS = [
  { id: 'galeria', label: '📸 Galería "Nuestra Historia"', prefix: '', desc: 'Fotos que aparecen en el carrusel de la invitación', single: false },
  { id: 'ceremonia', label: '⛪ Imagen Lugar Ceremonia', prefix: 'ceremonia/', desc: 'Foto del lugar de la ceremonia (aparece en la card de ceremonia)', single: true },
  { id: 'fiesta', label: '🎉 Imagen Lugar Recepción', prefix: 'fiesta/', desc: 'Foto del lugar de la recepción (aparece en la card de recepción)', single: true },
]

// Files to always exclude from listing
const EXCLUDED = ['.emptyFolderPlaceholder']
const EXCLUDED_PREFIXES = ['ceremonia/', 'fiesta/']

function PhotoSection({ section }) {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const fileRef = useRef()

  useEffect(() => { fetchPhotos() }, [])

  const fetchPhotos = async () => {
    setLoading(true)
    let allPhotos = []

    if (section.prefix === '') {
      // Root folder — exclude ceremony and fiesta files
      const { data } = await supabase.storage.from('galeria').list('', {
        limit: 200, sortBy: { column: 'created_at', order: 'desc' }
      })
      if (data) {
        allPhotos = data
          .filter(f =>
            !EXCLUDED.includes(f.name) &&
            !f.name.endsWith('/') &&
            !EXCLUDED_PREFIXES.some(p => f.name.startsWith(p))
          )
          .map(f => ({
            name: f.name,
            fullPath: f.name,
            url: supabase.storage.from('galeria').getPublicUrl(f.name).data.publicUrl
          }))
      }
    } else {
      // Subfolder
      const folder = section.prefix.replace('/', '')
      const { data } = await supabase.storage.from('galeria').list(folder, {
        limit: 50, sortBy: { column: 'created_at', order: 'desc' }
      })
      if (data) {
        allPhotos = data
          .filter(f => !EXCLUDED.includes(f.name) && !f.name.endsWith('/'))
          .map(f => ({
            name: f.name,
            fullPath: `${section.prefix}${f.name}`,
            url: supabase.storage.from('galeria').getPublicUrl(`${section.prefix}${f.name}`).data.publicUrl
          }))
      }
    }

    setPhotos(allPhotos)
    setLoading(false)
  }

  const uploadFiles = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return

    if (section.single && photos.length > 0) {
      if (!window.confirm('Solo se permite una imagen. ¿Reemplazar la actual?')) return
      for (const p of photos) {
        await supabase.storage.from('galeria').remove([p.fullPath])
      }
    }

    const toUpload = section.single ? arr.slice(0, 1) : arr
    setUploading(true)
    setDeleteError('')

    for (let i = 0; i < toUpload.length; i++) {
      setProgress(`Subiendo ${i + 1} de ${toUpload.length}...`)
      const file = toUpload[i]
      const ext = file.name.split('.').pop().toLowerCase()
      const name = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`
      const path = section.prefix ? `${section.prefix}${name}` : name
      const { error } = await supabase.storage.from('galeria').upload(path, file, { upsert: false })
      if (error) console.error('Upload error:', error)
    }

    setProgress('')
    await fetchPhotos()
    setUploading(false)
  }

  const deletePhoto = async (photo) => {
    if (!window.confirm(`¿Eliminar esta foto?`)) return
    setDeleteError('')
    const { error } = await supabase.storage.from('galeria').remove([photo.fullPath])
    if (error) {
      setDeleteError(`Error: ${error.message}. Asegúrate de haber ejecutado el SQL de políticas en Supabase.`)
      return
    }
    fetchPhotos()
  }

  const inp = { width: '100%', padding: '0.7rem 1rem', border: '2px solid var(--nude)', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', fontFamily: 'Lato', color: 'var(--text-dark)', background: 'white', boxSizing: 'border-box' }

  return (
    <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>{section.label}</h3>
      <p style={{ color: 'var(--text-medium)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>{section.desc}</p>

      {deleteError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.82rem' }}>
          ⚠️ {deleteError}
        </div>
      )}

      {/* Upload zone */}
      <div
        onClick={() => !uploading && fileRef.current.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        style={{ border: `2px dashed ${dragOver ? 'var(--sage-dark)' : 'var(--sage)'}`, borderRadius: '14px', padding: '1.5rem', textAlign: 'center', cursor: uploading ? 'default' : 'pointer', background: dragOver ? 'rgba(139,157,119,0.06)' : 'white', marginBottom: '1.2rem', transition: 'all 0.2s' }}
      >
        {uploading ? (
          <>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--nude)', borderTopColor: 'var(--sage)', animation: 'spin 1s linear infinite', margin: '0 auto 0.6rem' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: 'var(--sage-dark)', fontSize: '0.85rem', fontWeight: 600 }}>{progress || 'Subiendo...'}</p>
          </>
        ) : (
          <>
            <Upload size={28} color="var(--sage)" style={{ margin: '0 auto 0.6rem', display: 'block' }} />
            <p style={{ color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              {section.single ? 'Clic para subir imagen' : 'Clic o arrastra las fotos aquí'}
            </p>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.78rem' }}>
              {section.single ? '1 imagen · JPG, PNG, WEBP' : 'Múltiples fotos · JPG, PNG, WEBP'}
            </p>
          </>
        )}
        <input ref={fileRef} type="file" multiple={!section.single} accept="image/*" style={{ display: 'none' }} onChange={e => uploadFiles(e.target.files)} />
      </div>

      {/* Photo count */}
      {!loading && photos.length > 0 && (
        <p style={{ color: 'var(--text-medium)', fontSize: '0.78rem', marginBottom: '0.8rem' }}>
          {photos.length} {photos.length === 1 ? 'imagen' : 'imágenes'} · Clic en 🗑 para eliminar
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem', textAlign: 'center' }}>Cargando...</p>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-medium)' }}>
          <Image size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.2 }} />
          <p style={{ fontSize: '0.82rem' }}>Sin imágenes</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${section.single ? '220px' : '130px'}, 1fr))`, gap: '0.7rem' }}>
          {photos.map(photo => (
            <div key={photo.fullPath} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: section.single ? '16/9' : '1', background: 'var(--nude)', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
              <img
                src={photo.url}
                alt=""
                onError={e => { e.currentTarget.parentElement.dataset.broken = 'true'; e.currentTarget.parentElement.style.outline = '2px solid #dc2626'; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div className="broken-label" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(220,38,38,0.85)', color: 'white', fontSize: '0.65rem', textAlign: 'center', padding: '0.2rem', display: 'none' }}>
                ⚠️ Imagen rota — Borrar
              </div>
              <style>{`[data-broken="true"] .broken-label { display: block !important; }`}</style>
              <button
                onClick={() => deletePhoto(photo)}
                style={{ position: 'absolute', top: '0.35rem', right: '0.35rem', background: 'rgba(220,38,38,0.9)', border: 'none', borderRadius: '7px', padding: '0.3rem 0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', backdropFilter: 'blur(4px)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
              >
                <Trash2 size={12} color="white" />
                <span style={{ color: 'white', fontSize: '0.65rem', fontFamily: 'Lato' }}>Borrar</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PhotoManager() {
  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
        Gestión de Imágenes
      </h2>
      <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
        ⚠️ Ejecutar SQL Supabase.
      </p>
      {SECTIONS.map(s => <PhotoSection key={s.id} section={s} />)}
    </div>
  )
}
