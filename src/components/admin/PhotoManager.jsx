import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, Trash2, Image } from 'lucide-react'

const SECTIONS = [
  { id: 'fotos', label: '📸 Galería "Nuestra Historia"', prefix: 'fotos/', desc: 'Fotos que aparecen en el carrusel de la invitación' },
  { id: 'ceremonia', label: '⛪ Imagen Lugar Ceremonia', prefix: 'ceremonia/', desc: 'Foto del lugar de la ceremonia religiosa (se muestra en la sección del evento)', single: true },
  { id: 'fiesta', label: '🎉 Imagen Lugar Recepción', prefix: 'fiesta/', desc: 'Foto del lugar de la recepción/fiesta (se muestra en la sección del evento)', single: true },
]

function PhotoSection({ section }) {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState('')
  const fileRef = useRef()

  useEffect(() => { fetchPhotos() }, [])

  const fetchPhotos = async () => {
    setLoading(true)
    const { data, error } = await supabase.storage.from('galeria').list(section.prefix.replace('/', ''), {
      limit: 100, sortBy: { column: 'created_at', order: 'desc' }
    })
    if (!error && data) {
      const valid = data.filter(f => f.name !== '.emptyFolderPlaceholder' && !f.name.endsWith('/'))
      setPhotos(valid.map(f => ({
        name: f.name,
        fullPath: `${section.prefix}${f.name}`,
        url: supabase.storage.from('galeria').getPublicUrl(`${section.prefix}${f.name}`).data.publicUrl
      })))
    }
    setLoading(false)
  }

  const uploadFiles = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    // If single mode, replace existing
    if (section.single && photos.length > 0) {
      if (!window.confirm('Solo se permite una imagen en esta sección. ¿Reemplazarla?')) return
      for (const p of photos) {
        await supabase.storage.from('galeria').remove([p.fullPath])
      }
    }
    const toUpload = section.single ? arr.slice(0, 1) : arr
    setUploading(true)
    for (let i = 0; i < toUpload.length; i++) {
      setProgress(`Subiendo ${i + 1} de ${toUpload.length}...`)
      const file = toUpload[i]
      const ext = file.name.split('.').pop().toLowerCase()
      const name = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`
      await supabase.storage.from('galeria').upload(`${section.prefix}${name}`, file, { upsert: false })
    }
    setProgress('')
    await fetchPhotos()
    setUploading(false)
  }

  const deletePhoto = async (photo) => {
    if (!window.confirm('¿Eliminar esta foto?')) return
    const { error } = await supabase.storage.from('galeria').remove([photo.fullPath])
    if (error) {
      alert('Error al eliminar: ' + error.message)
      return
    }
    fetchPhotos()
  }

  return (
    <div style={{ background: 'white', borderRadius: '18px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: '0.3rem' }}>{section.label}</h3>
      <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem', marginBottom: '1.2rem' }}>{section.desc}</p>

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
              {section.single ? 'Clic para subir imagen' : 'Clic o arrastra las fotos'}
            </p>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.78rem' }}>
              {section.single ? '1 imagen · JPG, PNG, WEBP' : 'Múltiples fotos · JPG, PNG, WEBP'}
            </p>
          </>
        )}
        <input ref={fileRef} type="file" multiple={!section.single} accept="image/*" style={{ display: 'none' }} onChange={e => uploadFiles(e.target.files)} />
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem', textAlign: 'center' }}>Cargando...</p>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-medium)' }}>
          <Image size={32} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.25 }} />
          <p style={{ fontSize: '0.82rem' }}>Sin imágenes aún</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${section.single ? '200px' : '150px'}, 1fr))`, gap: '0.8rem' }}>
          {photos.map(photo => (
            <div key={photo.name} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: section.single ? '16/9' : '1', background: 'var(--nude)' }}>
              <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => deletePhoto(photo)} style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'rgba(220,38,38,0.88)', border: 'none', borderRadius: '7px', padding: '0.3rem', cursor: 'pointer', display: 'flex', backdropFilter: 'blur(4px)' }}>
                <Trash2 size={13} color="white" />
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
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
        Gestión de Imágenes
      </h2>
      {SECTIONS.map(s => <PhotoSection key={s.id} section={s} />)}
    </div>
  )
}
