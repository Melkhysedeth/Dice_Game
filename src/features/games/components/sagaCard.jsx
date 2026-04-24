import { useState } from 'react'
import styles from './SagaCard.module.css'

function SagaCard({ saga, onStartPlaying, onEditSaga, onDeleteSaga, onEditEntry, onDeleteEntry }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={styles.card} onClick={() => setIsOpen(true)}>
        <div className={styles.cover}>
          <div className={styles.coverPlaceholder}>
            <span className={styles.coverIcon}>⬡</span>
          </div>
          <div className={styles.entriesCount}>
            {saga.entries.length} entregas
          </div>
          <div className={styles.hoverHint}>
            <span>VER SAGA</span>
          </div>
        </div>
        <div className={styles.content}>
          <span className={styles.sagaLabel}>SAGA</span>
          <h3 className={styles.title}>{saga.title}</h3>
        </div>
      </div>

      {isOpen && (
        <div className={styles.backdrop} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalSagaLabel}>SAGA</span>
                <h2 className={styles.modalTitle}>{saga.title}</h2>
                <p className={styles.modalDeveloper}>{saga.developer}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className={styles.modalGenres}>
              {saga.genre.map(g => (
                <span key={g} className={styles.genreTag}>{g}</span>
              ))}
            </div>

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
                          setIsOpen(false)
                        }}
                      >
                        ▶ JUGAR
                      </button>
                    )}
                    <button
                      className={styles.entryEditBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditEntry(saga.id, entry)
                        setIsOpen(false)
                      }}
                    >✎</button>
                    <button
                      className={styles.entryDeleteBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteEntry(saga.id, entry.id)
                      }}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.editSagaBtn}
                onClick={() => { onEditSaga(saga); setIsOpen(false) }}
              >
                ✎ EDITAR SAGA
              </button>
              <button
                className={styles.deleteSagaBtn}
                onClick={() => { onDeleteSaga(saga.id); setIsOpen(false) }}
              >
                ✕ ELIMINAR SAGA
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default SagaCard