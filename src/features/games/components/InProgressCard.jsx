import { useState } from 'react'
import styles from './InProgressCard.module.css'
import GameView from '../views/GameView'
import { createPortal } from 'react-dom'

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
      <div className={styles.card} onClick={() => { setIsOpen(true)}}>

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

      {isOpen && createPortal(
        <GameView
          game={{
            ...game,
            genres: game.genre ?? [],
            cover: game.cover?.startsWith('//') ? `https:${game.cover}` : game.cover,
            startDate: game.sessions?.at(-1)?.startDate ?? '—',
            lastSession: (() => {
              const d = game.sessions?.at(-1)?.startDate
              if (!d) return '—'
              const diff = Math.floor((new Date() - new Date(d)) / 86400000)
              if (diff === 0) return 'Hoy'
              if (diff === 1) return 'Ayer'
              return `Hace ${diff} días`
            })(),
            progress: game.progress ?? 50,
          }}
          mode="in_progress"
          onClose={() => setIsOpen(false)}
          onAction={(action) => {
            if (action === 'complete') { onComplete(game); setIsOpen(false) }
            setIsOpen(false)
          }}
        />,
        document.body
      )}
    </>
  )
}

export default InProgressCard