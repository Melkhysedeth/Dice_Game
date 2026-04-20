import GameCard from './GameCard'
import SagaCard from './SagaCard'
import styles from './GameGrid.module.css'

function GameGrid({ games, sagas, onStartPlaying }) {
  const isEmpty = games.length === 0 && sagas.length === 0

  if (isEmpty) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No hay juegos en esta sección</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {sagas.map(saga => (
        <SagaCard
          key={saga.id}
          saga={saga}
          onStartPlaying={onStartPlaying}
        />
      ))}
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