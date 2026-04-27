import { useState } from 'react'
import styles from './InProgressCard.module.css'

function InProgressCard({ game, onComplete }) {
  const [isOpen, setIsOpen] = useState(false)
  const session = game.sessions[game.sessions.length - 1]

  const progress = game.progress ?? Math.floor(Math.random() * 80 + 10)

  function getDaysPlaying() {
    const start = new Date(session.startDate)
    const today = new Date()
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    return diff === 0 ? 'Hoy' : `${diff} días`
  }

  return (
    <>
      <div className={styles.card} onClick={() => setIsOpen(true)}>

        {/* CARÁTULA */}
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
          <div className={styles.overlay}>
            <span className={styles.overlayHint}>VER DETALLES</span>
          </div>
        </div>

        {/* INFO DEBAJO */}
        <div className={styles.info}>
          <p className={styles.title}>{game.title}</p>
          {game.sagaTitle && (
            <p className={styles.saga}>{game.sagaTitle}</p>
          )}
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressPct}>{progress}%</span>
          </div>
        </div>

      </div>

      {/* MODAL */}
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
                <span className={styles.sessionValue}>{session.startDate}</span>
              </div>
              <div className={styles.sessionItem}>
                <span className={styles.sessionLabel}>TIEMPO</span>
                <span className={styles.sessionValue}>{getDaysPlaying()}</span>
              </div>
              <div className={styles.sessionItem}>
                <span className={styles.sessionLabel}>PARTIDA</span>
                <span className={styles.sessionValue}>
                  {session.isFirstTime ? 'Primera vez' : 'Rejugando'}
                </span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.completeBtn}
                onClick={() => { onComplete(game); setIsOpen(false) }}
              >
                ✓ MARCAR COMO COMPLETADO
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default InProgressCard