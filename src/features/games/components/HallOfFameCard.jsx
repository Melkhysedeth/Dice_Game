import { useState } from 'react'
import styles from './HallOfFameCard.module.css'

function HallOfFameCard({ game, onReturnToLibrary }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!game.sessions || game.sessions.length === 0) return null
  const lastSession = game.sessions[game.sessions.length - 1]

  return (
    <>
      <div className={styles.card} onClick={() => setIsOpen(true)}>
        <div className={styles.statusBar} />
        <div className={styles.cover}>
          <div className={styles.coverPlaceholder}>
            <span className={styles.coverIcon}>🏆</span>
          </div>
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
        <div className={styles.backdrop} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div>
                {game.isSagaEntry && (
                  <span className={styles.modalSagaBadge}>{game.sagaTitle}</span>
                )}
                <h2 className={styles.modalTitle}>{game.title}</h2>
                <p className={styles.modalDeveloper}>{game.developer}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className={styles.sessionInfo}>
              <div className={styles.sessionItem}>
                <span className={styles.sessionLabel}>INICIADO</span>
                <span className={styles.sessionValue}>{lastSession.startDate}</span>
              </div>
              <div className={styles.sessionItem}>
                <span className={styles.sessionLabel}>COMPLETADO</span>
                <span className={styles.sessionValue}>{lastSession.endDate}</span>
              </div>
              <div className={styles.sessionItem}>
                <span className={styles.sessionLabel}>VECES JUGADO</span>
                <span className={styles.sessionValue}>{game.sessions.length}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.returnBtn}
                onClick={() => { onReturnToLibrary(game); setIsOpen(false) }}
              >
                ↩ VOLVER A BIBLIOTECA
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default HallOfFameCard