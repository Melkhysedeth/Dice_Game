import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AddGameModal from '../components/AddGameModal'
import styles from './LibraryView.module.css'

function LibraryView({
  games, sagas, onStartPlaying, onEdit, onDelete,
  onEditSaga, onDeleteSaga, onEditEntry, onDeleteEntry,
  onUpdateSagaCover, onUpdateEntryCover, onAddGame, onRandomGame
}) {
  const navigate = useNavigate()
  const [activeGenre, setActiveGenre] = useState('Todos')
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [search, setSearch] = useState('')
  const [selectedGame, setSelectedGame] = useState(null)

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
    return games.filter(g => {
      const matchGenre = activeGenre === 'Todos' || g.genre?.includes(activeGenre)
      const matchSearch = g.title.toLowerCase().includes(search.toLowerCase())
      return matchGenre && matchSearch
    })
  }, [games, activeGenre, search])

  const filteredSagas = useMemo(() => {
    return sagas.filter(s => {
      const matchGenre = activeGenre === 'Todos' || s.genre?.includes(activeGenre)
      const matchSearch = s.title.toLowerCase().includes(search.toLowerCase())
      return matchGenre && matchSearch
    })
  }, [sagas, activeGenre, search])

  const totalFiltered = filteredGames.length + filteredSagas.length
  const totalAll = games.length + sagas.length

  // Top géneros para las barras
  const topGenres = useMemo(() => {
    return Object.entries(genreStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
  }, [genreStats])

  const genreColors = ['var(--accent)', '#22c55e', '#a855f7', '#f5a623']

  function getCover(item) {
    if (!item.cover) return null
    return item.cover.startsWith('//') ? `https:${item.cover}` : item.cover
  }

  return (
    <div className={styles.root}>

      {/* ── SIDEBAR IZQUIERDO ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sideSection}>
          <span className={styles.sideSectionTitle}>MI BIBLIOTECA</span>
          <nav className={styles.sideNav}>
            <button className={styles.sideNavItem} onClick={() => navigate('/')}>
              <span>📊</span> Resumen
            </button>
            <button className={`${styles.sideNavItem} ${styles.sideNavActive}`}>
              <span>▦</span> Biblioteca
              <span className={styles.sideNavBadge}>{totalAll}</span>
            </button>
            <button className={styles.sideNavItem}>
              <span>◉</span> En progreso
              <span className={styles.sideNavBadge} style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--accent-2)' }}>0</span>
            </button>
            <button className={styles.sideNavItem}>
              <span>✦</span> Salón de la fama
              <span className={styles.sideNavBadge} style={{ background: 'rgba(245,166,35,0.15)', color: '#f5a623' }}>0</span>
            </button>
            <button className={styles.sideNavItem} onClick={onRandomGame}>
              <span>🎲</span> Juegos al azar
            </button>
          </nav>
        </div>

        <div className={styles.sideSection}>
          <span className={styles.sideSectionTitle}>LISTAS</span>
          <nav className={styles.sideNav}>
            <button className={styles.sideNavItem}><span>★</span> Favoritos</button>
            <button className={styles.sideNavItem}><span>⏱</span> Juegos cortos</button>
            <button className={styles.sideNavItem}><span>👥</span> Cooperativos</button>
            <button className={styles.sideNavItem}><span>+</span> Nueva lista</button>
          </nav>
        </div>

        {/* DADO */}
        <div className={styles.sideRandom}>
          <h4 className={styles.sideRandomTitle}>¿No sabes qué jugar?</h4>
          <p className={styles.sideRandomSub}>Deja que el azar elija tu próxima aventura.</p>
          <div className={styles.sideDice}>🎲</div>
          <button className={styles.sideRandomBtn} onClick={onRandomGame}>
            <span>🎲</span> JUEGO AL AZAR
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className={styles.main}>

        {/* HEADER DE SECCIÓN */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}>▦</div>
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

        {/* FILTROS POR GÉNERO */}
        <div className={styles.genreTabs}>
          {allGenres.map(genre => (
            <button
              key={genre}
              className={`${styles.genreTab} ${activeGenre === genre ? styles.genreTabActive : ''}`}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
              <span className={styles.genreTabCount}>
                {genre === 'Todos' ? totalAll : (genreStats[genre] || 0)}
              </span>
            </button>
          ))}
        </div>

        {/* STATS BANNER */}
        <div className={styles.statsBanner}>
          <div className={styles.statsBannerLeft}>
            <div className={styles.statsBannerIcon}>▦</div>
            <div>
              <p className={styles.statsBannerCount}>{totalFiltered} juegos en tu biblioteca</p>
              <p className={styles.statsBannerSub}>Listos para tu próxima aventura</p>
            </div>
          </div>
          <div className={styles.statsBannerGenres}>
            {topGenres.map(([genre, count], i) => (
              <div key={genre} className={styles.statsBannerGenre}>
                <div className={styles.statsBannerGenreTop}>
                  <span className={styles.statsBannerGenreName}>{genre}</span>
                  <span className={styles.statsBannerGenreCount}>{count} juegos</span>
                </div>
                <div className={styles.statsBannerBar}>
                  <div
                    className={styles.statsBannerBarFill}
                    style={{
                      width: `${(count / totalAll) * 100}%`,
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

          {filteredSagas.map(saga => (
            <div
              key={saga.id}
              className={styles.card}
              onClick={() => setSelectedGame({ type: 'saga', data: saga })}
            >
              <div className={styles.cardCover}>
                {getCover(saga) ? (
                  <img src={getCover(saga)} alt={saga.title} className={styles.cardImg} />
                ) : (
                  <div className={styles.cardPlaceholder}>
                    <span>📚</span>
                  </div>
                )}
                <div className={styles.cardOverlay} />
                <button
                  className={styles.cardMenu}
                  onClick={e => { e.stopPropagation() }}
                >⋮</button>
              </div>
              <div className={styles.cardInfo}>
                <p className={styles.cardTitle}>{saga.title}</p>
                <div className={styles.cardBottom}>
                  <span className={styles.cardBadge}>
                    <span className={styles.cardBadgeDot} /> {saga.entries?.length} entregas
                  </span>
                  <button className={styles.cardHeart} onClick={e => e.stopPropagation()}>♡</button>
                </div>
              </div>
            </div>
          ))}

          {filteredGames.map(game => (
            <div
              key={game.id}
              className={styles.card}
              onClick={() => setSelectedGame({ type: 'game', data: game })}
            >
              <div className={styles.cardCover}>
                {getCover(game) ? (
                  <img src={getCover(game)} alt={game.title} className={styles.cardImg} />
                ) : (
                  <div className={styles.cardPlaceholder}>
                    <span>🎮</span>
                  </div>
                )}
                <div className={styles.cardOverlay} />
                <button
                  className={styles.cardMenu}
                  onClick={e => { e.stopPropagation() }}
                >⋮</button>
              </div>
              <div className={styles.cardInfo}>
                <p className={styles.cardTitle}>{game.title}</p>
                <div className={styles.cardBottom}>
                  <span className={styles.cardBadge}>
                    <span className={styles.cardBadgeDot} /> Pendiente
                  </span>
                  <button className={styles.cardHeart} onClick={e => e.stopPropagation()}>♡</button>
                </div>
              </div>
            </div>
          ))}

        </div>

        {totalFiltered === 0 && (
          <div className={styles.empty}>
            <span>🎮</span>
            <p>No hay juegos en esta categoría</p>
          </div>
        )}

        {/* FAB FLOTANTE */}
        <button className={styles.fab} onClick={onAddGame}>
          <span className={styles.fabIcon}>+</span>
          <span className={styles.fabLabel}>Agregar juego</span>
        </button>

      </main>

      {/* MODAL DETALLE */}
      {selectedGame && (
        <div className={styles.backdrop} onClick={() => setSelectedGame(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>
                  {selectedGame.type === 'saga' ? selectedGame.data.title : selectedGame.data.title}
                </h2>
                <p className={styles.modalDev}>
                  {selectedGame.data.developer}
                  {selectedGame.data.year && ` — ${selectedGame.data.year}`}
                </p>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedGame(null)}>✕</button>
            </div>
            <div className={styles.modalGenres}>
              {selectedGame.data.genre?.map(g => (
                <span key={g} className={styles.modalGenreTag}>{g}</span>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalPlay}
                onClick={() => {
                  onStartPlaying(selectedGame.data)
                  setSelectedGame(null)
                }}
              >▶ COMENZAR A JUGAR</button>
              <button
                className={styles.modalEdit}
                onClick={() => {
                  selectedGame.type === 'saga'
                    ? onEditSaga(selectedGame.data)
                    : onEdit(selectedGame.data)
                  setSelectedGame(null)
                }}
              >✎ EDITAR</button>
              <button
                className={styles.modalDelete}
                onClick={() => {
                  selectedGame.type === 'saga'
                    ? onDeleteSaga(selectedGame.data.id)
                    : onDelete(selectedGame.data)
                  setSelectedGame(null)
                }}
              >✕ ELIMINAR</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default LibraryView