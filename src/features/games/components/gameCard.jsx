import styles from './GameCard.module.css'

function GameCard({ game, onStartPlaying, onEdit, onDelete }) {
  return (

    <div className={styles.card}>

      {/* Carátula */}
      <div className={styles.cover}>
        <div className={styles.coverPlaceholder}>
          <span className={styles.coverIcon}>🎮</span>
        </div>
      </div>

      {/* Contenido */}
      <div className={styles.content}>

        <div className={styles.header}>
          <span className={styles.year}>{game.year}</span>
          {game.isSagaEntry && (
            <span className={styles.sagaBadge}>{game.sagaTitle}</span>
          )}
        </div>

        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.developer}>{game.developer}</p>

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

      </div>

      {/* Hover overlay */}
      <div className={styles.overlay}>
        <div className={styles.overlayActions}>
          <button
            className={styles.playBtn}
            onClick={(e) => { e.stopPropagation(); onStartPlaying(game) }}
          >
            ▶ COMENZAR
          </button>
          <div className={styles.secondaryActions}>
            <button
              className={styles.editBtn}
              onClick={(e) => { e.stopPropagation(); onEdit(game) }}
            >
              ✎ EDITAR
            </button>
            <button
              className={styles.deleteBtn}
              onClick={(e) => { e.stopPropagation(); onDelete(game) }}
            >
              ✕ ELIMINAR
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default GameCard