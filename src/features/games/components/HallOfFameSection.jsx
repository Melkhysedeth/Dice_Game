import HallOfFameCard from './HallOfFameCard'
import styles from './HallOfFameSection.module.css'

function HallOfFameSection({ games, onReturnToLibrary }) {
  if (games.length === 0) return null

  return (
    <section className={styles.section}>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span>🏆</span> SALÓN DE LA FAMA
        </h2>
        <span className={styles.count}>{games.length} completados</span>
      </div>

      <div className={styles.grid}>
        {games.map(game => (
          <HallOfFameCard
            key={game.id}
            game={game}
            onReturnToLibrary={onReturnToLibrary}
          />
        ))}
      </div>

    </section>
  )
}

export default HallOfFameSection