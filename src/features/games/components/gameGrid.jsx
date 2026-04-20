import GameCard from './GameCard'
import styles from './GameGrid.module.css'

function GameGrid({ games, onStartPlaying }) {
  if (games.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No hay juegos en esta sección</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {games.map(game => (
        <GameCard
          key={game.id}
          game={game}
          onStartPlaying={onStartPlaying}
        />
      ))}
    </div>
  )
}

export default GameGrid