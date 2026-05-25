import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HallOfFameView.module.css'
import GameView from './GameView'
import { getCover } from '../../../utils/gameUtils'
import AppSidebar from '../../../components/layout/AppSidebar'
import { useSidebar } from '../../../context/SidebarContext'
import { Trophy, Clock, Flame, Star, Medal, Crown, Gem } from 'lucide-react'

function HallOfFameView({ games, onReturnToLibrary, onRandomGame, libraryCount, inProgressCount, onEdit, onDelete }) {
  const navigate = useNavigate()
  const [selectedGame, setSelectedGame] = useState(null)
  const [visibleCount, setVisibleCount] = useState(8)

  const visibleGames = games.slice(0, visibleCount)
  const lastCompleted = games[0] ?? null

  const coverUrl = getCover(lastCompleted)

  const { sidebarMode } = useSidebar()

  useEffect(() => {
    const width = sidebarMode === 'expanded' ? '300px' : '64px'
    document.documentElement.style.setProperty('--sidebar-width', width)
  }, [sidebarMode])

  function getEndDate(game) {
    const last = game.sessions?.[game.sessions.length - 1]
    return last?.endDate ?? '—'
  }

  function getStartDate(game) {
    const last = game.sessions?.[game.sessions.length - 1]
    return last?.startDate ?? '—'
  }

  if (selectedGame) {
    return (
      <GameView
        game={selectedGame}
        mode="hall_of_fame"
        onClose={() => setSelectedGame(null)}
        onEdit={(game) => { onEdit(game); setSelectedGame(null) }}
        onDelete={(game) => { onDelete(game); setSelectedGame(null) }}
        onAction={(action) => {
          if (action === 'replay') {
            onReturnToLibrary(selectedGame)
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
        activeRoute="salon"
        libraryCount={libraryCount}
        inProgressCount={inProgressCount}
        completedCount={games.length}
        onRandomGame={onRandomGame}
        widget="motivation"
      /> {/* style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--accent-2)' }} */}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className={styles.main}>

        {/* PAGE HEADER */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}><Trophy size={45} /></div>
            <div>
              <h1 className={styles.pageTitle}>Salón de la fama</h1>
              <p className={styles.pageSubtitle}>Los juegos que has completado al 100%</p>
            </div>
          </div>
          <div className={styles.pageHeaderRight}>
            <span className={styles.sortLabel}>Ordenar por:</span>
            <div className={styles.sortBtn}>Más reciente <span>▾</span></div>
          </div>
        </div>

        {/* GRID DE CARDS */}
        {games.length > 0 ? (
          <>
            <div className={styles.grid}>
              {visibleGames.map(game => (
                <div
                  key={game.id}
                  className={styles.card}
                  onClick={() => setSelectedGame(game)}
                >
                  {/* CARÁTULA */}
                  <div className={styles.cardCover}>
                    {getCover(game) ? (
                      <img src={getCover(game)} alt={game.title} className={styles.cardImg} />
                    ) : (
                      <div className={styles.cardPlaceholder}><span>🏆</span></div>
                    )}
                    <div className={styles.cardOverlay} />

                    {/* RIBBON diagonal */}
                    <div className={styles.ribbon}>
                      <span>   COMPLETADO</span>
                    </div>

                    {/* Estrella favorito */}
                    <button
                      className={styles.cardStar}
                      onClick={e => e.stopPropagation()}
                    >★</button>
                  </div>

                  {/* INFO */}
                  <div className={styles.cardInfo}>
                    <p className={styles.cardTitle}>{game.title}</p>
                    {game.sagaTitle && (
                      <p className={styles.cardSaga}>{game.sagaTitle}</p>
                    )}
                    <div className={styles.cardMeta}>
                      <span className={styles.cardMetaItem}>
                        <span className={styles.cardStar2}>★</span> 100%
                      </span>
                      <span className={styles.cardMetaItem}>
                        ⏱ {getEndDate(game)}  {/* ← mueve la fecha aquí, al lado del reloj */}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < games.length && (
              <button
                className={styles.loadMore}
                onClick={() => setVisibleCount(v => v + 8)}
              >
                Cargar más <span>▾</span>
              </button>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <span>🏆</span>
            <p>Aún no has completado ningún juego</p>
            <button className={styles.emptyBtn} onClick={() => navigate('/en-progreso')}>
              Ver juegos en progreso →
            </button>
          </div>
        )}

      </main>

      {/* ── SIDEBAR DERECHO ── */}
      <aside className={styles.sidebarRight}>

        {/* RESUMEN DE LOGROS */}
        <div className={styles.rightCard}>
          <h3 className={styles.rightCardTitle}>RESUMEN DE LOGROS</h3>
          <div className={styles.donutWrap}>
            <div className={styles.donut}>
              <span className={styles.donutNum}>{games.length}</span>
              <span className={styles.donutLabel}>juegos</span>
            </div>
          </div>
          <div className={styles.rightStats}>
            <div className={styles.rightStat}>
              <Clock size={14} style={{ color: 'var(--state-fame)' }} />
              <span className={styles.rightStatLabel}>Horas totales</span>
              <span className={styles.rightStatVal}>—</span>
            </div>
            <div className={styles.rightStat}>
              <Trophy size={14} style={{ color: 'var(--state-fame)' }} />
              <span className={styles.rightStatLabel}>Logros obtenidos</span>
              <span className={styles.rightStatVal}>—</span>
            </div>
            <div className={styles.rightStat}>
              <Flame size={14} style={{ color: '#ef4444' }} />
              <span className={styles.rightStatLabel}>Rachas</span>
              <span className={styles.rightStatVal}>{games.length} juegos</span>
            </div>
            <div className={styles.rightStat}>
              <Star size={14} style={{ color: 'var(--state-fame)' }} />
              <span className={styles.rightStatLabel}>Calificación</span>
              <span className={styles.rightStatVal}>— / 10</span>
            </div>
          </div>
        </div>

        {/* ÚLTIMO COMPLETADO */}
        {lastCompleted && (
          <div className={styles.rightCard}>
            <h3 className={styles.rightCardTitle}>ÚLTIMO JUEGO COMPLETADO</h3>
            <div className={styles.lastGame}>
              <div className={styles.lastGameCover}>
                {getCover(lastCompleted) ? (
                  <img src={getCover(lastCompleted)} alt={lastCompleted.title} className={styles.lastGameImg} />
                ) : (
                  <div className={styles.lastGamePlaceholder}>🏆</div>
                )}
              </div>
              <div className={styles.lastGameInfo}>
                <p className={styles.lastGameTitle}>{lastCompleted.title}</p>
                {lastCompleted.sagaTitle && (
                  <p className={styles.lastGameSaga}>{lastCompleted.sagaTitle}</p>
                )}
                <div className={styles.lastGameMeta}>
                  <span>★ 100%</span>
                  <span>⏱ —</span>
                </div>
                <span className={styles.lastGameDate}>{getEndDate(lastCompleted)}</span>
              </div>
            </div>
          </div>
        )}

        {/* LOGROS RECIENTES */}
        <div className={styles.rightCard}>
          <h3 className={styles.rightCardTitle}>LOGROS RECIENTES</h3>
          <div className={styles.achievementList}>
            {games.slice(0, 3).map((game, i) => {
              const icons = [
                <Medal size={24} color="#FFD700" />,
                <Crown size={24} color="#a855f7" />,
                <Gem size={24} color="#22d3ee" />,
              ]
              const labels = [
                'Maestro de maestros',
                'Leyenda viviente',
                'Perfeccionista'
              ]
              const subs = [
                `Completaste ${game.title}`,
                'Juego completado al 100%',
                'Sin rendirse hasta el final'
              ]
              return (
                <div key={game.id} className={styles.achievement}>
                  <div className={styles.achievementIcon}>{icons[i]}</div>
                  <div className={styles.achievementInfo}>
                    <span className={styles.achievementName}>{labels[i]}</span>
                    <span className={styles.achievementSub}>{subs[i]}</span>
                  </div>
                  <span className={styles.achievementDate}>{getEndDate(game)}</span>
                </div>
              )
            })}
            {games.length === 0 && (
              <p className={styles.emptyAchievements}>Completa juegos para ver logros</p>
            )}
          </div>
          <button className={styles.seeAllBtn}>Ver todos los logros →</button>
        </div>

      </aside>

    </div>
  )
}

export default HallOfFameView