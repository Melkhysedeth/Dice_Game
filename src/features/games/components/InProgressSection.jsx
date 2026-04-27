import { useRef } from 'react'
import InProgressCard from './InProgressCard'
import styles from './InProgressSection.module.css'

function InProgressSection({ games, onComplete }) {
  const trackRef = useRef(null)

  function scrollLeft() {
    trackRef.current.scrollBy({ left: -340, behavior: 'smooth' })
  }

  function scrollRight() {
    trackRef.current.scrollBy({ left: 340, behavior: 'smooth' })
  }

  if (games.length === 0) return (
    <div className={styles.empty}>
      <span>No hay juegos en progreso</span>
    </div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollWrapper} ref={trackRef}>
        <div className={styles.track}>
          {games.map(game => (
            <InProgressCard
              key={game.id}
              game={game}
              onComplete={onComplete}
            />
          ))}
        </div>
      </div>

      {games.length > 3 && (
        <>
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={scrollLeft}>‹</button>
          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={scrollRight}>›</button>
        </>
      )}
    </div>
  )
}

export default InProgressSection