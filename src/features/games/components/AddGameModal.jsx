import { useState, useRef } from 'react'
import { searchGameCovers } from '../services/igdbService'
import styles from './AddGameModal.module.css'

const GENRES = ['Acción', 'Aventura', 'RPG', 'FPS', 'Soulslike', 'Survival Horror',
  'Mundo Abierto', 'Sigilo', 'Plataformas', 'Indie', 'Supervivencia',
  'Multijugador', 'Narrativa', 'Ciencia Ficción', 'Fantasía', 'Bélico']

const PLATFORMS = ['PC', 'PS4', 'PS5', 'Xbox', 'Switch', 'iOS', 'Android']

function AddGameModal({
  onClose, onAddSingle, onAddToSaga, onAddNewSaga,
  onUpdateSingle, onUpdateEntry, onUpdateSaga,
  existingSagas, editMode = false, editData = null
}) {
  const isEditingSingle = editMode && editData?.type === 'single'
  const isEditingEntry  = editMode && editData?.type === 'entry'
  const isEditingSaga   = editMode && editData?.type === 'saga'

  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [isSaga, setIsSaga] = useState(false)
  const [sagaOption, setSagaOption] = useState('existing')
  const [coverResults, setCoverResults] = useState([])
  const [selectedCover, setSelectedCover] = useState(
    isEditingSingle ? editData.game.cover : null
  )
  const [searching, setSearching] = useState(false)
  const [title, setTitle] = useState(
    isEditingSingle ? editData.game.title :
    isEditingEntry  ? editData.entry.title :
    isEditingSaga   ? '' : ''
  )
  const [developer, setDeveloper] = useState(
    isEditingSingle ? editData.game.developer :
    isEditingSaga   ? editData.saga.developer : ''
  )
  const [year, setYear] = useState(
    isEditingSingle ? editData.game.year :
    isEditingEntry  ? editData.entry.year :
    isEditingSaga   ? '' : ''
  )
  const [selectedGenres, setSelectedGenres] = useState(
    isEditingSingle ? editData.game.genre :
    isEditingSaga   ? editData.saga.genre : []
  )
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    isEditingSingle ? editData.game.platform :
    isEditingSaga   ? editData.saga.platform : []
  )
  const [selectedSagaId, setSelectedSagaId] = useState('')
  const [newSagaTitle, setNewSagaTitle] = useState('')
  const [sagaTitle, setSagaTitle] = useState(
    isEditingSaga ? editData.saga.title : ''
  )

  function toggleGenre(g) {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }
  function togglePlatform(p) {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleSearchCover() {
    if (!title) return
    setSearching(true)
    const results = await searchGameCovers(title)
    setCoverResults(results)
    setSearching(false)
  }

  function handleFileUpload(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => setSelectedCover(e.target.result)
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileUpload(file)
  }

  function handleSubmit() {
    if (isEditingSingle) {
      onUpdateSingle(editData.game.id, { title, developer, year, genre: selectedGenres, platform: selectedPlatforms, cover: selectedCover })
      onClose(); return
    }
    if (isEditingEntry) {
      onUpdateEntry(editData.sagaId, editData.entry.id, { title, year })
      onClose(); return
    }
    if (isEditingSaga) {
      onUpdateSaga(editData.saga.id, { title: sagaTitle, developer, genre: selectedGenres, platform: selectedPlatforms })
      onClose(); return
    }
    if (!title || !year) return
    if (!isSaga) {
      onAddSingle({ title, developer, year, genre: selectedGenres, platform: selectedPlatforms, cover: selectedCover })
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

  const modalTitle = isEditingSingle ? 'Editar juego' :
    isEditingEntry ? 'Editar entrega' :
    isEditingSaga  ? 'Editar saga'   : 'Agregar nuevo juego'

  const showCoverSection = (!isSaga || sagaOption === 'new') && !isEditingEntry
  const showDevGenrePlatform = (!isSaga || sagaOption === 'new' || isEditingSingle || isEditingSaga) && !isEditingEntry

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* ── HEADER ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>+</div>
            <div>
              <h2 className={styles.headerTitle}>{modalTitle}</h2>
              <p className={styles.headerSub}>Completa la información de tu juego</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── BODY DOS COLUMNAS ── */}
        <div className={styles.body}>

          {/* COLUMNA IZQUIERDA — imagen */}
          {showCoverSection && (
            <div className={styles.colLeft}>
              <p className={styles.colLabel}>IMAGEN DEL JUEGO</p>

              {selectedCover ? (
                <div className={styles.coverPreviewWrapper}>
                  <img src={
                    selectedCover.startsWith('//')
                      ? `https:${selectedCover}`
                      : selectedCover
                  } alt="Carátula" className={styles.coverPreviewImg} />
                  <button
                    className={styles.changeCoverBtn}
                    onClick={() => { setSelectedCover(null); setCoverResults([]) }}
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <span className={styles.dropIcon}>☁</span>
                    <p className={styles.dropText}>Arrastra una imagen aquí</p>
                    <p className={styles.dropSub}>o haz clic para seleccionar</p>
                    <p className={styles.dropHint}>PNG, JPG o WEBP (máx. 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleFileUpload(e.target.files[0])}
                    />
                  </div>

                  <div className={styles.igdbSection}>
                    <button
                      className={styles.igdbBtn}
                      onClick={handleSearchCover}
                      disabled={!title || searching}
                    >
                      {searching ? '⏳ Buscando...' : '🔍 Buscar en IGDB'}
                    </button>
                  </div>

                  {coverResults.length > 0 && (
                    <div className={styles.coverGrid}>
                      {coverResults.map(result => (
                        <div
                          key={result.id}
                          className={styles.coverOption}
                          onClick={() => { setSelectedCover(result.cover); setCoverResults([]) }}
                        >
                          <img
                            src={`https:${result.cover}`}
                            alt={result.name}
                            className={styles.coverOptionImg}
                          />
                          <span className={styles.coverOptionName}>{result.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* COLUMNA DERECHA — formulario */}
          <div className={styles.colRight}>

            {/* Tipo */}
            {!editMode && (
              <div className={styles.field}>
                <label className={styles.label}>Tipo de juego</label>
                <div className={styles.toggleGroup}>
                  <button
                    className={`${styles.toggleBtn} ${!isSaga ? styles.toggleActive : ''}`}
                    onClick={() => setIsSaga(false)}
                  >Individual</button>
                  <button
                    className={`${styles.toggleBtn} ${isSaga ? styles.toggleActive : ''}`}
                    onClick={() => setIsSaga(true)}
                  >Saga</button>
                </div>
              </div>
            )}

            {/* Saga existente o nueva */}
            {!editMode && isSaga && (
              <div className={styles.field}>
                <label className={styles.label}>¿Saga existente o nueva?</label>
                <div className={styles.toggleGroup}>
                  <button
                    className={`${styles.toggleBtn} ${sagaOption === 'existing' ? styles.toggleActive : ''}`}
                    onClick={() => setSagaOption('existing')}
                  >Existente</button>
                  <button
                    className={`${styles.toggleBtn} ${sagaOption === 'new' ? styles.toggleActive : ''}`}
                    onClick={() => setSagaOption('new')}
                  >Nueva saga</button>
                </div>
              </div>
            )}

            {!editMode && isSaga && sagaOption === 'existing' && (
              <div className={styles.field}>
                <label className={styles.label}>Selecciona la saga</label>
                <select className={styles.select} value={selectedSagaId} onChange={e => setSelectedSagaId(e.target.value)}>
                  <option value="">-- Elige una saga --</option>
                  {existingSagas.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}

            {!editMode && isSaga && sagaOption === 'new' && (
              <div className={styles.field}>
                <label className={styles.label}>Nombre de la saga</label>
                <input className={styles.input} type="text" placeholder="Ej: Resident Evil"
                  value={newSagaTitle} onChange={e => setNewSagaTitle(e.target.value)} />
              </div>
            )}

            {isEditingSaga && (
              <div className={styles.field}>
                <label className={styles.label}>Nombre de la saga</label>
                <input className={styles.input} type="text" value={sagaTitle}
                  onChange={e => setSagaTitle(e.target.value)} />
              </div>
            )}

            {/* Título */}
            {!isEditingSaga && (
              <div className={styles.field}>
                <label className={styles.label}>
                  {isSaga ? 'Título de la entrega' : 'Nombre del juego'} <span className={styles.required}>*</span>
                </label>
                <input className={styles.input} type="text"
                  placeholder="Ej. The Witcher 3: Wild Hunt"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>
            )}

            {/* Desarrolladora */}
            {showDevGenrePlatform && (
              <div className={styles.field}>
                <label className={styles.label}>Desarrollador</label>
                <input className={styles.input} type="text"
                  placeholder="Ej. CD Projekt Red"
                  value={developer} onChange={e => setDeveloper(e.target.value)} />
              </div>
            )}

            {/* Año */}
            {!isEditingSaga && (
              <div className={styles.field}>
                <label className={styles.label}>Año de lanzamiento</label>
                <input className={styles.input} type="number"
                  placeholder="Ej. 2024"
                  value={year} onChange={e => setYear(e.target.value)} />
              </div>
            )}

            {/* Plataformas */}
            {showDevGenrePlatform && (
              <div className={styles.field}>
                <label className={styles.label}>Plataforma</label>
                <div className={styles.tagGroup}>
                  {PLATFORMS.map(p => (
                    <button key={p}
                      className={`${styles.tagBtn} ${selectedPlatforms.includes(p) ? styles.tagActive : ''}`}
                      onClick={() => togglePlatform(p)}
                    >{p}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Géneros */}
            {showDevGenrePlatform && (
              <div className={styles.field}>
                <label className={styles.label}>Géneros</label>
                <div className={styles.tagGroup}>
                  {GENRES.map(g => (
                    <button key={g}
                      className={`${styles.tagBtn} ${selectedGenres.includes(g) ? styles.tagActive : ''}`}
                      onClick={() => toggleGenre(g)}
                    >{g}</button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            <span>🎮</span>
            {editMode ? 'Guardar cambios' : 'Agregar juego'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddGameModal