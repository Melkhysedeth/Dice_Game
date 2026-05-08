import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCover } from '../../../utils/gameUtils'
import AddGameModal from '../components/AddGameModal'
import styles from './LibraryView.module.css'
import GameView from './GameView'
import SagaView from './SagaView'
import AppSidebar from '../../../components/layout/AppSidebar'
import { LibraryBigIcon } from 'lucide-react'

function LibraryView({
  games, sagas, onStartPlaying, onEdit, onDelete,
  onEditSaga, onDeleteSaga, onEditEntry, onDeleteEntry,
  onUpdateSagaCover, onUpdateEntryCover, onAddGame, onRandomGame,
  pendingSaga, onPendingSagaConsumed, inProgressCount = 0, completedCount = 0
}) {
  const navigate = useNavigate()
  const [activeGenre, setActiveGenre] = useState('Todos')
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [search, setSearch] = useState('')
  const [selectedGame, setSelectedGame] = useState(null)
  const [selectedSaga, setSelectedSaga] = useState(null)
  const [activeType, setActiveType] = useState('todos') // 'todos' | 'sagas' | 'singles'
  const [menuOpen, setMenuOpen] = useState(null)
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    if (pendingSaga) {
      setSelectedSaga(pendingSaga)
      onPendingSagaConsumed()
    }
  }, [pendingSaga])

  // Recopilar todos los géneros únicos
  const allGenres = useMemo(() => {
    const set = new Set()
    games.forEach(g => g.genre?.forEach(genre => set.add(genre)))
    sagas.forEach(s => s.genre?.forEach(genre => set.add(genre)))
    return ['Todos', ...Array.from(set)]
  }, [games, sagas])

  // Stats por género
  const genreStats = useMemo(() => {
    const counts = {}
    games.forEach(g => g.genre?.forEach(genre => {
      counts[genre] = (counts[genre] || 0) + 1
    }))
    sagas.forEach(s => s.genre?.forEach(genre => {
      counts[genre] = (counts[genre] || 0) + 1
    }))
    return counts
  }, [games, sagas])

  // Filtrar
  const filteredGames = useMemo(() => {
    if (activeType === 'sagas') return []  // ← agregar
    return games.filter(g => {
      const matchGenre = activeGenre === 'Todos' || g.genre?.includes(activeGenre)
      const matchSearch = g.title.toLowerCase().includes(search.toLowerCase())
      return matchGenre && matchSearch
    })
  }, [games, activeGenre, activeType, search])  // ← agregar activeType

  const filteredSagas = useMemo(() => {
    if (activeType === 'singles') return []  // ← agregar
    return sagas.filter(s => {
      const matchGenre = activeGenre === 'Todos' || s.genre?.includes(activeGenre)
      const matchSearch = s.title.toLowerCase().includes(search.toLowerCase())
      return matchGenre && matchSearch
    })
  }, [sagas, activeGenre, activeType, search])  // ← agregar activeType

  const allItems = useMemo(() => {
    const items = [
      ...filteredSagas.map(s => ({ type: 'saga', data: s })),
      ...filteredGames.map(g => ({ type: 'game', data: g })),
    ]
    return items.sort((a, b) => {
      const tsA = parseInt(a.data.id.split('-').at(-1)) || 0
      const tsB = parseInt(b.data.id.split('-').at(-1)) || 0
      return tsB - tsA  // más reciente primero
    })
  }, [filteredSagas, filteredGames])

  const availableToPlay = filteredGames.length +
    filteredSagas.reduce((acc, s) => acc + s.entries.filter(e => e.status === 'library').length, 0)
  const totalAll = games.length + sagas.length

  // Top géneros para las barras
  const topGenres = useMemo(() => {
    return Object.entries(genreStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
  }, [genreStats])


  const genreColors = ['var(--accent)', '#22c55e', '#a855f7', '#f5a623']

  function getCover(item) {
    // Si es una saga, busca la primera entry con cover
    if (item.entries) {
      const firstWithCover = item.entries.find(e => e.cover)
      if (firstWithCover) {
        const url = firstWithCover.cover
        return url.startsWith('//') ? `https:${url}` : url
      }
      return null
    }
    // Si es un juego individual
    if (!item.cover) return null
    return item.cover.startsWith('//') ? `https:${item.cover}` : item.cover
  }

  // Si hay una saga seleccionada, mostrar SagaView
  if (selectedSaga) {
    return (
      <SagaView
        saga={selectedSaga}
        allSagas={sagas}          // ← agregar esta línea
        onBack={() => setSelectedSaga(null)}
        onStartPlaying={onStartPlaying}
        onAddEntry={(sagaId, entryData) => onAddToSaga(sagaId, entryData)}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
        onEditSaga={onEditSaga}
        onDeleteSaga={(sagaId) => { onDeleteSaga(sagaId); setSelectedSaga(null) }}
        onUpdateEntryCover={onUpdateEntryCover}
        onRandomGame={onRandomGame}   // ← agregar esta línea
      />
    )
  }

  function SagaCover({ saga }) {
    const covers = saga.entries
      .map(e => e.cover ? (e.cover.startsWith('//') ? `https:${e.cover}` : e.cover) : null)
      .filter(Boolean)

    const [idx, setIdx] = useState(0)
    const [fade, setFade] = useState(true)

    useEffect(() => {
      if (covers.length <= 1) return
      const interval = setInterval(() => {
        setFade(false)
        setTimeout(() => {
          setIdx(prev => (prev + 1) % covers.length)
          setFade(true)
        }, 300)
      }, 2500)
      return () => clearInterval(interval)
    }, [covers.length])

    if (covers.length === 0) return <div className={styles.cardPlaceholder}><span>📚</span></div>

    return (
      <img
        src={covers[idx]}
        alt={saga.title}
        className={styles.cardImg}
        style={{
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
    )
  }

  function GenreDropdown({ allGenres, genreStats, totalAll, activeGenre, onSelect }) {
    const [open, setOpen] = useState(false)
    const activeLabel = activeGenre === 'Todos' ? ' Todos' : activeGenre
    const activeCount = activeGenre === 'Todos' ? totalAll : (genreStats[activeGenre] || 0)

    return (
      <div className={styles.genreDropdown}>
        <span className={styles.sideSectionTitle}>GÉNEROS</span>
        <button
          className={styles.genreDropdownTrigger}
          onClick={() => setOpen(o => !o)}
        >
          <span className={styles.genreDropdownLabel}>
            <span className={styles.genreDropdownDot} />
            {activeLabel}
            <span className={styles.genreDropdownCount}>{activeCount}</span>
          </span>
          <span className={`${styles.genreDropdownArrow} ${open ? styles.genreDropdownArrowOpen : ''}`}>
            ▾
          </span>
        </button>

        {open && (
          <div className={styles.genreDropdownList}>
            {allGenres.map(genre => (
              <button
                key={genre}
                className={`${styles.genreDropdownItem} ${activeGenre === genre ? styles.genreDropdownItemActive : ''}`}
                onClick={() => { onSelect(genre); setOpen(false) }}
              >
                <span className={styles.genreDropdownItemDot} />
                {genre}
                <span className={styles.genreDropdownItemCount}>
                  {genre === 'Todos' ? totalAll : (genreStats[genre] || 0)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (selectedGame) {
  return (
    <GameView
      game={selectedGame}
      mode={selectedGame.status === 'completed' ? 'hall_of_fame'
            : selectedGame.status === 'in_progress' ? 'in_progress'
            : 'library'}
      onBack={() => setSelectedGame(null)}
      onAction={(action) => {
        if (action === 'start') {
          onStartPlaying(selectedGame)
          setSelectedGame(null)
        }
      }}
    />
  )
}

  return (

    <div className={styles.root}>

      {/* ── SIDEBAR IZQUIERDO ── */}
      <AppSidebar
        activeRoute="biblioteca"
        libraryCount={games.length + sagas.length}
        inProgressCount={inProgressCount}
        completedCount={completedCount}
        onRandomGame={onRandomGame}
        widget="random"
        genreProps={{
          allGenres,
          genreStats,
          totalAll,
          activeGenre,
          onSelect: setActiveGenre,
        }}
      />

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className={styles.main}>

        {/* HEADER DE SECCIÓN */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}><LibraryBigIcon size={45} /></div>
            <div>
              <h1 className={styles.pageTitle}>Biblioteca</h1>
              <p className={styles.pageSubtitle}>Juegos pendientes por jugar</p>
            </div>
          </div>
          <div className={styles.pageHeaderRight}>
            <button className={styles.filterBtn}>☰ Filtros</button>
            <div className={styles.sortBtn}>
              Ordenar por: A-Z <span>▾</span>
            </div>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('grid')}
              >⊞</button>
              <button
                className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                onClick={() => setViewMode('list')}
              >☰</button>
            </div>
          </div>
        </div>

        {/* FILTROS TIPO */}
        <div className={styles.genreTabs}>
          {[
            { id: 'todos', label: 'Todos', count: filteredGames.length + filteredSagas.length },
            { id: 'sagas', label: 'Sagas', count: sagas.length },
            { id: 'singles', label: 'Juego individual', count: games.length },
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.genreTab} ${activeType === tab.id ? styles.genreTabActive : ''}`}
              onClick={() => setActiveType(tab.id)}
            >
              {tab.label}
              <span className={styles.genreTabCount}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* STATS BANNER */}
        <div className={styles.statsBanner}>
          <div className={styles.statsBannerLeft}>
            <div className={styles.statsBannerIcon}>▦</div>
            <div>
              <p className={styles.statsBannerCount}>
                {availableToPlay} Juegos disponibles para jugar
              </p>
              <p className={styles.statsBannerSub}>Listos para tu próxima aventura</p>
            </div>
          </div>
          <div className={styles.statsBannerGenres}>
            {topGenres.map(([genre, count], i) => (
              <div key={genre} className={styles.statsBannerGenre}>
                {/* 1. Nombre del Género */}
                <span className={styles.statsBannerGenreName}>{genre}</span>

                {/* 2. Cantidad de juegos */}
                <span className={styles.statsBannerGenreCount}>{count} juegos</span>

                {/* 3. La Barra debajo de todo */}
                <div className={styles.statsBannerBar}>
                  <div
                    className={styles.statsBannerBarFill}
                    style={{
                      width: `${totalAll > 0 ? (count / totalAll) * 100 : 0}%`,
                      background: genreColors[i]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRID DE CARDS */}
        <div className={viewMode === 'grid' ? styles.grid : styles.list}>

          {allItems.map(item => {
            if (item.type === 'saga') {
              const saga = item.data
              return (
                <div key={saga.id} className={`${styles.card} ${styles.cardSaga}`} onClick={() => setSelectedSaga(saga)}>
                  <div className={styles.cardCover}>
                    <SagaCover saga={saga} />
                    <button className={styles.cardMenu} onClick={e => {
                      e.stopPropagation()
                      setMenuOpen(menuOpen === saga.id ? null : saga.id)
                    }}>⋮
                      {menuOpen === saga.id && (
                        <div className={styles.cardMenuDropdown} onClick={e => e.stopPropagation()}>
                          <button onClick={() => { onStartPlaying(saga); setMenuOpen(null) }}>Comenzar a jugar</button>
                          <button onClick={() => { onEditSaga(saga); setMenuOpen(null) }}>Editar saga</button>
                          <button onClick={() => { onDeleteSaga(saga.id); setMenuOpen(null) }}>Eliminar saga</button>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>
                      {saga.title}
                      <span className={styles.sagaBadge}>(SAGA)</span>
                    </p>
                    <div className={styles.cardBottom}>
                      <span className={styles.cardBadge}>
                        <span className={styles.cardBadgeDot} style={{ background: '#a855f7' }} /> {saga.entries?.length} entregas
                      </span>
                      <button className={styles.cardHeart} onClick={e => {
                        e.stopPropagation()
                        setFavorites(prev => {
                          const next = new Set(prev)
                          next.has(saga.id) ? next.delete(saga.id) : next.add(saga.id)
                          return next
                        })
                      }}>{favorites.has(saga.id) ? '♥' : '♡'}</button>
                    </div>
                  </div>
                </div>
              )
            }

            const game = item.data
            return (
              <div key={game.id} className={styles.card} onClick={() => setSelectedGame(game)}>
                <div className={styles.cardCover}>
                  {getCover(game)
                    ? <img src={getCover(game)} alt={game.title} className={styles.cardImg} />
                    : <div className={styles.cardPlaceholder}><span>🎮</span></div>
                  }
                  <button className={styles.cardMenu} onClick={e => {
                    e.stopPropagation()
                    setMenuOpen(menuOpen === game.id ? null : game.id)
                  }}>⋮
                    {menuOpen === game.id && (
                      <div className={styles.cardMenuDropdown} onClick={e => e.stopPropagation()}>
                        <button onClick={() => { onStartPlaying(game); setMenuOpen(null) }}>Comenzar a jugar</button>
                        <button onClick={() => { onEdit(game); setMenuOpen(null) }}>Editar juego</button>
                        <button onClick={() => { onDelete(game); setMenuOpen(null) }}>Eliminar juego</button>
                      </div>
                    )}
                  </button>
                </div>
                <div className={styles.cardInfo}>
                  <p className={styles.cardTitle}>{game.title}</p>
                  <div className={styles.cardBottom}>
                    <span className={styles.cardBadge}>
                      <span className={styles.cardBadgeDot} /> Pendiente
                    </span>
                    <button className={styles.cardHeart} onClick={e => {
                      e.stopPropagation()
                      setFavorites(prev => {
                        const next = new Set(prev)
                        next.has(game.id) ? next.delete(game.id) : next.add(game.id)
                        return next
                      })
                    }}>{favorites.has(game.id) ? '♥' : '♡'}</button>
                  </div>
                </div>
              </div>
            )
          })}

        </div>

        {
          filteredGames.length + filteredSagas.length === 0 && (
            <div className={styles.empty}>
              <span>🎮</span>
              <p>No hay juegos en esta categoría</p>
            </div>
          )
        }

        {/* FAB FLOTANTE */}
        <button className={styles.fab} onClick={onAddGame}>
          <span className={styles.fabIcon}>+</span>
          <span className={styles.fabLabel}>Agregar juego</span>
        </button>

      </main >

      {/* MODAL DETALLE */}
      {selectedGame && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'var(--bg)', overflow: 'auto'
        }}>
          <GameView
            game={selectedGame.data}
            mode="library"
            onBack={() => setSelectedGame(null)}
            onAction={(action) => {
              if (action === 'start') {
                onStartPlaying(selectedGame.data)
                setSelectedGame(null)
              }
              if (action === 'delete') {
                onDelete(selectedGame.data)
                setSelectedGame(null)
              }
              if (action === 'edit') {
                onEdit(selectedGame.data)
                setSelectedGame(null)
              }
            }}
          />
        </div>
      )}

    </div >
  )
}

export default LibraryView