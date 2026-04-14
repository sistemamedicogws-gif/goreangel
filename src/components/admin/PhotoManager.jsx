import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, Trash2, Image, CheckCircle } from 'lucide-react'

export default function PhotoManager() {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState('')
  const fileRef = useRef()

  useEffect(() => { fetchPhotos() }, [])

  const fetchPhotos = async () => {
    setLoading(true)
    const { data } = await supabase.storage.from('galeria').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    const valid = (data || []).filter(f => f.name !== '.emptyFolderPlaceholder')
    setPhotos(valid.map(f => ({
      name: f.name,
      url: supabase.storage.from('galeria').getPublicUrl(f.name).data.publicUrl
    })))
    setLoading(false)
  }

  const uploadFiles = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    setUploading(true)
    for (let i = 0; i < arr.length; i++) {
      setProgress(`Subiendo ${i + 1} de ${arr.length}...`)
      const file = arr[i]
      const ext = file.name.split('.').pop().toLowerCase()
      const name = `${Date.now()}-${Math.random().toString(36).substr(2, 7)}.${ext}`
      await supabase.storage.from('galeria').upload(name, file, { upsert: false })
    }
    setProgress('')
    await fetchPhotos()
    setUploading(false)
  }

  const deletePhoto = async (name) => {
    if (!window.confirm('¿Eliminar esta foto de la galería?')) return
    await supabase.storage.from('galeria').remove([name])
    fetchPhotos()
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>
        Galería de Fotos
      </h2>

      {/* Upload zone */}
      <div
        onClick={() => !uploading && fileRef.current.click()}
        onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        style={{
          border: `2px dashed ${dragOver ? 'var(--sage-dark)' : 'var(--sage)'}`,
          borderRadius: '18px',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          background: dragOver ? 'rgba(139,157,119,0.08)' : uploading ? 'var(--nude-light)' : 'white',
          marginBottom: '2rem',
          transition: 'all 0.2s'
        }}
      >
        {uploading ? (
          <>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid var(--nude)', borderTopColor: 'var(--sage)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <p style={{ color: 'var(--sage-dark)', fontWeight: 600 }}>{progress || 'Subiendo...'}</p>
          </>
        ) : (
          <>
            <Upload size={36} color="var(--sage)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: 'var(--text-dark)', fontWeight: 600, marginBottom: '0.4rem' }}>
              Haz clic o arrastra las fotos aquí
            </p>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem' }}>
              JPG, PNG, WEBP · puedes subir varias a la vez
            </p>
          </>
        )}
        <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => uploadFiles(e.target.files)} />
      </div>

      {/* Stats */}
      {!loading && (
        <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {photos.length === 0 ? 'No hay fotos aún' : `${photos.length} foto${photos.length !== 1 ? 's' : ''} en la galería`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-medium)', padding: '2rem' }}>Cargando...</p>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-medium)' }}>
          <Image size={48} style={{ margin: '0 auto 1rem', opacity: 0.25, display: 'block' }} />
          <p>Sube las primeras fotos para que aparezcan en la invitación</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {photos.map(photo => (
            <div key={photo.name} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1', background: 'var(--nude)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button
                onClick={() => deletePhoto(photo.name)}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(220,38,38,0.9)', border: 'none', borderRadius: '8px', padding: '0.35rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
              >
                <Trash2 size={14} color="white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
