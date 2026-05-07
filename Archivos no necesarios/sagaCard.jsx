import { useState, useEffect } from 'react'
import styles from './SagaCard.module.css'
import { searchGameCovers } from '../services/igdbService'

function EntryCard({ entry, saga, onStartPlaying, onEditEntry, onDeleteEntry, onSearchCover, searchingCover, onClose }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={styles.entryCard} onClick={() => setIsOpen(true)}>
        <div className={styles.entryCover}>
          {entry.cover ? (
            <img
              src={entry.cover.startsWith('//') ? `https:${entry.cover}` : entry.cover}
              alt={entry.title}
              className={styles.entryCoverImg}
            />
          ) : (
            <div className={styles.entryCoverPlaceholder}>🎮</div>
          )}
          <button
            className={styles.entrySearchCoverBtn}
            onClick={(e) => { e.stopPropagation(); onSearchCover(entry.id, entry.title) }}
          >
            {searchingCover ? '...' : '🖼'}
          </button>
          <div className={styles.entryHoverHint}>
            <span>VER</span>
          </div>
        </div>
        <div className={styles.entryContent}>
          {/* <span className={`${styles.entryStatus} ${styles[entry.status]}`}>
            {entry.status === 'library' && 'BIBLIOTECA'}
            {entry.status === 'in_progress' && 'EN PROGRESO'}
            {entry.status === 'completed' && 'COMPLETADO'}
          </span> */}
          <p className={styles.entryTitle}>{entry.title}</p>
          <p className={styles.entryYear}>{entry.year}</p>
        </div>
      </div>

      {isOpen && (
        <div className={styles.entryBackdrop} onClick={() => setIsOpen(false)}>
          <div className={styles.entryModal} onClick={e => e.stopPropagation()}>
            <div className={styles.entryModalHeader}>
              <div>
                <span className={styles.entryModalSaga}>{saga.title}</span>
                <h3 className={styles.entryModalTitle}>{entry.title}</h3>
                <p className={styles.entryModalYear}>{saga.developer} — {entry.year}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className={styles.entryModalStatus}>
              <span className={`${styles.entryStatus} ${styles[entry.status]}`}>
                {entry.status === 'library' && 'EN BIBLIOTECA'}
                {entry.status === 'in_progress' && 'EN PROGRESO'}
                {entry.status === 'completed' && 'COMPLETADO'}
              </span>
            </div>

            <div className={styles.entryModalActions}>
              {entry.status === 'library' && (
                <button
                  className={styles.entryPlayBtn}
                  onClick={() => {
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
                    onClose()
                  }}
                >
                  ▶ COMENZAR A JUGAR
                </button>
              )}
              <div className={styles.entrySecondary}>
                <button
                  className={styles.entryEditBtn}
                  onClick={() => { onEditEntry(saga.id, entry); setIsOpen(false); onClose() }}
                >✎ EDITAR</button>
                <button
                  className={styles.entryDeleteBtn}
                  onClick={() => { onDeleteEntry(saga.id, entry.id); setIsOpen(false) }}
                >✕ ELIMINAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SagaCard({ saga, onStartPlaying, onEditSaga, onDeleteSaga, onEditEntry, onDeleteEntry, onUpdateSagaCover, onUpdateEntryCover }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchingCover, setSearchingCover] = useState(false)
  const [searchingEntryCover, setSearchingEntryCover] = useState(null)
  const [coverResults, setCoverResults] = useState([])
  const [coverTarget, setCoverTarget] = useState(null)
  const [coverIndex, setCoverIndex] = useState(0)

  const entriesWithCover = saga.entries.filter(e => e.cover)

  useEffect(() => {
    if (entriesWithCover.length <= 1) return
    const interval = setInterval(() => {
      setCoverIndex(prev => (prev + 1) % entriesWithCover.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [entriesWithCover.length])

  async function handleSearchCover(target, searchName) {
    setCoverTarget(target)
    if (target === 'saga') setSearchingCover(true)
    else setSearchingEntryCover(target)

    const results = await searchGameCovers(searchName)
    setCoverResults(results)

    if (target === 'saga') setSearchingCover(false)
    else setSearchingEntryCover(null)
  }

  function handleSelectCover(coverUrl) {
    if (coverTarget === 'saga') {
      onUpdateSagaCover(saga.id, coverUrl)
    } else {
      onUpdateEntryCover(saga.id, coverTarget, coverUrl)
    }
    setCoverResults([])
    setCoverTarget(null)
  }

  return (
    <>
      <div className={styles.card} onClick={() => setIsOpen(true)}>
        <div className={styles.cover}>
          {entriesWithCover.length > 0 ? (
            <img
              src={entriesWithCover[coverIndex].cover.startsWith('//')
                ? `https:${entriesWithCover[coverIndex].cover}`
                : entriesWithCover[coverIndex].cover}
              alt={saga.title}
              className={styles.coverImg}
              style={{ transition: 'opacity 0.5s ease' }}
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <span className={styles.coverIcon}>⬡</span>
            </div>
          )}
          <div className={styles.entriesCount}>
            {saga.entries.length} entregas
          </div>
          <div className={styles.hoverHint}>
            <span>VER SAGA</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className={styles.backdrop} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalSagaCover}>
                  {entriesWithCover.length > 0 ? (
                    <img
                      src={entriesWithCover[0].cover.startsWith('//')
                        ? `https:${entriesWithCover[0].cover}`
                        : entriesWithCover[0].cover}
                      alt={saga.title}
                      className={styles.modalSagaCoverImg}
                    />
                  ) : (
                    <div className={styles.modalSagaCoverPlaceholder}>⬡</div>
                  )}
                </div>
                <div>
                  <span className={styles.modalSagaLabel}>SAGA</span>
                  <h2 className={styles.modalTitle}>{saga.title}</h2>
                  <p className={styles.modalDeveloper}>{saga.developer}</p>
                  <div className={styles.modalGenres}>
                    {saga.genre.map(g => (
                      <span key={g} className={styles.genreTag}>{g}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
            </div>

            {coverResults.length > 0 && (
              <div className={styles.coverSearchResults}>
                <p className={styles.coverSearchLabel}>Elige una carátula:</p>
                <div className={styles.coverGrid}>
                  {coverResults.map(result => (
                    <div
                      key={result.id}
                      className={styles.coverOption}
                      onClick={() => handleSelectCover(result.cover)}
                    >
                      <img
                        src={`https:${result.cover}`}
                        alt={result.name}
                        className={styles.coverOptionImg}
                      />
                      <span className={styles.coverOptionName}>{result.name}</span>
                    </div>
                  ))}
                  <button
                    className={styles.cancelCoverBtn}
                    onClick={() => setCoverResults([])}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className={styles.entriesGrid}>
              {saga.entries.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  saga={saga}
                  onStartPlaying={onStartPlaying}
                  onEditEntry={onEditEntry}
                  onDeleteEntry={onDeleteEntry}
                  onSearchCover={(id, name) => handleSearchCover(id, name)}
                  searchingCover={searchingEntryCover === entry.id}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.editSagaBtn}
                onClick={() => { onEditSaga(saga); setIsOpen(false) }}
              >✎ EDITAR SAGA</button>
              <button
                className={styles.deleteSagaBtn}
                onClick={() => { onDeleteSaga(saga.id); setIsOpen(false) }}
              >✕ ELIMINAR SAGA</button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default SagaCard