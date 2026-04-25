import { useState } from 'react'
import styles from './GameCard.module.css'

function GameCard({ game, onStartPlaying, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={styles.card} onClick={() => setIsOpen(true)}>
        <div className={styles.cover}>
          <div className={styles.coverPlaceholder}>
            <span className={styles.coverIcon}>🎮</span>
          </div>
          <div className={styles.hoverHint}>
            <span>VER JUEGO</span>
          </div>
        </div>
        
        {/* El badge de "SAGA" se muestra solo si el juego es parte de una saga, mientras que el badge "SINGLE" se muestra para juegos independientes. Si un juego es parte de una saga, no tendrá el badge "SINGLE". */} 
        <div className={styles.content}>
          <span className={styles.singleBadge}></span>
          {game.isSagaEntry && (
            <span className={styles.sagaBadge}>{game.sagaTitle}</span>
          )}
          <h3 className={styles.title}>{game.title}</h3>
        </div>
      </div>

      {isOpen && (
        <div className={styles.backdrop} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div>
                {game.isSagaEntry && (
                  <span className={styles.modalSagaBadge}>{game.sagaTitle}</span>
                )}
                <h2 className={styles.modalTitle}>{game.title}</h2>
                <p className={styles.modalDeveloper}>{game.developer} — {game.year}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className={styles.modalGenres}>
              {game.genre.map(g => (
                <span key={g} className={styles.genreTag}>{g}</span>
              ))}
            </div>

            <div className={styles.modalPlatforms}>
              {game.platform.map(p => (
                <span key={p} className={styles.platform}>{p}</span>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.playBtn}
                onClick={() => { onStartPlaying(game); setIsOpen(false) }}
              >
                ▶ COMENZAR A JUGAR
              </button>
              <button
                className={styles.editBtn}
                onClick={() => { onEdit(game); setIsOpen(false) }}
              >
                ✎ EDITAR
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => { onDelete(game); setIsOpen(false) }}
              >
                ✕ ELIMINAR
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default GameCard