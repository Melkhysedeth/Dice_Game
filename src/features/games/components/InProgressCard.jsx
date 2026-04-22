import styles from './InProgressCard.module.css'

function InProgressCard({ game, onComplete }) {
  const session = game.sessions[game.sessions.length - 1]

  function getDaysPlaying() {
    const start = new Date(session.startDate)
    const today = new Date()
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    return diff === 0 ? 'Hoy' : `${diff} días`
  }

  return (
    <div className={styles.card}>

      <div className={styles.statusBar} />

      <div className={styles.cover}>
        <div className={styles.coverPlaceholder}>
          <span className={styles.coverIcon}>🎮</span>
        </div>
      </div>

      <div className={styles.content}>

        <div className={styles.header}>
          <span className={styles.statusBadge}>EN PROGRESO</span>
          {game.isSagaEntry && (
            <span className={styles.sagaBadge}>{game.sagaTitle}</span>
          )}
        </div>

        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.developer}>{game.developer}</p>

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

        <button
          className={styles.completeBtn}
          onClick={() => onComplete(game)}
        >
          ✓ MARCAR COMO COMPLETADO
        </button>

      </div>

    </div>
  )
}

export default InProgressCard