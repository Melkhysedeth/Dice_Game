import { useState } from 'react'
import styles from './SagaCard.module.css'

function SagaCard({ saga, onStartPlaying }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleOpen() {
    setIsOpen(true)
  }

  function handleClose() {
    setIsOpen(false)
  }

  return (
    <>
      {/* Tarjeta normal */}
      <div
        className={styles.card}
        onClick={handleOpen}
      >
        {/* Carátula placeholder */}
        <div className={styles.cover}>
          <div className={styles.coverPlaceholder}>
            <span className={styles.coverIcon}>⬡</span>
          </div>
          <div className={styles.coverOverlay}>
            <span className={styles.entriesCount}>
              {saga.entries.length} entregas
            </span>
          </div>
        </div>

        {/* Info */}
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.sagaLabel}>SAGA</span>
          </div>
          <h3 className={styles.title}>{saga.title}</h3>
          <p className={styles.developer}>{saga.developer}</p>
          <div className={styles.genres}>
            {saga.genre.map(g => (
              <span key={g} className={styles.genreTag}>{g}</span>
            ))}
          </div>
        </div>

        {/* Hover hint */}
        <div className={styles.hoverHint}>
          <span>VER SAGA</span>
        </div>
      </div>

      {/* Modal expandido */}
      {isOpen && (
        <div className={styles.backdrop} onClick={handleClose}>
          <div
            className={styles.modal}
            onClick={e => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalSagaLabel}>SAGA</span>
                <h2 className={styles.modalTitle}>{saga.title}</h2>
                <p className={styles.modalDeveloper}>{saga.developer}</p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={handleClose}
              >
                ✕
              </button>
            </div>

            {/* Géneros */}
            <div className={styles.modalGenres}>
              {saga.genre.map(g => (
                <span key={g} className={styles.genreTag}>{g}</span>
              ))}
            </div>

            {/* Lista de entregas */}
            <div className={styles.entries}>
              {saga.entries.map(entry => (
                <div key={entry.id} className={styles.entry}>
                  <div className={styles.entryInfo}>
                    <span className={styles.entryDot} />
                    <div>
                      <p className={styles.entryTitle}>{entry.title}</p>
                      <p className={styles.entryYear}>{entry.year}</p>
                    </div>
                  </div>
                  <div className={styles.entryRight}>
                    <span className={`${styles.entryStatus} ${styles[entry.status]}`}>
                      {entry.status === 'library' && 'EN BIBLIOTECA'}
                      {entry.status === 'in_progress' && 'EN PROGRESO'}
                      {entry.status === 'completed' && 'COMPLETADO'}
                    </span>
                    {entry.status === 'library' && (
                      <button
                        className={styles.entryPlayBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          onStartPlaying({
                            ...entry,
                            developer: saga.developer,
                            genre: saga.genre,
                            platform: saga.platform,
                            sagaId: saga.id,
                            sagaTitle: saga.title,
                            isSagaEntry: true
                          })
                          handleClose()
                        }}
                      >
                        ▶ JUGAR
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default SagaCard