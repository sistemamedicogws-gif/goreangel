import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, Music, Trash2, Play, Pause } from 'lucide-react'

export default function MusicConfig() {
  const [musicUrl, setMusicUrl] = useState(null)
  const [musicName, setMusicName] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const audioRef = useRef()

  useEffect(() => { fetchMusic() }, [])

  const fetchMusic = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('configuracion').select('*').eq('clave', 'musica_url').single()
      if (data?.valor) {
        setMusicUrl(data.valor)
        const parts = data.valor.split('/')
        setMusicName(decodeURIComponent(parts[parts.length - 1]))
      }
    } catch {}
    setLoading(false)
  }

  const uploadMusic = async (file) => {
    if (!file) return
    setError('')

    if (!file.type.startsWith('audio/')) {
      setError('Solo se permiten archivos de audio (MP3, M4A, OGG, WAV)')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('El archivo es muy grande. Máximo 15MB.')
      return
    }

    setUploading(true)
    setProgress('Subiendo música...')

    try {
      // Delete old if exists
      if (musicUrl) {
        const oldPath = musicUrl.split('/galeria/')[1]
        if (oldPath) await supabase.storage.from('galeria').remove([oldPath])
      }

      const ext = file.name.split('.').pop().toLowerCase()
      const path = `musica/boda-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('galeria')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setError('Error al subir: ' + uploadError.message)
        setUploading(false)
        setProgress('')
        return
      }

      const url = supabase.storage.from('galeria').getPublicUrl(path).data.publicUrl
      await supabase.from('configuracion').upsert({ clave: 'musica_url', valor: url })

      setMusicUrl(url)
      setMusicName(file.name)
    } catch (e) {
      setError('Error inesperado: ' + e.message)
    }

    setProgress('')
    setUploading(false)
  }

  const deleteMusic = async () => {
    if (!window.confirm('¿Eliminar la música de fondo?')) return
    if (audioRef.current) { audioRef.current.pause(); setPlaying(false) }
    try {
      if (musicUrl) {
        const path = musicUrl.split('/galeria/')[1]
        if (path) await supabase.storage.from('galeria').remove([path])
      }
      await supabase.from('configuracion').upsert({ clave: 'musica_url', valor: '' })
    } catch {}
    setMusicUrl(null)
    setMusicName(null)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  if (loading) return <p style={{ color: 'var(--text-medium)', padding: '2rem' }}>Cargando...</p>

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.3rem' }}>
          🎵 Música de Fondo
        </h2>
        <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem' }}>
          La música inicia cuando el invitado abre el sobre. Formatos: MP3, M4A, OGG · Máximo 15MB
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.8rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {musicUrl ? (
        <div style={{ background: 'white', borderRadius: '18px', padding: '1.8rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {/* Music info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--sage), var(--sage-dark))', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Music size={24} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                {musicName || 'Música de boda'}
              </p>
              <p style={{ color: 'var(--sage)', fontSize: '0.78rem' }}>✓ Activa en la invitación</p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={togglePlay} style={{ background: 'var(--sage)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.6rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Lato', fontSize: '0.85rem', fontWeight: 600 }}>
                {playing ? <><Pause size={15} /> Pausar</> : <><Play size={15} /> Escuchar</>}
              </button>
              <button onClick={deleteMusic} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', padding: '0.6rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Simple waveform */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '36px', background: 'var(--nude-light)', borderRadius: '10px', padding: '0 1rem', marginBottom: '1rem' }}>
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} style={{ flex: 1, background: playing ? 'var(--sage)' : 'var(--nude)', borderRadius: '2px', height: `${25 + Math.sin(i * 0.8) * 50}%`, transition: 'background 0.3s' }} />
            ))}
          </div>

          <p style={{ color: 'var(--text-medium)', fontSize: '0.78rem', textAlign: 'center', marginBottom: '1rem' }}>
            Para cambiar la canción, sube un nuevo archivo.
          </p>

          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: '100%', background: 'var(--nude-light)', color: 'var(--text-medium)', border: '1px solid var(--nude)', borderRadius: '10px', padding: '0.7rem', cursor: 'pointer', fontFamily: 'Lato', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Upload size={15} /> {uploading ? progress : 'Reemplazar música'}
          </button>

          <audio ref={audioRef} src={musicUrl} loop style={{ display: 'none' }} />
          <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => uploadMusic(e.target.files[0])} />
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onDrop={e => { e.preventDefault(); setDragOver(false); uploadMusic(e.dataTransfer.files[0]) }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          style={{ border: `2px dashed ${dragOver ? 'var(--sage-dark)' : 'var(--sage)'}`, borderRadius: '18px', padding: '3rem 2rem', textAlign: 'center', cursor: uploading ? 'default' : 'pointer', background: dragOver ? 'rgba(139,157,119,0.06)' : 'white', transition: 'all 0.2s', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          {uploading ? (
            <>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--nude)', borderTopColor: 'var(--sage)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ color: 'var(--sage-dark)', fontWeight: 600 }}>{progress}</p>
            </>
          ) : (
            <>
              <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--sage-light), var(--nude-light))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                <Music size={28} color="var(--sage-dark)" />
              </div>
              <p style={{ color: 'var(--text-dark)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>
                Clic o arrastra tu canción aquí
              </p>
              <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                MP3, M4A, OGG, WAV · Máximo 15MB
              </p>
              <p style={{ color: 'var(--sage-dark)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                💡 Una canción romántica instrumental funciona perfecto
              </p>
            </>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => uploadMusic(e.target.files[0])} />
    </div>
  )
}
