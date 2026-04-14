import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const sliderRef = useRef(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase.storage.from('galeria').list('fotos', {
        limit: 80, sortBy: { column: 'created_at', order: 'desc' }
      })
      // Also check root for backward compat
      const { data: rootData } = await supabase.storage.from('galeria').list('', {
        limit: 80, sortBy: { column: 'created_at', order: 'desc' }
      })
      const all = [
        ...(data || []).filter(f => !f.name.endsWith('/')).map(f => ({
          name: f.name,
          url: supabase.storage.from('galeria').getPublicUrl(`fotos/${f.name}`).data.publicUrl
        })),
        ...(rootData || []).filter(f => f.name !== '.emptyFolderPlaceholder' && !f.name.endsWith('/') && !f.name.startsWith('ceremonia') && !f.name.startsWith('fiesta')).map(f => ({
          name: f.name,
          url: supabase.storage.from('galeria').getPublicUrl(f.name).data.publicUrl
        }))
      ]
      setPhotos(all)
      setLoading(false)
    }
    fetchPhotos()
  }, [])

  const openPhoto = (photo, idx) => { setSelected({ ...photo, idx }); setZoom(1) }

  const prev = () => {
    if (selected.idx > 0) { setSelected({ ...photos[selected.idx - 1], idx: selected.idx - 1 }); setZoom(1) }
  }
  const next = () => {
    if (selected.idx < photos.length - 1) { setSelected({ ...photos[selected.idx + 1], idx: selected.idx + 1 }); setZoom(1) }
  }

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' })

  if (!loading && photos.length === 0) return null

  return (
    <section style={{ padding: '6rem 0', background: 'var(--white)', overflow: 'hidden' }}>
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem', padding: '0 2rem' }}>
        <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✦ ✦ ✦</p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-dark)', fontWeight: 400, marginBottom: '1rem' }}>Nuestra Historia</h2>
        <div style={{ width: '50px', height: '2px', background: 'var(--sage)', margin: '0 auto' }} />
      </motion.div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--nude)', borderTopColor: 'var(--sage)', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Arrows */}
          {photos.length > 3 && (
            <>
              <button onClick={scrollLeft} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: 'white', border: '1px solid var(--nude)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                <ChevronLeft size={20} color="var(--sage-dark)" />
              </button>
              <button onClick={scrollRight} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: 'white', border: '1px solid var(--nude)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                <ChevronRight size={20} color="var(--sage-dark)" />
              </button>
            </>
          )}

          {/* Slider */}
          <div ref={sliderRef} style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '1rem 3rem', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style>{`.gallery-slider::-webkit-scrollbar{display:none}`}</style>
            {photos.map((photo, idx) => (
              <motion.div
                key={photo.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                onClick={() => openPhoto(photo, idx)}
                style={{ flexShrink: 0, width: 'clamp(220px, 28vw, 300px)', height: 'clamp(260px, 35vw, 360px)', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start', position: 'relative', background: 'var(--nude)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
              >
                <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(107,127,90,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.25s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(107,127,90,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(107,127,90,0)'}
                >
                  <ZoomIn size={32} color="white" style={{ opacity: 0, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fade edges */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60px', background: 'linear-gradient(to right, var(--white), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '60px', background: 'linear-gradient(to left, var(--white), transparent)', pointerEvents: 'none' }} />
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={() => setSelected(null)}>
            {/* Close */}
            <button onClick={() => setSelected(null)} style={{ position: 'fixed', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <X size={18} color="white" />
            </button>

            {/* Zoom controls */}
            <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.6rem', zIndex: 2 }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '0.6rem 1rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <ZoomOut size={16} />
              </button>
              <span style={{ background: 'rgba(255,255,255,0.08)', padding: '0.6rem 1rem', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(4, z + 0.5))} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '0.6rem 1rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <ZoomIn size={16} />
              </button>
              <span style={{ background: 'rgba(255,255,255,0.06)', padding: '0.6rem 1rem', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>{selected.idx + 1} / {photos.length}</span>
            </div>

            {/* Prev/Next */}
            {selected.idx > 0 && (
              <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'fixed', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronLeft size={22} color="white" />
              </button>
            )}
            {selected.idx < photos.length - 1 && (
              <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'fixed', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronRight size={22} color="white" />
              </button>
            )}

            {/* Image */}
            <motion.div key={selected.name} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} onClick={e => e.stopPropagation()} style={{ overflow: 'auto', maxWidth: '92vw', maxHeight: '82vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={selected.url} alt="" style={{ maxWidth: `${92 * zoom}vw`, maxHeight: `${82 * zoom}vh`, objectFit: 'contain', borderRadius: zoom === 1 ? '16px' : '4px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', transition: 'max-width 0.3s, max-height 0.3s', cursor: zoom > 1 ? 'move' : 'default' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
