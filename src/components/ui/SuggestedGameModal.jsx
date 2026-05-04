import { useEffect, useState } from 'react'
import styles from './SuggestedGameModal.module.css'
import { Gamepad2, MonitorCheck, Building2, Calendar, CircleDashed, Quote} from 'lucide-react'

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
  const pieces = Array.from({ length: 50 }, (_, i) => i)
  const colors = ['#7c3aed', '#a78bfa', '#f5a623', '#00d4ff', '#ff6b35', '#22c55e', '#ec4899']
  return (
    <div className={styles.confettiWrapper}>
      {pieces.map(i => (
        <div
          key={i}
          className={styles.confettiPiece}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.5}s`,
            animationDuration: `${1.5 + Math.random() * 1.5}s`,
            background: colors[i % colors.length],
            width: Math.random() > 0.5 ? '8px' : '5px',
            height: Math.random() > 0.5 ? '12px' : '8px',
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}

function SuggestedGameModal({ game, onConfirm, onDismiss, onClose }) {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

  if (!game) return null

  const cover = game.cover
    ? (game.cover.startsWith('//') ? `https:${game.cover}` : game.cover)
    : null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <Confetti />

        {/* CLOSE */}
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        {/* TOP */}
        <div className={styles.top}>
          <div className={styles.diceIcon}>🎲</div>
          <h3 className={styles.topTitle}>¡Tu juego al azar es!</h3>
          <p className={styles.topSub}>Deja que comience tu próxima aventura</p>
        </div>

        {/* BODY */}
        <div className={styles.body}>

          {/* CARÁTULA */}
          <div className={styles.coverSide}>
            <div className={styles.coverGlow} />
            {cover ? (
              <img src={cover} alt={game.title} className={styles.coverImg} />
            ) : (
              <div className={styles.coverPlaceholder}>🎮</div>
            )}
          </div>

          {/* INFO */}
          <div className={styles.infoSide}>
            <h2 className={styles.gameTitle}>
              {game.sagaTitle
                ? <>{game.sagaTitle}:<br /><span className={styles.gameTitleAccent}>{game.title}</span></>
                : <span className={styles.gameTitleAccent}>{game.title}</span>
              }
            </h2>

            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoIcon}><Gamepad2 size={20} /></span>
                <span className={styles.infoKey}>Género</span>
                <span className={styles.infoVal}>{game.genre?.join(', ')}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoIcon}><MonitorCheck size={20} /></span>
                <span className={styles.infoKey}>Plataforma</span>
                <span className={styles.infoVal}>{game.platform?.join(', ')}</span>
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