import styles from './HallOfFameCard.module.css'

function HallOfFameCard({ game, onReturnToLibrary }) {
  if (!game.sessions || game.sessions.length === 0) return null
    const lastSession = game.sessions[game.sessions.length - 1]

  return (
    <div className={styles.card}>

      <div className={styles.statusBar} />

      <div className={styles.cover}>
        <div className={styles.coverPlaceholder}>
          <span className={styles.coverIcon}>🏆</span>
        </div>
      </div>

      <div className={styles.content}>

        <div className={styles.header}>
          <span className={styles.statusBadge}>COMPLETADO</span>
          {game.isSagaEntry && (
            <span className={styles.sagaBadge}>{game.sagaTitle}</span>
          )}
        </div>

        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.developer}>{game.developer}</p>

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

        <button
          className={styles.returnBtn}
          onClick={() => onReturnToLibrary(game)}
        >
          ↩ VOLVER A BIBLIOTECA
        </button>

      </div>

    </div>
  )
}

export default HallOfFameCard