import { useEffect, useState } from 'react'
import styles from './SuggestedGameModal.module.css'

const QUOTES = [
  { text: "Un héroe no nace, se forja en la batalla.", author: "Desconocido" },
  { text: "La aventura te espera, solo necesitas dar el primer paso.", author: "Desconocido" },
  { text: "Todo gran viaje comienza con una sola decisión.", author: "Desconocido" },
  { text: "El destino favorece a los valientes.", author: "Proverbio" },
  { text: "No hay gloria sin sacrificio.", author: "Desconocido" },
]

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => i)
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
                <span className={styles.infoIcon}>🎮</span>
                <span className={styles.infoKey}>Género</span>
                <span className={styles.infoVal}>{game.genre?.join(', ')}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoIcon}>💾</span>
                <span className={styles.infoKey}>Plataforma</span>
                <span className={styles.infoVal}>{game.platform?.join(', ')}</span>
              </div>
              {game.developer && (
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}>🏢</span>
                  <span className={styles.infoKey}>Desarrollador</span>
                  <span className={styles.infoVal}>{game.developer}</span>
                </div>
              )}
              {game.year && (
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}>📅</span>
                  <span className={styles.infoKey}>Año</span>
                  <span className={styles.infoVal}>{game.year}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoIcon}>⭕</span>
                <span className={styles.infoKey}>Estado</span>
                <span className={styles.infoValBadge}>
                  <span className={styles.badgeDot} /> Pendiente
                </span>
              </div>
            </div>

            {/* QUOTE */}
            <div className={styles.quote}>
              <span className={styles.quoteIcon}>"</span>
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