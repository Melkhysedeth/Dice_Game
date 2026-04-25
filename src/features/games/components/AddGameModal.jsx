import { useState } from 'react'
import styles from './AddGameModal.module.css'

const GENRES = ['Acción', 'Aventura', 'RPG', 'FPS', 'Soulslike', 'Survival_Horror',
  'Mundo Abierto', 'Sigilo', 'Plataformas', 'Indie', 'Supervivencia',
  'Multijugador', 'Narrativa', 'Ciencia Ficción', 'Fantasía', 'Bélico']

const PLATFORMS = ['PC', 'PS4', 'PS5', 'Xbox', 'Switch', 'iOS', 'Android']

function AddGameModal({
  onClose,
  onAddSingle, onAddToSaga, onAddNewSaga,
  onUpdateSingle, onUpdateEntry, onUpdateSaga,
  existingSagas,
  editMode = false,
  editData = null
}) {
  const isEditingSingle = editMode && editData?.type === 'single'
  const isEditingEntry = editMode && editData?.type === 'entry'
  const isEditingSaga = editMode && editData?.type === 'saga'

  const [isSaga, setIsSaga] = useState(editMode ? false : false)
  const [sagaOption, setSagaOption] = useState('existing')

  const [title, setTitle] = useState(
    isEditingSingle ? editData.game.title :
    isEditingEntry ? editData.entry.title :
    isEditingSaga ? '' : ''
  )
  const [developer, setDeveloper] = useState(
    isEditingSingle ? editData.game.developer :
    isEditingSaga ? editData.saga.developer : ''
  )
  const [year, setYear] = useState(
    isEditingSingle ? editData.game.year :
    isEditingEntry ? editData.entry.year :
    isEditingSaga ? '' : ''
  )
  const [selectedGenres, setSelectedGenres] = useState(
    isEditingSingle ? editData.game.genre :
    isEditingSaga ? editData.saga.genre : []
  )
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    isEditingSingle ? editData.game.platform :
    isEditingSaga ? editData.saga.platform : []
  )
  const [selectedSagaId, setSelectedSagaId] = useState('')
  const [newSagaTitle, setNewSagaTitle] = useState('')
  const [sagaTitle, setSagaTitle] = useState(
    isEditingSaga ? editData.saga.title : ''
  )

  function toggleGenre(genre) {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  function togglePlatform(platform) {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    )
  }

  function handleSubmit() {
    // Modo edición
    if (isEditingSingle) {
      onUpdateSingle(editData.game.id, {
        title, developer, year,
        genre: selectedGenres,
        platform: selectedPlatforms
      })
      onClose()
      return
    }

    if (isEditingEntry) {
      onUpdateEntry(editData.sagaId, editData.entry.id, { title, year })
      onClose()
      return
    }

    if (isEditingSaga) {
      onUpdateSaga(editData.saga.id, {
        title: sagaTitle, developer,
        genre: selectedGenres,
        platform: selectedPlatforms
      })
      onClose()
      return
    }

    // Modo agregar
    if (!title || !year) return

    if (!isSaga) {
      onAddSingle({ title, developer, year, genre: selectedGenres, platform: selectedPlatforms })
    } else if (sagaOption === 'existing') {
      if (!selectedSagaId) return
      onAddToSaga(selectedSagaId, { title, year })
    } else {
      if (!newSagaTitle || !developer) return
      onAddNewSaga(
        { title: newSagaTitle, developer, genre: selectedGenres, platform: selectedPlatforms },
        { title, year }
      )
    }
    onClose()
  }

  // Título del modal según modo
  const modalTitle = isEditingSingle ? 'Editar juego' :
                     isEditingEntry ? 'Editar entrega' :
                     isEditingSaga ? 'Editar saga' : 'Nuevo título'

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div>
            <span className={styles.eyebrow}>
              {editMode ? '// EDITAR' : '// AGREGAR JUEGO'}
            </span>
            <h2 className={styles.title}>{modalTitle}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>

          {/* Modo agregar — ¿es saga? */}
          {!editMode && (
            <div className={styles.field}>
              <label className={styles.label}>¿Es parte de una saga?</label>
              <div className={styles.toggleGroup}>
                <button
                  className={`${styles.toggleBtn} ${!isSaga ? styles.toggleActive : ''}`}
                  onClick={() => setIsSaga(false)}
                >
                  No, es individual
                </button>
                <button
                  className={`${styles.toggleBtn} ${isSaga ? styles.toggleActive : ''}`}
                  onClick={() => setIsSaga(true)}
                >
                  Sí, es una saga
                </button>
              </div>
            </div>
          )}

          {/* Si es saga — ¿existente o nueva? */}
          {!editMode && isSaga && (
            <div className={styles.field}>
              <label className={styles.label}>¿Saga existente o nueva?</label>
              <div className={styles.toggleGroup}>
                <button
                  className={`${styles.toggleBtn} ${sagaOption === 'existing' ? styles.toggleActive : ''}`}
                  onClick={() => setSagaOption('existing')}
                >
                  Saga existente
                </button>
                <button
                  className={`${styles.toggleBtn} ${sagaOption === 'new' ? styles.toggleActive : ''}`}
                  onClick={() => setSagaOption('new')}
                >
                  Saga nueva
                </button>
              </div>
            </div>
          )}

          {/* Seleccionar saga existente */}
          {!editMode && isSaga && sagaOption === 'existing' && (
            <div className={styles.field}>
              <label className={styles.label}>Selecciona la saga</label>
              <select
                className={styles.select}
                value={selectedSagaId}
                onChange={e => setSelectedSagaId(e.target.value)}
              >
                <option value="">-- Elige una saga --</option>
                {existingSagas.map(saga => (
                  <option key={saga.id} value={saga.id}>{saga.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Nombre de saga nueva */}
          {!editMode && isSaga && sagaOption === 'new' && (
            <div className={styles.field}>
              <label className={styles.label}>Nombre de la saga</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Ej: Resident Evil"
                value={newSagaTitle}
                onChange={e => setNewSagaTitle(e.target.value)}
              />
            </div>
          )}

          {/* Título de saga en modo edición */}
          {isEditingSaga && (
            <div className={styles.field}>
              <label className={styles.label}>Nombre de la saga</label>
              <input
                className={styles.input}
                type="text"
                value={sagaTitle}
                onChange={e => setSagaTitle(e.target.value)}
              />
            </div>
          )}

          {/* Título del juego — no mostrar si solo edita saga */}
          {!isEditingSaga && (
            <div className={styles.field}>
              <label className={styles.label}>
                {isSaga ? 'Título de la entrega' : 'Título del juego'}
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="Ej: God of War Ragnarök"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          )}

          {/* Developer */}
          {(!isSaga || sagaOption === 'new' || isEditingSingle || isEditingSaga) && !isEditingEntry && (
            <div className={styles.field}>
              <label className={styles.label}>Desarrolladora</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Ej: Santa Monica Studio"
                value={developer}
                onChange={e => setDeveloper(e.target.value)}
              />
            </div>
          )}

          {/* Año */}
          {!isEditingSaga && (
            <div className={styles.field}>
              <label className={styles.label}>Año de lanzamiento</label>
              <input
                className={styles.input}
                type="number"
                placeholder="Ej: 2024"
                value={year}
                onChange={e => setYear(e.target.value)}
              />
            </div>
          )}

          {/* Géneros */}
          {(!isSaga || sagaOption === 'new' || isEditingSingle || isEditingSaga) && !isEditingEntry && (
            <div className={styles.field}>
              <label className={styles.label}>Géneros</label>
              <div className={styles.tagGrid}>
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    className={`${styles.tagBtn} ${selectedGenres.includes(genre) ? styles.tagActive : ''}`}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plataformas */}
          {(!isSaga || sagaOption === 'new' || isEditingSingle || isEditingSaga) && !isEditingEntry && (
            <div className={styles.field}>
              <label className={styles.label}>Plataformas</label>
              <div className={styles.tagGrid}>
                {PLATFORMS.map(platform => (
                  <button
                    key={platform}
                    className={`${styles.tagBtn} ${selectedPlatforms.includes(platform) ? styles.tagActive : ''}`}
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button className={styles.submitBtn} onClick={handleSubmit}>
            {editMode ? '✓ GUARDAR CAMBIOS' : '+ AGREGAR A LA BIBLIOTECA'}
          </button>

        </div>
      </div>
    </div>
  )
}

export default AddGameModal