import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { X, ZoomIn, ImageOff } from 'lucide-react'

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase.storage.from('galeria').list('', {
        limit: 60, sortBy: { column: 'created_at', order: 'desc' }
      })
      if (data) {
        setPhotos(
          data
            .filter(f => f.name !== '.emptyFolderPlaceholder')
            .map(f => ({
              name: f.name,
              url: supabase.storage.from('galeria').getPublicUrl(f.name).data.publicUrl
            }))
        )
      }
      setLoading(false)
    }
    fetchPhotos()
  }, [])

  if (!loading && photos.length === 0) return null

  return (
    <section style={{ padding: '6rem 2rem', background: 'var(--white)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✦ ✦ ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-dark)', fontWeight: 400, marginBottom: '1rem' }}>
            Nuestra Historia
          </h2>
          <div style={{ width: '50px', height: '2px', background: 'var(--sage)', margin: '0 auto' }} />
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--nude)', borderTopColor: 'var(--sage)', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : (
          <div style={{
            columns: 'auto 220px',
            columnGap: '1rem',
            orphans: 1, widows: 1
          }}>
            {photos.map((photo, i) => (
              <motion.div
                key={photo.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(photo)}
                style={{
                  breakInside: 'avoid',
                  marginBottom: '1rem',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  background: 'var(--nude)'
                }}
              >
                <img src={photo.url} alt="" style={{ width: '100%', display: 'block', verticalAlign: 'bottom' }} />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(107,127,90,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.2s'
                  }}
                >
                  <ZoomIn size={28} color="white" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, padding: '1rem'
            }}
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              src={selected.url}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
            />
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'fixed', top: '1rem', right: '1rem',
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%',
                width: '44px', height: '44px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} color="white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
