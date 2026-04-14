import { motion } from 'framer-motion'

const events = [
  { time: '12:00 p.m.', title: 'Ceremonia Religiosa', desc: 'El inicio de nuestra historia eterna', emoji: '⛪', color: 'var(--sage)' },
  { time: '1:30 p.m.', title: 'Sesión de Fotos', desc: 'Capturando los momentos especiales junto a los novios', emoji: '📸', color: 'var(--nude-deeper)' },
  { time: '2:00 p.m.', title: 'Bienvenida y Cóctel', desc: 'Música, brindis y convivencia entre familia y amigos', emoji: '🥂', color: 'var(--sage-dark)' },
  { time: '4:00 p.m.', title: 'Banquete', desc: 'Un festín preparado con amor para todos nuestros invitados', emoji: '🍽️', color: 'var(--sage)' },
  { time: '6:00 p.m.', title: 'Primer Vals', desc: 'El baile que sella nuestra unión frente a todos ustedes', emoji: '💃', color: 'var(--nude-deeper)' },
  { time: '6:30 p.m.', title: '¡A Bailar!', desc: 'La fiesta no para hasta que el último invitado quede satisfecho', emoji: '🎶', color: 'var(--sage-dark)' },
]

export default function Itinerary() {
  return (
    <section style={{
      padding: '6rem 2rem',
      background: 'linear-gradient(180deg, var(--nude-light) 0%, var(--white) 100%)'
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <p style={{ fontFamily: 'Lato', fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--sage)', textTransform: 'uppercase', marginBottom: '0.8rem' }}>✦ ✦ ✦</p>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--text-dark)', fontWeight: 400, marginBottom: '1rem' }}>
            Itinerario
          </h2>
          <div style={{ width: '50px', height: '2px', background: 'var(--sage)', margin: '0 auto' }} />
        </motion.div>

        <div style={{ position: 'relative' }}>
          {/* Vertical line — only on desktop */}
          <div style={{
            position: 'absolute',
            left: 'calc(50% - 1px)',
            top: '24px', bottom: '24px',
            width: '2px',
            background: 'linear-gradient(to bottom, transparent, var(--sage-light), transparent)',
            display: 'block'
          }} />

          {events.map((ev, i) => {
            const isLeft = i % 2 === 0
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex',
                  justifyContent: isLeft ? 'flex-start' : 'flex-end',
                  paddingLeft: isLeft ? 0 : 'calc(50% + 2.5rem)',
                  paddingRight: isLeft ? 'calc(50% + 2.5rem)' : 0,
                  marginBottom: '2rem',
                  position: 'relative'
                }}
              >
                {/* Center dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '44px', height: '44px',
                  background: 'white',
                  border: `2px solid ${ev.color}`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 2, fontSize: '1.1rem',
                  boxShadow: '0 0 0 4px var(--white)'
                }}>
                  {ev.emoji}
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '18px',
                  padding: '1.2rem 1.5rem',
                  boxShadow: '0 4px 24px rgba(139,157,119,0.1)',
                  border: `1px solid ${ev.color}30`,
                  maxWidth: '260px',
                  textAlign: isLeft ? 'right' : 'left'
                }}>
                  <p style={{ fontSize: '0.7rem', color: ev.color, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    {ev.time}
                  </p>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.3rem', fontWeight: 600 }}>
                    {ev.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
                    {ev.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
