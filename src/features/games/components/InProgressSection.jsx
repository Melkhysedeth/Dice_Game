import InProgressCard from './InProgressCard'
import styles from './InProgressSection.module.css'

function InProgressSection({ games, onComplete }) {
  if (games.length === 0) return null

  return (
    <section className={styles.section}>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.titleAccent}></span> EN PROGRESO
        </h2>
        <span className={styles.count}>{games.length} / 3</span>
      </div>

      <div className={styles.grid}>
        {games.map(game => (
          <InProgressCard
            key={game.id}
            game={game}
            onComplete={onComplete}
          />
        ))}
      </div>

    </section>
  )
}

export default InProgressSection