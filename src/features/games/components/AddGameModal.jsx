// AddGameModal.jsx — con creación de saga inline
import { useState, useRef, useEffect } from 'react'
import { searchGameCovers } from '../services/igdbService'
import { detectProgressMode } from '../services/hltbService'
import styles from './AddGameModal.module.css'
import { Search } from 'lucide-react'

const GENRES = [
  'Acción', 'Aventura', 'RPG', 'FPS', 'Soulslike', 'Terror',
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

  return (
    <div className={styles.inlineSagaForm}>
      <div className={styles.inlineSagaHeader}>
        <span className={styles.inlineSagaTitle}>📚 Nueva saga</span>
        <button className={styles.inlineSagaClose} onClick={onCancel}>✕</button>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Nombre de la saga <span className={styles.req}>*</span></label>
        <input className={styles.input} type="text" placeholder="Ej: Resident Evil"
          value={sagaTitle} onChange={e => setSagaTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sagaTitle.trim() && onCreated({ title: sagaTitle })}
          autoFocus />
      </div>

      <div className={styles.inlineSagaActions}>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancelar</button>
        <button className={styles.submitBtn} onClick={() => onCreated({ title: sagaTitle })}
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
  onUpdateSingle, onUpdateEntry, onUpdateSaga, onAddEmptySaga, onMoveToSaga, onSuccess,
  existingSagas = [], editMode = false, editData = null, defaultSagaId = null
}) {

  const isEditingSingle = editMode && editData?.type === 'single'
  const isEditingEntry = editMode && editData?.type === 'entry'
  const isEditingSaga = editMode && editData?.type === 'saga'

  const [step, setStep] = useState(editMode ? 'form' : 'search')
  const [prefilled, setPrefilled] = useState(null)
  const [isSaga, setIsSaga] = useState(!!defaultSagaId)

  const [hltbStatus, setHltbStatus] = useState(null)

  const isFromIGDB = isEditingSingle
    ? !!editData?.game?.igdbId
    : isEditingEntry
      ? !!editData?.entry?.igdbId
      : !!prefilled?.id


  const [selectedTags, setSelectedTags] = useState(
    isEditingSingle
      ? (editData.game.tags ?? editData.game.genres ?? [])
      : isEditingSaga
        ? (editData.saga.tags ?? editData.saga.genres ?? [])
        : []
  )

  const [selectedGameModes, setSelectedGameModes] = useState(
    isEditingSingle ? (editData.game.gameModes ?? []) : []
  )

  // Lista de sagas dinámica — puede crecer si el usuario crea una inline
  const [localSagas, setLocalSagas] = useState(existingSagas)
  const [selectedSagaId, setSelectedSagaId] = useState(defaultSagaId || '')
  const [showCreateSaga, setShowCreateSaga] = useState(false)

  // Form state
  const [selectedCover, setSelectedCover] = useState(isEditingSingle ? editData.game.cover : null)
  const [title, setTitle] = useState(isEditingSingle ? editData.game.title : isEditingEntry ? editData.entry.title : '')
  const [developer, setDeveloper] = useState(isEditingSingle ? editData.game.developer : isEditingSaga ? editData.saga.developer : '')
  const [year, setYear] = useState(isEditingSingle ? editData.game.year : isEditingEntry ? editData.entry.year : '')
  const [description, setDescription] = useState(() => {
    return editData?.game?.description ?? editData?.game?.summary ?? ''
  })
  const [selectedGenres, setSelectedGenres] = useState(
    isEditingSingle
      ? (editData.game.genre ?? editData.game.genres ?? [])
      : isEditingSaga
        ? (editData.saga.genre ?? editData.saga.genres ?? [])
        : []
  )
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    isEditingSingle
      ? (editData.game.platform ?? editData.game.platforms ?? [])
      : isEditingSaga
        ? (editData.saga.platform ?? editData.saga.platforms ?? [])
        : []
  )
  const [sagaTitle, setSagaTitle] = useState(isEditingSaga ? editData.saga.title : '')

  const fileInputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [extraResults, setExtraResults] = useState([])
  const [searchingExtra, setSearchingExtra] = useState(false)

  // Tags disponibles: los que vienen del juego IGDB o el array estático como fallback
  const availableTags = prefilled?.tags?.length ? prefilled.tags : GENRES
  const availableGameModes = prefilled?.gameModes ?? []

  const [hltbManual, setHltbManual] = useState({ hltb_main: '', hltb_main_extra: '', hltb_completionist: '' })

  function handleIGDBSelect(game) {
    const cover = game.cover ? (game.cover.startsWith('//') ? `https:${game.cover}` : game.cover) : null
    setSelectedCover(cover)
    setTitle(game.name || '')
    setDeveloper(game.developer || '')
    setYear(game.year ? String(game.year) : '')
    setDescription(game.summary || '')
    if (game.genres?.length) setSelectedGenres(game.genres)
    if (game.platforms?.length) setSelectedPlatforms(game.platforms)
    if (game.tags?.length) setSelectedTags(game.tags)
    if (game.gameModes?.length) setSelectedGameModes(game.gameModes)

    const progress_mode = detectProgressMode({
      genres: game.genres ?? [],
      game_modes: game.gameModes ?? [],
    })
    setPrefilled({ ...game, progress_mode })
    setStep('form')

    console.log('time_to_beat:', game.time_to_beat)
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
  async function handleSagaCreated(sagaData) {
    setShowCreateSaga(false)
    const newId = await onAddEmptySaga(sagaData)  // usa el slug real del hook
    if (!newId) return
    const newSaga = { ...sagaData, id: newId, entries: [] }
    setLocalSagas(prev => [...prev, newSaga])
    setSelectedSagaId(newId)
  }

  function handleSubmit() {
    if (isEditingSingle) {
      if (editData.game.isSagaEntry && editData.game.sagaId) {
        onUpdateEntry(editData.game.sagaId, editData.game.id, {
          title, developer, year,
          genre: selectedGenres,
          platform: selectedPlatforms,
          cover: selectedCover,
          description,
          summary: description
        })
      } else {
        onUpdateSingle(editData.game.id, {
          title, developer, year,
          genre: selectedGenres,
          platform: selectedPlatforms,
          cover: selectedCover,
          description,
          summary: description
        })
      }
      onSuccess?.('Información del juego actualizada')
      onClose(); return
    }
    if (isEditingEntry) {
      onUpdateEntry(editData.sagaId, editData.entry.id, {
        title,
        developer,
        year,
        genre: selectedGenres,
        platform: selectedPlatforms,
        cover: selectedCover,
        description,
        summary: description
      })
      onClose(); return
    }
    if (isEditingSaga) {
      onUpdateSaga(editData.saga.id, { title: sagaTitle, developer, genre: selectedGenres, platform: selectedPlatforms })
      onClose(); return
    }
    if (!title || !year) return
    if (!isSaga) {
      onAddSingle({
        title, developer, year,
        genre: selectedTags,
        tags: selectedTags,
        gameModes: selectedGameModes,
        platform: selectedPlatforms,
        cover: selectedCover,
        description,
        igdbId: prefilled?.id || null,
        summary: prefilled?.summary || '',
        screenshots: prefilled?.screenshots || [],
        // ── NUEVO ──
        hltb_main: prefilled?.time_to_beat?.hastily ?? (hltbManual.hltb_main ? parseInt(hltbManual.hltb_main) : null),
        hltb_main_extra: prefilled?.time_to_beat?.normally ?? (hltbManual.hltb_main_extra ? parseInt(hltbManual.hltb_main_extra) : null),
        hltb_completionist: prefilled?.time_to_beat?.completely ?? (hltbManual.hltb_completionist ? parseInt(hltbManual.hltb_completionist) : null),
        hltb_source: prefilled?.time_to_beat ? 'igdb' : (hltbManual.hltb_main ? 'manual' : null),
        progress_mode: prefilled?.progress_mode ?? 'linear',
      })
    } else {
      if (!selectedSagaId) return
      onAddToSaga(selectedSagaId, {
        title,
        year,
        cover: selectedCover,
        developer,
        summary: prefilled?.summary || '',
        screenshots: prefilled?.screenshots || [],
        genres: selectedGenres,
        platforms: selectedPlatforms,
        rating: prefilled?.rating || null,
        igdbId: prefilled?.id || null,
        // ── NUEVO ──
        hltb_main: prefilled?.time_to_beat?.normally ?? (hltbManual.hltb_main ? parseInt(hltbManual.hltb_main) : null),
        hltb_main_extra: prefilled?.time_to_beat?.completely ?? (hltbManual.hltb_main_extra ? parseInt(hltbManual.hltb_main_extra) : null),
        hltb_completionist: prefilled?.time_to_beat?.hastily ?? (hltbManual.hltb_completionist ? parseInt(hltbManual.hltb_completionist) : null),
        hltb_source: prefilled?.time_to_beat ? 'igdb' : (hltbManual.hltb_main ? 'manual' : null),
        progress_mode: prefilled?.progress_mode ?? 'linear',
      })
    }
    onClose()
  }

  const modalTitle = isEditingSingle ? 'Editar juego' : isEditingEntry ? 'Editar entrega' : isEditingSaga ? 'Editar saga' : 'Agregar nuevo juego'
  const showCoverSection = !isEditingEntry
  const showDevGenrePlatform = !isEditingEntry && !isSaga
  const showDevGenreSaga = isEditingSingle || isEditingSaga || isSaga

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

                      {/* Buscar más carátulas incluso con cover seleccionada */}
                      <button className={styles.igdbBtn} onClick={searchMoreCovers}
                        disabled={!title || searchingExtra} style={{ marginTop: '10px' }}>
                        {searchingExtra ? '⏳ Buscando...' : '🔍 Buscar más carátulas en IGDB'}
                      </button>
                      {extraResults.length > 0 && (
                        <div className={styles.coverGrid}>
                          {extraResults.map(r => (
                            <div key={r.id} className={styles.coverOption}
                              onClick={() => {
                                const url = r.cover.startsWith('//') ? `https:${r.cover}` : r.cover
                                setSelectedCover(url)
                                setExtraResults([])
                              }}>
                              <img src={r.cover.startsWith('//') ? `https:${r.cover}` : r.cover}
                                alt={r.name} className={styles.coverOptionImg} />
                              <span className={styles.coverOptionName}>{r.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // ... bloque sin cover igual que antes
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
                    onCreated={async (sagaData) => await handleSagaCreated(sagaData)}
                    onCancel={() => setShowCreateSaga(false)}
                  />
                )}

                {/* ── CAMPOS DEL JUEGO (solo si no está creando saga) ── */}
                {!showCreateSaga && (
                  <>

                    {/* Aviso IGDB */}
                    {isFromIGDB && (
                      <div style={{
                        background: 'rgba(124,58,237,0.1)',
                        border: '1px solid rgba(124,58,237,0.3)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        color: '#a78bfa',
                        marginBottom: '16px'
                      }}>
                        🔒 Los datos de este juego vienen de IGDB y no pueden editarse.
                      </div>
                    )}

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
                        <input
                          className={styles.input} type="text"
                          placeholder="Ej: The Witcher 3: Wild Hunt"
                          value={title}
                          onChange={e => !isFromIGDB && setTitle(e.target.value)}
                          readOnly={isFromIGDB}
                          style={{ opacity: isFromIGDB ? 0.6 : 1, cursor: isFromIGDB ? 'not-allowed' : 'text' }}
                        />
                      </div>
                    )}

                    {(showDevGenrePlatform || showDevGenreSaga) && (
                      <div className={styles.field}>
                        <label className={styles.label}>Desarrolladora</label>
                        <input
                          className={styles.input} type="text"
                          placeholder="Ej: CD Projekt Red"
                          value={developer}
                          onChange={e => !isFromIGDB && setDeveloper(e.target.value)}
                          readOnly={isFromIGDB}
                          style={{ opacity: isFromIGDB ? 0.6 : 1, cursor: isFromIGDB ? 'not-allowed' : 'text' }}
                        />
                      </div>
                    )}

                    {!isEditingSaga && (
                      <div className={styles.field}>
                        <label className={styles.label}>Año de lanzamiento <span className={styles.req}>*</span></label>
                        <input
                          className={styles.input} type="number"
                          placeholder="Ej: 2024"
                          value={year}
                          onChange={e => !isFromIGDB && setYear(e.target.value)}
                          readOnly={isFromIGDB}
                          style={{ opacity: isFromIGDB ? 0.6 : 1, cursor: isFromIGDB ? 'not-allowed' : 'text' }}
                        />
                      </div>
                    )}

                    {!isEditingEntry && !isEditingSaga && !isSaga && (
                      <div className={styles.field}>
                        <label className={styles.label}>
                          Descripción <span className={styles.optional}>opcional</span>
                        </label>
                        <textarea
                          className={styles.textarea} rows={3}
                          placeholder="Breve descripción del juego..."
                          value={description}
                          onChange={e => !isFromIGDB && setDescription(e.target.value)}
                          readOnly={isFromIGDB}
                          style={{ opacity: isFromIGDB ? 0.6 : 1, cursor: isFromIGDB ? 'not-allowed' : 'text', resize: isFromIGDB ? 'none' : 'vertical' }}
                        />
                      </div>
                    )}

                    {/* ── Duración estimada ── */}
                    {!isEditingEntry && !isEditingSaga && !isSaga && (
                      <div className={styles.field}>
                        <label className={styles.label}>
                          Duración estimada <span className={styles.optional}>opcional</span>
                        </label>

                        {/* Si IGDB trajo los datos, mostrar prellenado */}
                        {prefilled?.time_to_beat ? (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                              { label: 'Historia: ', val: prefilled.time_to_beat.hastily, key: 'hltb_main' },
                              { label: 'Extras: ', val: prefilled.time_to_beat.normally, key: 'hltb_main_extra' },
                              { label: '100%: ', val: prefilled.time_to_beat.completely, key: 'hltb_completionist' },
                            ].map(({ label, val, key }) => val ? (
                              <div key={key} style={{
                                padding: '6px 12px', borderRadius: '8px',
                                border: '0.5px solid var(--border)',
                                background: 'var(--surface)',
                                fontSize: '12px', color: 'var(--text-dim)'
                              }}>
                                {label} <strong style={{ color: 'var(--text)' }}>~{val}h</strong>
                              </div>
                            ) : null)}
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', alignSelf: 'center' }}>
                              Datos de IGDB
                            </div>
                          </div>
                        ) : (
                          /* Si no hay datos, campos manuales */
                          <div className={styles.hltbPrompt}>
                            <div className={styles.hltbPromptHeader}>
                              <span style={{ fontSize: '16px' }}>⏱</span>
                              <div>
                                <p className={styles.hltbPromptTitle}>¿Cuánto dura este juego?</p>
                                <p className={styles.hltbPromptSub}>
                                  Añadir la duración te ayuda a planificar tu biblioteca.{' '}
                                  <a href={`https://howlongtobeat.com/?q=${encodeURIComponent(title)}`}
                                    target="_blank" rel="noreferrer"
                                    className={styles.hltbPromptLink}>
                                    Consultar en HowLongToBeat →
                                  </a>
                                </p>
                              </div>
                            </div>
                            <div className={styles.hltbPromptFields}>
                              {[
                                { label: 'Historia principal (h)', key: 'hltb_main' },
                                { label: 'Historia + extras (h)', key: 'hltb_main_extra' },
                                { label: 'Completionista (h)', key: 'hltb_completionist' },
                              ].map(({ label, key }) => (
                                <div key={key} style={{ flex: 1 }}>
                                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                                    {label}
                                  </label>
                                  <input
                                    className={styles.input}
                                    type="number" min="0" placeholder="ej: 50"
                                    value={hltbManual[key] ?? ''}
                                    onChange={e => setHltbManual(prev => ({ ...prev, [key]: e.target.value }))}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(showDevGenrePlatform || showDevGenreSaga) && (
                      <div className={styles.field}>
                        <label className={styles.label}>Plataforma</label>
                        <div className={styles.tagGroup}>
                          {PLATFORMS.map(p => (
                            <button key={p}
                              className={`${styles.tagBtn} ${selectedPlatforms.includes(p) ? styles.tagActive : ''}`}
                              onClick={() => !isFromIGDB && togglePlatform(p)}
                              disabled={isFromIGDB}
                              style={{ opacity: isFromIGDB ? 0.5 : 1, cursor: isFromIGDB ? 'not-allowed' : 'pointer' }}
                            >{p}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(showDevGenrePlatform || showDevGenreSaga) && (
                      <div className={styles.field}>
                        <label className={styles.label}>Géneros y temas</label>
                        {availableTags.length > 0 ? (
                          <div className={styles.tagGroup}>
                            {availableTags.map(g => (
                              <button key={g}
                                className={`${styles.tagBtn} ${selectedTags.includes(g) ? styles.tagActive : ''}`}
                                onClick={() => !isFromIGDB && setSelectedTags(prev =>
                                  prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
                                )}
                                disabled={isFromIGDB}
                                style={{ opacity: isFromIGDB ? 0.5 : 1, cursor: isFromIGDB ? 'not-allowed' : 'pointer' }}
                              >{g}</button>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                            Busca el juego en IGDB para cargar géneros automáticamente.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Modos de juego — solo si vienen de IGDB */}
                    {availableGameModes.length > 0 && (
                      <div className={styles.field}>
                        <label className={styles.label}>Modos de juego</label>
                        <div className={styles.tagGroup}>
                          {availableGameModes.map(m => (
                            <button key={m}
                              className={`${styles.tagBtn} ${selectedGameModes.includes(m) ? styles.tagActive : ''}`}
                              onClick={() => !isFromIGDB && setSelectedGameModes(prev =>
                                prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                              )}
                              disabled={isFromIGDB}
                              style={{ opacity: isFromIGDB ? 0.5 : 1, cursor: isFromIGDB ? 'not-allowed' : 'pointer' }}
                            >{m}</button>
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

        {isEditingSingle && !editData?.game?.isSagaEntry && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '8px', marginBottom: '16px' }}>
            <label className={styles.label}>Mover a una saga</label>
            <div className={styles.sagaSelectRow} style={{ marginTop: '10px' }}>
              <select
                className={styles.select}
                defaultValue=""
                onChange={async (e) => {
                  if (!e.target.value) return
                  await onMoveToSaga?.(editData.game.id, e.target.value)
                  onSuccess?.('Juego movido a la saga')
                  onClose()
                }}
              >
                <option value="">— Elige una saga —</option>
                {existingSagas.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}

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