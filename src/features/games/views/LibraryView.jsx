import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCover } from '../../../utils/gameUtils'
import AddGameModal from '../components/AddGameModal'
import styles from './LibraryView.module.css'
import GameView from './GameView'
import SagaView from './SagaView'
import AppSidebar from '../../../components/layout/AppSidebar'
import { useSidebar } from '../../../context/SidebarContext'
import {
  LibraryBigIcon, LayoutDashboard, Gamepad2, Sword, BookOpen, Skull,
  Users, Globe, Leaf, Clock, Zap, Target, Music, Dices
} from 'lucide-react'

function LibraryView({
  games, sagas, onStartPlaying, onEdit, onDelete, loadingData,
  onEditSaga, onDeleteSaga, onEditEntry, onDeleteEntry, onAddToSaga,
  onUpdateSagaCover, onUpdateEntryCover, onAddGame, onRandomGame,
  pendingSaga, onPendingSagaConsumed, inProgressCount = 0, completedCount = 0,
  onCompleteEntry, onReplayEntry, onUpdateEntryStatus, onStartPlayingEntry
}) {

  const genreIcons = {
    'Aventura': Sword,
    'FPS': Target,
    'RPG': Gamepad2,
    'Terror': Skull,
    'Cooperativo': Users,
    'Mundo abierto': Globe,
    'Relajante': Leaf,
    'Historia': BookOpen,
    'Juego corto': Clock,
  }

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

  const { sidebarMode } = useSidebar()

  useEffect(() => {
    const width = sidebarMode === 'expanded' ? '300px' : '64px'
    document.documentElement.style.setProperty('--sidebar-width', width)
  }, [sidebarMode])

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
    sagas.forEach(s => {
      const entryCount = s.entries?.length ?? 1
      s.genre?.forEach(genre => {
        counts[genre] = (counts[genre] || 0) + entryCount  // ← cuenta los juegos dentro
      })
    })
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
      const tsA = new Date(a.data._createdAt || 0).getTime()
      const tsB = new Date(b.data._createdAt || 0).getTime()
      return tsB - tsA
    })
  }, [filteredSagas, filteredGames])

  const availableToPlay = filteredGames.length +
    filteredSagas.reduce((acc, s) => acc + s.entries.filter(e => e.status === 'library').length, 0)
  const totalAll = games.length + sagas.reduce((acc, s) => acc + (s.entries?.length ?? 1), 0)

  // Top géneros para las barras
  const topGenres = useMemo(() => {
    return Object.entries(genreStats)
      .filter(([genre, count]) => count >= 2)  // ← solo géneros con 2+ juegos
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
    const currentSaga = sagas.find(s => s.id === selectedSaga.id) ?? selectedSaga
    return (
      <SagaView
        saga={currentSaga}
        allSagas={sagas}
        onBack={() => setSelectedSaga(null)}
        onStartPlaying={onStartPlaying}
        onAddEntry={(sagaId, entryData) => onAddToSaga(sagaId, entryData)}
        onEditEntry={onEditEntry}
        onDeleteEntry={onDeleteEntry}
        onEditSaga={onEditSaga}
        onDeleteSaga={(sagaId) => { onDeleteSaga(sagaId); setSelectedSaga(null) }}
        onUpdateEntryCover={onUpdateEntryCover}
        onRandomGame={onRandomGame}
        onCompleteEntry={onCompleteEntry}
        onReplayEntry={onReplayEntry}
        onUpdateEntryStatus={onUpdateEntryStatus}
        onStartPlaying={onStartPlayingEntry}
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
        game={selectedGame.data ?? selectedGame}
        mode={selectedGame.status === 'completed' ? 'hall_of_fame'
          : selectedGame.status === 'in_progress' ? 'in_progress'
            : 'library'}
        onClose={() => setSelectedGame(null)}
        onBack={() => setSelectedGame(null)}
        onEdit={(game) => { onEdit(game); setSelectedGame(null) }}
        onDelete={(game) => { onDelete(game); setSelectedGame(null) }}
        onAction={(action) => {
          if (action === 'start') {
            onStartPlaying(selectedGame.data ?? selectedGame)
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
        libraryCount={games.length + sagas.reduce((acc, s) => acc + (s.entries?.length ?? 1), 0)}
        inProgressCount={inProgressCount}
        completedCount={completedCount}
        onRandomGame={onRandomGame}
        widget={null}
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

        {/* ── HEADER ── */}
        <div className={styles.pageHeader}>
          {/* IZQUIERDA: título */}
          <div className={styles.pageHeaderMeta}>
            <div className={styles.pageIcon}><LibraryBigIcon size={45} /></div>
            <div>
              <h1 className={styles.pageTitle}>Biblioteca</h1>
              <p className={styles.pageSubtitle}>Todos tus juegos en un solo lugar</p>
            </div>
          </div>

          {/* CENTRO: contador */}
          <div className={styles.pageHeaderCounter}>
            <div className={styles.pageHeaderCounterBar} />
            <div>
              <p className={styles.pageHeaderCounterTitle}>{availableToPlay} Juegos disponibles para jugar</p>
              <p className={styles.pageHeaderCounterSub}>Listos para tu próxima aventura</p>
            </div>
          </div>

          {/* DERECHA: controles */}
          <div className={styles.pageHeaderControls}>
            <button className={styles.filterBtn}>☰ Filtros</button>
            <div className={styles.sortBtn}>Ordenar por: A-Z <span>▾</span></div>
            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('grid')}>⊞</button>
              <button className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('list')}>☰</button>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className={styles.genreTabs}>
          {[
            { id: 'todos', label: 'Todos', count: games.length + sagas.reduce((acc, s) => acc + (s.entries?.length ?? 1), 0) },
            { id: 'sagas', label: 'Sagas', count: sagas.length },
            { id: 'singles', label: 'Juego individual', count: games.length },
                ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.genreTab} ${activeType === tab.id ? styles.genreTabActive : ''}`}
              onClick={() => setActiveType(tab.id)}>
              {tab.label}
              <span className={styles.genreTabCount}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── BANNER ── */}
        <div className={styles.adventureBanner}>
          <div className={styles.bannerContent}>
            <h2 className={styles.bannerTitle}>¿No sabes qué jugar hoy?</h2>
            <p className={styles.bannerDesc}>Deja que el destino elija tu próxima aventura.</p>
            <div className={styles.bannerActions}>
              <button className={styles.generateBtn} onClick={onRandomGame}>
                <Dices size={18} />GENERAR AVENTURA
              </button>
              <button className={styles.howItWorksBtn}>▷ Ver cómo funciona</button>
            </div>
          </div>
        </div>

        {/* ── GENRE CARDS — debajo del banner ── */}
        <div className={styles.genreCards}>
          {topGenres.map(([genre, count], i) => {
            const Icon = genreIcons[genre] ?? Gamepad2
            return (
              <div key={genre} className={styles.genreCard} style={{ borderLeftColor: genreColors[i] }}>
                <div className={styles.genreCardIcon} style={{ color: genreColors[i] }}>
                  <Icon size={28} />
                </div>
                <div className={styles.genreCardInfo}>
                  <span className={styles.genreCardName}>{genre}</span>
                  <span className={styles.genreCardCount}>{count} juegos</span>
                  <div className={styles.genreCardBar}>
                    <div
                      className={styles.genreCardBarFill}
                      style={{
                        width: `${totalAll > 0 ? (count / totalAll) * 100 : 0}%`,
                        background: genreColors[i]
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
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
                  </div>
                  <button className={styles.cardMenu} onClick={e => {
                    e.stopPropagation()
                    setMenuOpen(menuOpen === saga.id ? null : saga.id)}}>⋮
                    {menuOpen === saga.id && (
                      <div className={styles.cardMenuDropdown} onClick={e => e.stopPropagation()}>
                        <button onClick={() => { onStartPlaying(saga); setMenuOpen(null) }}>Comenzar a jugar</button>
                        <button onClick={() => { onEditSaga(saga); setMenuOpen(null) }}>Editar saga</button>
                        <button onClick={() => { onDeleteSaga(saga.id); setMenuOpen(null) }}>Eliminar saga</button>
                      </div>
                    )}
                  </button>

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
                </div>
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
          <span className={styles.fabLabel}>Agregar Titulo</span>
        </button>

      </main >

    </div >
  )
}

export default LibraryView