import { useEffect, useState } from 'react'
import styles from './SuggestedGameModal.module.css'
import {
  X, RotateCcw, Play, Heart, XCircle, SlidersHorizontal,
  MonitorCheck, Building2, Calendar, CircleDashed, Quote, Star,
  Clock, Gamepad2, Monitor, History
} from 'lucide-react'


const QUOTES = [
  { text: "Un héroe no nace, se forja en la batalla.", author: "Kratos (God of War)" },
  { text: "La aventura te espera, solo necesitas dar el primer paso.", author: "The Legend of Zelda" },
  { text: "El hombre adecuado en el sitio equivocado puede cambiar el rumbo del mundo.", author: "G-Man (Half-Life 2)" },
  { text: "El destino favorece a los valientes.", author: "Nathan Drake (Uncharted)" },
  { text: "¿Qué es un hombre sino una miserable pila de secretos?", author: "Drácula (Castlevania: Symphony of the Night)" },
  { text: "No somos herramientas del gobierno ni de nadie más. Luchar era lo único de lo que era capaz, pero al menos siempre luché por aquello en lo que creía.", author: "Gray Fox (Metal Gear Solid)" },
  { text: "Un hombre elige, un esclavo obedece.", author: "Andrew Ryan (BioShock)" },
  { text: "Nada es verdad, todo está permitido.", author: "Ezio Auditore (Assassin's Creed)" },
  { text: "No aceptes el mundo tal como parece ser, atrévete a verlo como podría ser.", author: "Winston (Overwatch)" },
  { text: "Incluso en el momento de la muerte, hay esperanza de que algo de nosotros sobreviva.", author: "Cortana (Halo 4)" },
  { text: "¿A dónde van todos? ¿Al Bingo?", author: "Leon S. Kennedy (RE4)" },
]

function Confetti() {
  const colors = ['#7c3aed', '#a78bfa', '#f5a623', '#00d4ff', '#ff6b35', '#22c55e', '#ec4899']

  return (
    <div className={styles.confettiWrapper}>
      {/* Cohete que sube */}
      <div className={styles.rocket} />

      {/* Partículas que explotan desde el centro-arriba */}
      {Array.from({ length: 120 }, (_, i) => {
        const angle = (i / 60) * 360
        const distance = 80 + Math.random() * 180
        const x = Math.cos((angle * Math.PI) / 180) * distance
        const y = Math.sin((angle * Math.PI) / 180) * distance
        return (
          <div
            key={i}
            className={styles.confettiPiece}
            style={{
              '--x': `${x}px`,
              '--y': `${y}px`,
              left: '50%',
              top: '20%',
              animationDelay: `0.6s`,
              animationDuration: `${1.2 + Math.random() * 1}s`,
              background: colors[i % colors.length],
              width: '3px',
              height: `${8 + Math.random() * 8}px`,
              borderRadius: '2px',
            }}
          />
        )
      })}
    </div>
  )
}

function SuggestedGameModal({ game, onConfirm, onDismiss, onClose }) {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  if (!game) return null

  const cover = game.cover
    ? (game.cover.startsWith('//') ? `https:${game.cover}` : game.cover)
    : null

  const genres = (game.genres || (game.genre ? [game.genre] : [])).slice(0, 4)
  const platform = (game.platforms || (game.platform ? [game.platform] : []))[0] || 'PC'
  const hoursPlayed = game.hoursPlayed || game.hours_played || '—'

  return (
    <div className={`${styles.backdrop} ${mounted ? styles.backdropVisible : ''}`} onClick={onClose}>
      <div className={`${styles.modal} ${mounted ? styles.modalVisible : ''}`} onClick={e => e.stopPropagation()}>

        <Confetti />

        <button className={styles.closeBtn} onClick={onClose}>
          <X size={16} />
        </button>

        {/* HEADER — centrado, fuera del grid */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitle}>
            El destino ha elegido{' '}
            <span className={styles.headerTitleAccent}>tu próxima aventura</span>
          </div>
          <div className={styles.headerSub}>
            Cada partida es una nueva historia. ¿Listo para continuar la tuya?
          </div>
        </div>

        {/* GRID — 2 columnas */}
        <div className={styles.layout}>

          {/* IZQUIERDA */}
          <div className={styles.leftCol}>
            <img src="/src/assets/Dice_Back.png" alt="" className={styles.leftBgImg} />
            <div className={styles.coverFrame}>
              {cover
                ? <img src={cover} alt={game.title} className={styles.coverImg} />
                : <div className={styles.coverPlaceholder}>🎮</div>
              }
            </div>
          </div>

          {/* DERECHA */}
          <div className={styles.rightCol}>

            <div className={styles.particles}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.particle} style={{
                  '--px': `${Math.random() * 100}%`,
                  '--py': `${Math.random() * 100}%`,
                  '--pd': `${2 + Math.random() * 4}s`,
                  '--ps': `${0.3 + Math.random() * 0.7}`,
                }} />
              ))}
            </div>

            <div className={styles.gameRow}>
              <h2 className={styles.gameTitle}>
                {game.sagaTitle
                  ? <>{game.sagaTitle}: <span className={styles.gameTitleMain}>{game.title}</span></>
                  : game.title
                }
              </h2>
              <button className={styles.favoriteBtn}><Star size={16} /></button>
            </div>

            <div className={styles.genreChips}>
              {genres.map(g => <span key={g} className={styles.genreChip}>{g}</span>)}
            </div>

            {/* INFO GRID */}
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoIcon}><Gamepad2 size={20} /></span>
                <span className={styles.infoKey}>Género</span>
                <span className={styles.infoVal}>{(game.genres || game.genre)?.join(', ')}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoIcon}><MonitorCheck size={20} /></span>
                <span className={styles.infoKey}>Plataforma</span>
                <span className={styles.infoVal}>{(game.platforms || game.platform)?.join(', ')}</span>
              </div>
              {game.developer && (
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}><Building2 size={20} /></span>
                  <span className={styles.infoKey}>Desarrollador</span>
                  <span className={styles.infoVal}>{game.developer}</span>
                </div>
              )}
              {game.year && (
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}><Calendar size={20} /></span>
                  <span className={styles.infoKey}>Año</span>
                  <span className={styles.infoVal}>{game.year}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoIcon}><CircleDashed size={20} /></span>
                <span className={styles.infoKey}>Estado</span>
                <span className={styles.infoValBadge}>
                  <span className={styles.badgeDot} /> Pendiente
                </span>
              </div>
            </div>

            {/* QUOTE */}
            <div className={styles.quote}>
              <span className={styles.quoteIcon}><Quote size={20} /></span>
              <div>
                <p className={styles.quoteText}>{quote.text}</p>
                <p className={styles.quoteAuthor}>— {quote.author}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <p className={styles.footerTitle}>¿Listo para comenzar esta aventura?</p>
            <p className={styles.footerSub}>¡El destino ha hablado! Dale una oportunidad y disfruta el viaje.</p>
          </div>
          <div className={styles.footerActions}>
            <button className={styles.dismissBtn} onClick={onDismiss}>
              <span>🎲</span> Elegir otro
            </button>
            <button className={styles.confirmBtn} onClick={() => onConfirm(game)}>
              <span>🚀</span> ¡A jugar!
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SuggestedGameModal