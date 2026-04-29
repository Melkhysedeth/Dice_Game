import { useState } from 'react'
import styles from './GameCard.module.css'

function GameCard({ game, onStartPlaying, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={styles.card} onClick={() => setIsOpen(true)}>
        <div className={styles.cover}>
          {game.cover ? (
            <img
              src={game.cover.startsWith('//') ? `https:${game.cover}` : game.cover}
              alt={game.title}
              className={styles.coverImg}
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <span className={styles.coverIcon}>🎮</span>
            </div>
          )}
          <div className={styles.hoverHint}>
            <span>VER JUEGO</span>
          </div>
        </div>

        {/* colocar arriba de cada single la palabra "Single game" */}
        <div className={styles.content}>
          {game.isSagaEntry ? (
            <span className={styles.sagaBadge}>{game.sagaTitle}</span>
          ) : (
            <span className={styles.singleBadge}> </span>
          )}
          <h3 className={styles.title}>{game.title}</h3>
        </div>
      </div>

      {isOpen && (
        <GameModal
          game={game}
          mode="library"
          onClose={() => setIsOpen(false)}
          onAction={(action) => {
            if (action === 'start') onStartPlaying(game)
            if (action === 'favorite') { /* futuro */ }
            setIsOpen(false)
          }}
        />
      )}
    </>
  )
}

export default GameCard