// AddGameModal.jsx — con creación de saga inline
import { useState, useRef, useEffect } from 'react'
import { searchGameCovers } from '../services/igdbService'
import styles from './AddGameModal.module.css'
import { Search } from 'lucide-react'

const GENRES = [
  'Acción', 'Aventura', 'RPG', 'FPS', 'Soulslike', 'Survival Horror',
  'Mundo Abierto', 'Sigilo', 'Plataformas', 'Indie', 'Supervivencia',
  'Multijugador', 'Narrativa', 'Ciencia Ficción', 'Fantasía', 'Bélico',
  'Estrategia', 'Simulador', 'Puzzle', 'Carreras', 'Deportes',
  'Mitología', 'Medieval', 'Mitología China', 'Japón Feudal'
]
const PLATFORMS = ['PC', 'PS4', 'PS5', 'Xbox', 'Switch', 'iOS', 'Android']

// ─── Paso búsqueda ────────────────────────────────────────────────────────────
function StepSearch({ onSelect, onSkip }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true); setSearched(false)
    const data = await searchGameCovers(query)
    setResults(data); setSearching(false); setSearched(true)
  }

  return (
    <div className={styles.stepSearch}>
      <div className={styles.searchHero}>
        <div className={styles.searchHeroIcon}><Search size={30} /></div>
        <h3 className={styles.searchHeroTitle}>Busca el juego en IGDB</h3>
        <p className={styles.searchHeroSub}>Traemos portada, géneros, desarrolladora y año automáticamente</p>
      </div>
      <div className={styles.searchBar}>
        <input ref={inputRef} className={styles.searchInput} type="text"
          placeholder="Ej: The Witcher 3, God of War, Elden Ring..."
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button className={styles.searchBtn} onClick={handleSearch}
          disabled={!query.trim() || searching}>
          {searching ? <span className={styles.spinner} /> : '→'}
        </button>
      </div>
      {searching && (
        <div className={styles.searchLoading}>
          <span className={styles.spinnerLg} /><span>Buscando en IGDB...</span>
        </div>
      )}
      {searched && results.length === 0 && (
        <div className={styles.searchEmpty}>
          <span>😕</span>
          <p>No encontramos resultados para <strong>"{query}"</strong></p>
          <button className={styles.skipBtn} onClick={onSkip}>Agregar manualmente →</button>
        </div>
      )}
      {results.length > 0 && (
        <>
          <p className={styles.searchResultsLabel}>{results.length} resultados — elige el correcto:</p>
          <div className={styles.searchResults}>
            {results.map(game => (
              <div key={game.id} className={styles.searchResultItem} onClick={() => onSelect(game)}>
                <div className={styles.searchResultCover}>
                  {game.cover
                    ? <img src={game.cover.startsWith('//') ? `https:${game.cover}` : game.cover} alt={game.name} />
                    : <div className={styles.searchResultCoverEmpty}>🎮</div>}
                </div>
                <div className={styles.searchResultInfo}>
                  <span className={styles.searchResultName}>{game.name}</span>
                  <div className={styles.searchResultMeta}>
                    {game.year && <span>{game.year}</span>}
                    {game.developer && <><span className={styles.dot}>·</span><span>{game.developer}</span></>}
                  </div>
                  {game.genres?.length > 0 && (
                    <div className={styles.searchResultGenres}>
                      {game.genres.slice(0, 3).map(g => <span key={g} className={styles.searchResultGenre}>{g}</span>)}
                    </div>
                  )}
                </div>
                <span className={styles.searchResultArrow}>→</span>
              </div>
            ))}
          </div>
          <button className={styles.skipBtn} onClick={onSkip}>No encuentro mi juego → Agregar manualmente</button>
        </>
      )}
      {!searched && !searching && (
        <button className={styles.skipBtnSecondary} onClick={onSkip}>Saltar búsqueda y agregar manualmente</button>
      )}
    </div>
  )
}

