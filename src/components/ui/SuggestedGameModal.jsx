import styles from './SuggestedGameModal.module.css'

function SuggestedGameModal({ game, onConfirm, onDismiss, onClose }) {
  if (!game) return null

  return (
    <div className={styles.backdrop} onClick={onDismiss}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.eyebrow}>
          // JUEGO SUGERIDO
        </div>

        <h2 className={styles.title}>{game.title}</h2>

        {game.sagaTitle && (
          <p className={styles.saga}>{game.sagaTitle}</p>
        )}

        <p className={styles.developer}>
          {game.developer} — {game.year}
        </p>

        <div className={styles.genres}>
          {game.genre.map(g => (
            <span key={g} className={styles.genreTag}>{g}</span>
          ))}
        </div>

        <div className={styles.platforms}>
          {game.platform.map(p => (
            <span key={p} className={styles.platform}>{p}</span>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.dismissBtn} onClick={onDismiss}>
            🎲 TIRAR DE NUEVO
          </button>
          <button className={styles.confirmBtn} onClick={() => onConfirm(game)}>
            ▶ COMENZAR A JUGAR
          </button>
        </div>

      </div>
    </div>
  )
}

export default SuggestedGameModal