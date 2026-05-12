import { useEffect, useState } from 'react'
import styles from './SuggestedGameModal.module.css'
import { Gamepad2, MonitorCheck, Building2, Calendar, CircleDashed, Quote } from 'lucide-react'

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

  const explosions = [
    { left: '50%', top: '5%', delay: 0 }, // fija centro arriba
    ...Array.from({ length: 3 }, (_, i) => ({
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      delay: (i + 1) * 0.4,
    }))
  ]

  return (
    <div className={styles.confettiWrapper}>
      {explosions.map((exp, ei) =>
        Array.from({ length: 40 }, (_, i) => {
          const angle = (i / 40) * 360
          const distance = 120 + Math.random() * 200
          const x = Math.cos((angle * Math.PI) / 180) * distance
          const y = Math.sin((angle * Math.PI) / 180) * distance
          return (
            <div
              key={`${ei}-${i}`}
              className={styles.confettiPiece}
              style={{
                '--x': `${x}px`,
                '--y': `${y}px`,
                left: exp.left,
                top: exp.top,
                animationDelay: `${exp.delay + Math.random() * 0.3}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`,
                background: colors[(ei * 40 + i) % colors.length],
                width: Math.random() > 0.5 ? '10px' : '6px',
                height: Math.random() > 0.5 ? '16px' : '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          )
        })
      )}
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