import { useState } from 'react'
import styles from './HallOfFameCard.module.css'
import GameModal from './GameModal'

function HallOfFameCard({ game, onReturnToLibrary }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!game.sessions || game.sessions.length === 0) return null
  const lastSession = game.sessions[game.sessions.length - 1]

  return (
    <>
      <div className={styles.card} onClick={() => setIsOpen(true)}>
        <div className={styles.statusBar} />
        <div className={styles.cover}>
          {game.cover ? (
            <img
              src={game.cover.startsWith('//') ? `https:${game.cover}` : game.cover}
              alt={game.title}
              className={styles.coverImg}
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <span className={styles.coverIcon}>🏆</span>
            </div>
          )}
          <div className={styles.hoverHint}>
            <span>VER DETALLES</span>
          </div>
        </div>
        <div className={styles.content}>
          <span className={styles.statusBadge}>COMPLETADO</span>
          <h3 className={styles.title}>{game.title}</h3>
        </div>
      </div>

      {isOpen && (
        <GameModal
          game={game}
          mode="hall_of_fame"
          onClose={() => setIsOpen(false)}
          onAction={(action) => {
            if (action === 'replay') { onReturnToLibrary(game); setIsOpen(false) }
            setIsOpen(false)
          }}
        />
      )}
    </>
  )
}

export default HallOfFameCard