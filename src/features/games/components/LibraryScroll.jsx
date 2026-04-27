import { useRef } from 'react'
import styles from './LibraryScroll.module.css'

function LibraryScroll({ games, sagas }) {
  const trackRef = useRef(null)

  function scrollRight() {
    trackRef.current.scrollBy({ left: 340, behavior: 'smooth' })
  }
  function scrollLeft() {
    trackRef.current.scrollBy({ left: -340, behavior: 'smooth' })
  }

  // Aplanamos sagas y singles en una sola lista de carátulas
  const items = [
    ...sagas.map(saga => ({
      id: saga.id,
      title: saga.name,
      cover: saga.cover,
      isSaga: true,
      count: saga.entries?.length ?? 0,
    })),
    ...games.map(game => ({
      id: game.id,
      title: game.title,
      cover: game.cover,
      isSaga: false,
    })),
  ]

  if (items.length === 0) return (
    <div className={styles.empty}>Sin juegos en biblioteca</div>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollWrapper} ref={trackRef}>
        <div className={styles.track}>
          {items.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cover}>
                {item.cover ? (
                  <img
                    src={item.cover.startsWith('//') ? `https:${item.cover}` : item.cover}
                    alt={item.title}
                    className={styles.coverImg}
                  />
                ) : (
                  <div className={styles.coverPlaceholder}>
                    <span>{item.isSaga ? '📚' : '🎮'}</span>
                  </div>
                )}
                <div className={styles.overlay} />
                <div className={styles.badge}>
                  {item.isSaga
                    ? `${item.count} entregas`
                    : '● Pendiente'
                  }
                </div>
              </div>
              <p className={styles.title}>{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      {items.length > 4 && (
        <>
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={scrollLeft}>‹</button>
          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={scrollRight}>›</button>
        </>
      )}
    </div>
  )
}

export default LibraryScroll