// ─── Mini formulario crear saga inline ───────────────────────────────────────
function CreateSagaInline({ onCreated, onCancel }) {
  const [sagaTitle, setSagaTitle] = useState('')
  const [sagaDev, setSagaDev] = useState('')
  const [sagaGenres, setSagaGenres] = useState([])
  const [sagaPlatforms, setSagaPlatforms] = useState([])

  function toggleG(g) { setSagaGenres(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]) }
  function toggleP(p) { setSagaPlatforms(p2 => p2.includes(p) ? p2.filter(x => x !== p) : [...p2, p]) }

  function handleCreate() {
    if (!sagaTitle.trim()) return
    onCreated({ title: sagaTitle, developer: sagaDev, genre: sagaGenres, platform: sagaPlatforms })
  }

  return (
    <div className={styles.inlineSagaForm}>
      <div className={styles.inlineSagaHeader}>
        <span className={styles.inlineSagaTitle}>📚 Nueva saga</span>
        <button className={styles.inlineSagaClose} onClick={onCancel}>✕</button>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Nombre de la saga <span className={styles.req}>*</span></label>
        <input className={styles.input} type="text" placeholder="Ej: Resident Evil"
          value={sagaTitle} onChange={e => setSagaTitle(e.target.value)} autoFocus />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Desarrolladora</label>
        <input className={styles.input} type="text" placeholder="Ej: Capcom"
          value={sagaDev} onChange={e => setSagaDev(e.target.value)} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Plataformas</label>
        <div className={styles.tagGroup}>
          {PLATFORMS.map(p => (
            <button key={p}
              className={`${styles.tagBtn} ${sagaPlatforms.includes(p) ? styles.tagActive : ''}`}
              onClick={() => toggleP(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Géneros</label>
        <div className={styles.tagGroup}>
          {GENRES.map(g => (
            <button key={g}
              className={`${styles.tagBtn} ${sagaGenres.includes(g) ? styles.tagActive : ''}`}
              onClick={() => toggleG(g)}>{g}</button>
          ))}
        </div>
      </div>

      <div className={styles.inlineSagaActions}>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancelar</button>
        <button className={styles.submitBtn} onClick={handleCreate}
          disabled={!sagaTitle.trim()}>
          ✓ Crear saga
        </button>
      </div>
    </div>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────
function AddGameModal({
  onClose, onAddSingle, onAddToSaga, onAddNewSaga,
  onUpdateSingle, onUpdateEntry, onUpdateSaga, onAddEmptySaga,
  existingSagas = [], editMode = false, editData = null, defaultSagaId = null
}) {
  const isEditingSingle = editMode && editData?.type === 'single'
  const isEditingEntry = editMode && editData?.type === 'entry'
  const isEditingSaga = editMode && editData?.type === 'saga'

  const [step, setStep] = useState(editMode ? 'form' : 'search')
  const [prefilled, setPrefilled] = useState(null)
  const [isSaga, setIsSaga] = useState(!!defaultSagaId)

  // Lista de sagas dinámica — puede crecer si el usuario crea una inline
  const [localSagas, setLocalSagas] = useState(existingSagas)
  const [selectedSagaId, setSelectedSagaId] = useState(defaultSagaId || '')
  const [showCreateSaga, setShowCreateSaga] = useState(false)

  // Form state
  const [selectedCover, setSelectedCover] = useState(isEditingSingle ? editData.game.cover : null)
  const [title, setTitle] = useState(isEditingSingle ? editData.game.title : isEditingEntry ? editData.entry.title : '')
  const [developer, setDeveloper] = useState(isEditingSingle ? editData.game.developer : isEditingSaga ? editData.saga.developer : '')
  const [year, setYear] = useState(isEditingSingle ? editData.game.year : isEditingEntry ? editData.entry.year : '')
  const [description, setDescription] = useState('')
  const [selectedGenres, setSelectedGenres] = useState(isEditingSingle ? editData.game.genre : isEditingSaga ? editData.saga.genre : [])
  const [selectedPlatforms, setSelectedPlatforms] = useState(isEditingSingle ? editData.game.platform : isEditingSaga ? editData.saga.platform : [])
  const [sagaTitle, setSagaTitle] = useState(isEditingSaga ? editData.saga.title : '')

  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [extraResults, setExtraResults] = useState([])
  const [searchingExtra, setSearchingExtra] = useState(false)

  function handleIGDBSelect(game) {
    const cover = game.cover ? (game.cover.startsWith('//') ? `https:${game.cover}` : game.cover) : null
    setSelectedCover(cover)
    setTitle(game.name || '')
    setDeveloper(game.developer || '')
    setYear(game.year ? String(game.year) : '')
    setDescription(game.summary || '')
    if (game.genres?.length) setSelectedGenres(game.genres)
    if (game.platforms?.length) setSelectedPlatforms(game.platforms)
    setPrefilled(game)
    setStep('form')
  }

  function handleFileUpload(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => setSelectedCover(e.target.result)
    reader.readAsDataURL(file)
  }

  async function searchMoreCovers() {
    if (!title) return
    setSearchingExtra(true)
    const results = await searchGameCovers(title)
    setExtraResults(results)
    setSearchingExtra(false)
  }

  function toggleGenre(g) {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }
  function togglePlatform(p) {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  // Cuando el usuario crea una saga inline
  function handleSagaCreated(sagaData) {
    // Crea la saga vacía y obtiene su id real
    const newId = sagaData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    onAddEmptySaga({ ...sagaData, id: newId })

    // Agrega a la lista local y la selecciona
    const newSaga = { ...sagaData, id: newId, entries: [] }
    setLocalSagas(prev => [...prev, newSaga])
    setSelectedSagaId(newId)
    setShowCreateSaga(false)
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
      onAddSingle({ title, developer, year, genre: selectedGenres, platform: selectedPlatforms, cover: selectedCover, description })
    } else {
      if (!selectedSagaId) return
      onAddToSaga(selectedSagaId, { title, year, cover: selectedCover })
    }
    onClose()
  }

  const modalTitle = isEditingSingle ? 'Editar juego' : isEditingEntry ? 'Editar entrega' : isEditingSaga ? 'Editar saga' : 'Agregar nuevo juego'
  const showCoverSection = !isEditingEntry
  const showDevGenrePlatform = !isEditingEntry && !isSaga
  const showDevGenreSaga = isEditingSingle || isEditingSaga

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.modal} ${step === 'search' ? styles.modalSearch : ''}`}
        onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {step === 'form' && !editMode && (
              <button className={styles.backBtn} onClick={() => setStep('search')}>←</button>
            )}
            <div className={styles.headerIcon}>{step === 'search' ? '🔍' : '🎮'}</div>
            <div>
              <h2 className={styles.headerTitle}>{modalTitle}</h2>
              <p className={styles.headerSub}>
                {step === 'search'
                  ? 'Busca en IGDB para autocompletar'
                  : prefilled
                    ? `Datos cargados: ${prefilled.name} · Puedes editarlos`
                    : 'Completa la información manualmente'}
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Banner IGDB */}
        {step === 'form' && prefilled && (
          <div className={styles.prefilledBanner}>
            <span className={styles.prefilledCheck}>✓</span>
            <span>Datos cargados desde IGDB para <strong>{prefilled.name}</strong></span>
            <button className={styles.prefilledClear} onClick={() => setPrefilled(null)}>✕</button>
          </div>
        )}

        {/* BODY */}
        <div className={styles.body}>
          {step === 'search' ? (
            <StepSearch onSelect={handleIGDBSelect} onSkip={() => { setPrefilled(null); setStep('form') }} />
          ) : (
            <div className={styles.formLayout}>

              {/* COL IZQUIERDA — Carátula */}
              {showCoverSection && (
                <div className={styles.colLeft}>
                  <p className={styles.colLabel}>CARÁTULA</p>
                  {selectedCover ? (
                    <div className={styles.coverPreviewWrapper}>
                      <img src={selectedCover} alt="Carátula" className={styles.coverPreviewImg} />
                      <div className={styles.coverActions}>
                        <button className={styles.coverActionBtn}
                          onClick={() => { setSelectedCover(null); setExtraResults([]) }}>Cambiar</button>
                        <button className={styles.coverActionBtn}
                          onClick={() => fileInputRef.current.click()}>Subir</button>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => handleFileUpload(e.target.files[0])} />
                    </div>
                  ) : (
                    <>
                      <div
                        className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragging(true) }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); handleFileUpload(e.dataTransfer.files[0]) }}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <span className={styles.dropIcon}>☁</span>
                        <p className={styles.dropText}>Arrastra imagen aquí</p>
                        <p className={styles.dropSub}>o haz clic para seleccionar</p>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => handleFileUpload(e.target.files[0])} />
                      </div>
                      <button className={styles.igdbBtn} onClick={searchMoreCovers}
                        disabled={!title || searchingExtra}>
                        {searchingExtra ? '⏳ Buscando...' : '🔍 Buscar más carátulas en IGDB'}
                      </button>
                      {extraResults.length > 0 && (
                        <div className={styles.coverGrid}>
                          {extraResults.map(r => (
                            <div key={r.id} className={styles.coverOption}
                              onClick={() => {
                                const url = r.cover.startsWith('//') ? `https:${r.cover}` : r.cover
                                setSelectedCover(url)
                                if (!developer && r.developer) setDeveloper(r.developer)
                                if (!year && r.year) setYear(String(r.year))
                                if (!selectedGenres.length && r.genres?.length) setSelectedGenres(r.genres)
                                if (!selectedPlatforms.length && r.platforms?.length) setSelectedPlatforms(r.platforms)
                                setExtraResults([])
                              }}>
                              <img src={r.cover.startsWith('//') ? `https:${r.cover}` : r.cover}
                                alt={r.name} className={styles.coverOptionImg} />
                              <span className={styles.coverOptionName}>{r.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* COL DERECHA — Formulario */}
              <div className={styles.colRight}>

                {/* ── SELECTOR SAGA / INDIVIDUAL ── */}
                {!editMode && (
                  <div className={styles.field}>
                    <label className={styles.label}>Tipo de juego</label>
                    <div className={styles.modeSelector}>
                      <button
                        className={`${styles.modeBtn} ${!isSaga ? styles.modeBtnActive : ''}`}
                        onClick={() => { setIsSaga(false); setShowCreateSaga(false) }}
                      >
                        <span className={styles.modeBtnIcon}>🎮</span>
                        <div>
                          <div className={styles.modeBtnTitle}>Juego individual</div>
                          <div className={styles.modeBtnSub}>No pertenece a ninguna saga</div>
                        </div>
                        {!isSaga && <span className={styles.modeBtnCheck}>✓</span>}
                      </button>
                      <button
                        className={`${styles.modeBtn} ${isSaga ? styles.modeBtnActive : ''}`}
                        onClick={() => setIsSaga(true)}
                      >
                        <span className={styles.modeBtnIcon}>📚</span>
                        <div>
                          <div className={styles.modeBtnTitle}>Parte de una saga</div>
                          <div className={styles.modeBtnSub}>Pertenece a una serie de juegos</div>
                        </div>
                        {isSaga && <span className={styles.modeBtnCheck}>✓</span>}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── SELECTOR DE SAGA ── */}
                {!editMode && isSaga && !showCreateSaga && (
                  <div className={styles.field}>
                    <label className={styles.label}>Saga <span className={styles.req}>*</span></label>
                    <div className={styles.sagaSelectRow}>
                      <select
                        className={styles.select}
                        value={selectedSagaId}
                        onChange={e => setSelectedSagaId(e.target.value)}
                      >
                        <option value="">— Elige la saga —</option>
                        {localSagas.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                      <button
                        className={styles.createSagaBtn}
                        onClick={() => setShowCreateSaga(true)}
                        title="Crear nueva saga"
                      >
                        + Nueva
                      </button>
                    </div>
                  </div>
                )}

                {/* ── FORMULARIO CREAR SAGA INLINE ── */}
                {!editMode && isSaga && showCreateSaga && (
                  <CreateSagaInline
                    onCreated={handleSagaCreated}
                    onCancel={() => setShowCreateSaga(false)}
                  />
                )}

                {/* ── CAMPOS DEL JUEGO (solo si no está creando saga) ── */}
                {!showCreateSaga && (
                  <>
                    {isEditingSaga && (
                      <div className={styles.field}>
                        <label className={styles.label}>Nombre de la saga</label>
                        <input className={styles.input} type="text" value={sagaTitle}
                          onChange={e => setSagaTitle(e.target.value)} />
                      </div>
                    )}

                    {!isEditingSaga && (
                      <div className={styles.field}>
                        <label className={styles.label}>
                          {isSaga ? 'Título de la entrega' : 'Nombre del juego'} <span className={styles.req}>*</span>
                        </label>
                        <input className={styles.input} type="text"
                          placeholder="Ej: The Witcher 3: Wild Hunt"
                          value={title} onChange={e => setTitle(e.target.value)} />
                      </div>
                    )}

                    {(showDevGenrePlatform || showDevGenreSaga) && (
                      <div className={styles.field}>
                        <label className={styles.label}>Desarrolladora</label>
                        <input className={styles.input} type="text" placeholder="Ej: CD Projekt Red"
                          value={developer} onChange={e => setDeveloper(e.target.value)} />
                      </div>
                    )}

                    {!isEditingSaga && (
                      <div className={styles.field}>
                        <label className={styles.label}>Año de lanzamiento <span className={styles.req}>*</span></label>
                        <input className={styles.input} type="number" placeholder="Ej: 2024"
                          value={year} onChange={e => setYear(e.target.value)} />
                      </div>
                    )}

                    {!isEditingEntry && !isEditingSaga && !isSaga && (
                      <div className={styles.field}>
                        <label className={styles.label}>Descripción <span className={styles.optional}>opcional</span></label>
                        <textarea className={styles.textarea} rows={3}
                          placeholder="Breve descripción del juego..."
                          value={description} onChange={e => setDescription(e.target.value)} />
                      </div>
                    )}

                    {(showDevGenrePlatform || showDevGenreSaga) && (
                      <div className={styles.field}>
                        <label className={styles.label}>Plataforma</label>
                        <div className={styles.tagGroup}>
                          {PLATFORMS.map(p => (
                            <button key={p}
                              className={`${styles.tagBtn} ${selectedPlatforms.includes(p) ? styles.tagActive : ''}`}
                              onClick={() => togglePlatform(p)}>{p}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(showDevGenrePlatform || showDevGenreSaga) && (
                      <div className={styles.field}>
                        <label className={styles.label}>Géneros</label>
                        <div className={styles.tagGroup}>
                          {GENRES.map(g => (
                            <button key={g}
                              className={`${styles.tagBtn} ${selectedGenres.includes(g) ? styles.tagActive : ''}`}
                              onClick={() => toggleGenre(g)}>{g}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {step === 'form' && !showCreateSaga && (
          <div className={styles.footer}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              {editMode ? '✓ Guardar cambios' : '+ Agregar juego'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddGameModal