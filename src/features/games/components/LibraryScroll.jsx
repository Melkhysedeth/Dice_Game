import { useRef, useState, useEffect } from 'react'
import GameModal from './GameModal'
import styles from './LibraryScroll.module.css'

// Rota las carátulas de las entries de una saga
function SagaCover({ saga, className }) {
  const covers = (saga.entries ?? [])
    .map(e => e.cover ? (e.cover.startsWith('//') ? `https:${e.cover}` : e.cover) : null)
    .filter(Boolean)

  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    if (covers.length <= 1) return
    const id = setInterval(() => {
      setFade(false)
      setTimeout(() => { setIdx(p => (p + 1) % covers.length); setFade(true) }, 300)
    }, 2500)
    return () => clearInterval(id)
  }, [covers.length])

  if (covers.length === 0) return (
    <div className={styles.coverPlaceholder}><span>📚</span></div>
  )

  return (
    <img
      src={covers[idx]}
      alt={saga.title}
      className={className}
      style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease' }}
    />
  )
}

function LibraryScroll({ games, sagas, onStartPlaying, onRandomGame, onOpenSaga }) {
  const trackRef = useRef(null)

  // Estado del modal / sagaview
  const [selectedGame, setSelectedGame] = useState(null) // juego individual
 
  function scrollRight() { trackRef.current.scrollBy({ left: 340, behavior: 'smooth' }) }
  function scrollLeft() { trackRef.current.scrollBy({ left: -340, behavior: 'smooth' }) }

  function fixCover(url) {
    if (!url) return null
    return url.startsWith('//') ? `https:${url}` : url
  }

  const sagaItems = sagas.map(s => ({ ...s, _type: 'saga' }))
  const gameItems = games.map(g => ({ ...g, _type: 'game' }))
  const items = [...sagaItems, ...gameItems]

  if (items.length === 0) return (
    <div className={styles.empty}>Sin juegos en biblioteca</div>
  )

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.scrollOuter}>
          <div className={styles.scrollWrapper} ref={trackRef}>
            <div className={styles.track}>
              {items.map(item => (
                <div
                  key={item.id}
                  className={styles.card}
                  onClick={() => {
                    if (item._type === 'saga') onOpenSaga(item)
                    else setSelectedGame(item)
                  }}
                >
                  <div className={styles.cover}>
                    {item._type === 'saga' ? (
                      <SagaCover saga={item} className={styles.coverImg} />
                    ) : fixCover(item.cover) ? (
                      <img
                        src={fixCover(item.cover)}
                        alt={item.title}
                        className={styles.coverImg}
                      />
                    ) : (
                      <div className={styles.coverPlaceholder}><span>🎮</span></div>
                    )}
                    <div className={styles.overlay} />
                    <div className={styles.badge}>
                      {item._type === 'saga'
                        ? `📚 ${item.entries?.length ?? 0} entregas`
                        : '● Pendiente'}
                    </div>
                  </div>
                  <p className={styles.title}>{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {items.length > 4 && (
          <>
            <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={scrollLeft}>‹</button>
            <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={scrollRight}>›</button>
          </>
        )}
      </div>

      {/* Modal juego individual */}
      {selectedGame && (
        <GameModal
          game={selectedGame}
          mode="library"
          onClose={() => setSelectedGame(null)}
          onAction={(action) => {
            if (action === 'start') {
              onStartPlaying(selectedGame)
              setSelectedGame(null)
            }
          }}
        />
      )}

    </>
  )
}

export default LibraryScroll