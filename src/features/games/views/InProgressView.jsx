import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './InProgressView.module.css'
import GameModal from '../components/GameModal'

function InProgressView({ games, onComplete, onRandomGame }) {
  const navigate = useNavigate()
  const [selectedGame, setSelectedGame] = useState(null)
  const [activePlatform, setActivePlatform] = useState('Todos')

  const totalGames = games.length

  function getCover(game) {
    if (!game.cover) return null
    return game.cover.startsWith('//') ? `https:${game.cover}` : game.cover
  }

  function getStartDate(game) {
    const session = game.sessions?.[game.sessions.length - 1]
    return session?.startDate ?? '—'
  }

  function getDaysPlaying(game) {
    const session = game.sessions?.[game.sessions.length - 1]
    if (!session?.startDate) return '—'
    const diff = Math.floor((new Date() - new Date(session.startDate)) / 86400000)
    if (diff === 0) return 'Hoy'
    if (diff === 1) return 'Ayer'
    return `Hace ${diff} días`
  }

  function isFirstTime(game) {
    const session = game.sessions?.[game.sessions.length - 1]
    return session?.isFirstTime ? 'Primera vez' : 'Rejugando'
  }

  // Plataformas únicas
  const platforms = ['Todos', ...new Set(games.flatMap(g => g.platform ?? []))]

  const filteredGames = activePlatform === 'Todos'
    ? games
    : games.filter(g => g.platform?.includes(activePlatform))

  return (
    <div className={styles.root}>

      {/* ── SIDEBAR IZQUIERDO ── */}
      <aside className={styles.sidebarLeft}>
        <div className={styles.sideSection}>
          <span className={styles.sideSectionTitle}>NAVEGACIÓN</span>
          <nav className={styles.sideNav}>
            <button className={styles.sideNavItem} onClick={() => navigate('/')}>
              <span>🏠</span> Inicio
            </button>
            <button className={styles.sideNavItem} onClick={() => navigate('/biblioteca')}>
              <span>▦</span> Biblioteca
              <span className={styles.sideNavBadge}>0</span>
            </button>
            <button className={`${styles.sideNavItem} ${styles.sideNavActive}`}>
              <span>🎮</span> En progreso
              <span className={styles.sideNavBadgeOrange}>{totalGames}</span>
            </button>
            <button className={styles.sideNavItem} onClick={() => navigate('/salon')}>
              <span>🏆</span> Salón de la fama
              <span className={styles.sideNavBadgeGold}>0</span>
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

        <div className={styles.sideRandom}>
          <h4 className={styles.sideRandomTitle}>¿No sabes qué jugar?</h4>
          <p className={styles.sideRandomSub}>Deja que el azar elija tu próxima aventura</p>
          <div className={styles.sideDice}>🎲</div>
          <button className={styles.sideRandomBtn} onClick={onRandomGame}>
            🚀 JUEGO AL AZAR
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className={styles.main}>

        {/* PAGE HEADER */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}>🎮</div>
            <div>
              <h1 className={styles.pageTitle}>En progreso</h1>
              <p className={styles.pageSubtitle}>Juegos que estás jugando actualmente</p>
            </div>
          </div>
        </div>

        {/* FILTROS PLATAFORMA + ORDENAR */}
        <div className={styles.filtersRow}>
          <div className={styles.platformTabs}>
            {platforms.map(p => (
              <button
                key={p}
                className={`${styles.platformTab} ${activePlatform === p ? styles.platformTabActive : ''}`}
                onClick={() => setActivePlatform(p)}
              >
                {p}
                <span className={styles.platformTabCount}>
                  {p === 'Todos' ? totalGames : games.filter(g => g.platform?.includes(p)).length}
                </span>
              </button>
            ))}
          </div>
          <div className={styles.sortBtn}>
            Ordenar por: <span>Último jugado</span> ▾
          </div>
        </div>

        {/* LISTA DE JUEGOS */}
        {filteredGames.length > 0 ? (
          <div className={styles.gameList}>
            {filteredGames.map(game => {
              const progress = game.progress ?? 50
              const cover = getCover(game)
              return (
                <div
                  key={game.id}
                  className={styles.gameRow}
                  onClick={() => setSelectedGame(game)}
                >
                  {/* CARÁTULA */}
                  <div className={styles.rowCover}>
                    {cover
                      ? <img src={cover} alt={game.title} className={styles.rowCoverImg} />
                      : <div className={styles.rowCoverPlaceholder}>🎮</div>
                    }
                  </div>

                  {/* INFO */}
                  <div className={styles.rowInfo}>
                    <div className={styles.rowTitleRow}>
                      <h3 className={styles.rowTitle}>{game.title}</h3>
                      <span className={styles.rowStar}>★</span>
                    </div>
                    <div className={styles.rowTags}>
                      {game.genre?.slice(0, 3).map(g => (
                        <span key={g} className={styles.rowTag}>{g}</span>
                      ))}
                    </div>
                    <div className={styles.rowPlatform}>
                      <span className={styles.rowPlatformIcon}>💾</span>
                      {game.platform?.join(', ')}
                    </div>
                  </div>

                  {/* PROGRESO */}
                  <div className={styles.rowProgress}>
                    <div className={styles.rowProgressTop}>
                      <span className={styles.rowProgressPct}>{progress}%</span>
                      <span className={styles.rowProgressLabel}>Completado</span>
                    </div>
                    <div className={styles.rowProgressBar}>
                      <div
                        className={styles.rowProgressFill}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className={styles.rowProgressBottom}>
                      <span className={styles.rowTimeIcon}>⏱</span>
                      <span className={styles.rowTime}>Tiempo jugado</span>
                      <span className={styles.rowTimeVal}>—</span>
                    </div>
                  </div>

                  {/* ÚLTIMA SESIÓN + BOTÓN */}
                  <div className={styles.rowActions}>
                    <div className={styles.rowSession}>
                      <span className={styles.rowSessionLabel}>Última sesión</span>
                      <span className={styles.rowSessionVal}>{getDaysPlaying(game)}</span>
                    </div>
                    <button
                      className={styles.rowContinueBtn}
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedGame(game)
                      }}
                    >
                      ▶ Continuar
                    </button>
                    <button
                      className={styles.rowMenuBtn}
                      onClick={e => e.stopPropagation()}
                    >⋮</button>
                  </div>

                </div>
              )
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <span>🎮</span>
            <p>No hay juegos en progreso</p>
            <button className={styles.emptyBtn} onClick={() => navigate('/biblioteca')}>
              Ir a la biblioteca →
            </button>
          </div>
        )}

      </main>

      {/* ── SIDEBAR DERECHO ── */}
      <aside className={styles.sidebarRight}>

        {/* RESUMEN DE PROGRESO */}
        <div className={styles.rightCard}>
          <h4 className={styles.rightCardTitle}>▦ RESUMEN DE PROGRESO</h4>
          <div className={styles.donutWrapper}>
            <div className={styles.donutFake}>
              <div className={styles.donutCenter}>
                <span className={styles.donutNum}>{totalGames}</span>
                <span className={styles.donutSub}>Juegos</span>
              </div>
            </div>
            <div className={styles.donutLegend}>
              <div className={styles.donutLegendItem}>
                <span className={styles.donutDot} style={{ background: '#22c55e' }} />
                <span>En progreso</span>
                <span className={styles.donutLegendVal}>{totalGames} (100%)</span>
              </div>
              <div className={styles.donutLegendItem}>
                <span className={styles.donutDot} style={{ background: '#a855f7' }} />
                <span>Pendientes</span>
                <span className={styles.donutLegendVal}>0 (0%)</span>
              </div>
              <div className={styles.donutLegendItem}>
                <span className={styles.donutDot} style={{ background: '#3b82f6' }} />
                <span>Completados</span>
                <span className={styles.donutLegendVal}>0 (0%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* TIEMPO JUGADO */}
        <div className={styles.rightCard}>
          <h4 className={styles.rightCardTitle}>⏱ TIEMPO JUGADO</h4>
          <p className={styles.rightCardSub}>Este mes</p>
          <div className={styles.timeDisplay}>
            <span className={styles.timeBig}>—h —m</span>
          </div>
          <div className={styles.barChart}>
            {[3, 5, 4, 7, 6, 8, 5, 9, 7, 6, 8, 10, 7, 5, 8].map((h, i) => (
              <div key={i} className={styles.barChartCol}>
                <div
                  className={styles.barChartBar}
                  style={{ height: `${h * 8}px` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* LOGROS RECIENTES */}
        <div className={styles.rightCard}>
          <div className={styles.rightCardHeader}>
            <h4 className={styles.rightCardTitle}>🏆 LOGROS RECIENTES</h4>
            <button className={styles.rightCardLink}>Ver todos</button>
          </div>
          <div className={styles.achievementList}>
            {['Explorador', 'Guerrero', 'Coleccionista'].map((name, i) => (
              <div key={i} className={styles.achievementItem}>
                <div className={styles.achievementIcon}>
                  {['🎯', '⚔️', '🎒'][i]}
                </div>
                <div className={styles.achievementInfo}>
                  <span className={styles.achievementName}>{name}</span>
                  <span className={styles.achievementGame}>
                    {games[i % games.length]?.title ?? 'Sin juego'}
                  </span>
                </div>
                <span className={styles.achievementTime}>—</span>
              </div>
            ))}
          </div>

          {/* RACHA */}
          <div className={styles.streak}>
            <span className={styles.streakFire}>🔥</span>
            <div className={styles.streakInfo}>
              <span className={styles.streakTitle}>RACHA ACTIVA</span>
              <span className={styles.streakDays}>— días <span className={styles.streakTag}>¡Sigue así!</span></span>
            </div>
          </div>
          <div className={styles.streakDots}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`${styles.streakDot} ${i < 7 ? styles.streakDotActive : ''}`} />
            ))}
          </div>
        </div>

      </aside>

      {/* MODAL */}
      {selectedGame && (
        <GameModal
          game={{
            ...selectedGame,
            genres: selectedGame.genre ?? [],
            cover: selectedGame.cover?.startsWith('//') ? `https:${selectedGame.cover}` : selectedGame.cover,
            startDate: selectedGame.sessions?.at(-1)?.startDate ?? '—',
            lastSession: (() => {
              const d = selectedGame.sessions?.at(-1)?.startDate
              if (!d) return '—'
              const diff = Math.floor((new Date() - new Date(d)) / 86400000)
              if (diff === 0) return 'Hoy'
              if (diff === 1) return 'Ayer'
              return `Hace ${diff} días`
            })(),
            sessions: selectedGame.sessions?.length ?? 0,  // 👈 CLAVE: convierte el array a número
            progress: selectedGame.progress ?? 50,
          }}
          mode="in_progress"
          onClose={() => setSelectedGame(null)}
          onAction={(action) => {
            if (action === 'complete') { onComplete(selectedGame); setSelectedGame(null) }
            setSelectedGame(null)
          }}
        />
      )}

    </div>
  )
}

export default InProgressView