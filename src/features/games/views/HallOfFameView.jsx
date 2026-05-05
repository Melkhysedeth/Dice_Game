import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HallOfFameView.module.css'
import GameModal from '../components/GameModal'
import { getCover } from '../../../utils/gameUtils'
import { LayoutGrid, Gamepad2, Trophy, Dices, Star, Clock, Users, Plus, House } from 'lucide-react'

function HallOfFameView({ games, onReturnToLibrary, onRandomGame, libraryCount = 0, inProgressCount = 0 }) {
  const navigate = useNavigate()
  const [selectedGame, setSelectedGame] = useState(null)
  const [visibleCount, setVisibleCount] = useState(8)

  const visibleGames = games.slice(0, visibleCount)
  const lastCompleted = games[0] ?? null

  const coverUrl = getCover(lastCompleted)

  function getEndDate(game) {
    const last = game.sessions?.[game.sessions.length - 1]
    return last?.endDate ?? '—'
  }

  function getStartDate(game) {
    const last = game.sessions?.[game.sessions.length - 1]
    return last?.startDate ?? '—'
  }

  return (
    <div className={styles.root}>

      {/* ── SIDEBAR IZQUIERDO ── */}
      <aside className={styles.sidebar}>
        {/* NAVEGACIÓN */}
        <div className={styles.sideSection}>
          <span className={styles.sideSectionTitle}>NAVEGACIÓN</span>
          <nav className={styles.sideNav}>
            <button className={styles.sideNavItem} onClick={() => navigate('/')}>
              <House size={20} /> Inicio
            </button>
            <button className={styles.sideNavItem} onClick={() => navigate('/biblioteca')}>
              <LayoutGrid size={20} /> Biblioteca
              <span className={styles.sideNavBadge}>{libraryCount}</span>
            </button>
            <button className={styles.sideNavItem} onClick={() => navigate('/en-progreso')}>
              <Gamepad2 size={20} /> En progreso
              <span className={styles.sideNavBadge} style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--accent-2)' }}>
                {inProgressCount}
              </span>
            </button>
            <button className={`${styles.sideNavItem} ${styles.sideNavActive}`}>
              <Trophy size={20} /> Salón de la fama
              <span className={styles.sideNavBadge} style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--state-fame)' }}>
                {games.length}
              </span>
            </button>
            <button className={styles.sideNavItem} onClick={onRandomGame}>
              <Dices size={20} /> Juegos al azar
            </button>
          </nav>
        </div>

        <div className={styles.sideSection}>
          <span className={styles.sideSectionTitle}>LISTAS</span>
          <nav className={styles.sideNav}>
            <button className={styles.sideNavItem}><Star size={18} /> Favoritos</button>
            <button className={styles.sideNavItem}><Clock size={18} /> Juegos cortos</button>
            <button className={styles.sideNavItem}><Users size={18} /> Cooperativos</button>
            <button className={styles.sideNavItem}><Plus size={18} /> Nueva lista</button>
          </nav>
        </div>

        {/* MOTIVACIÓN */}
        <div className={styles.sideMotivation}>
          <h4 className={styles.sideMotivationTitle}>¡Sigue completando!</h4>
          <p className={styles.sideMotivationSub}>Cada juego completado te acerca a la leyenda.</p>
          <div className={styles.sideTrophy}>🏆</div>
          <button className={styles.sideMotivationBtn}>Ver mis logros</button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className={styles.main}>

        {/* PAGE HEADER */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}>🏆</div>
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
              <span className={styles.donutLabel}>Juegos<br />completados</span>
            </div>
          </div>
          <div className={styles.rightStats}>
            <div className={styles.rightStat}>
              <span className={styles.rightStatIcon} style={{ color: 'var(--state-fame)' }}>⏱</span>
              <span className={styles.rightStatLabel}>Horas totales</span>
              <span className={styles.rightStatVal}>—</span>
            </div>
            <div className={styles.rightStat}>
              <span className={styles.rightStatIcon} style={{ color: 'var(--state-fame)' }}>🏆</span>
              <span className={styles.rightStatLabel}>Logros obtenidos</span>
              <span className={styles.rightStatVal}>—</span>
            </div>
            <div className={styles.rightStat}>
              <span className={styles.rightStatIcon} style={{ color: '#ef4444' }}>🔥</span>
              <span className={styles.rightStatLabel}>Rachas de completados</span>
              <span className={styles.rightStatVal}>{games.length} juegos</span>
            </div>
            <div className={styles.rightStat}>
              <span className={styles.rightStatIcon} style={{ color: 'var(--state-fame)' }}>★</span>
              <span className={styles.rightStatLabel}>Calificación promedio</span>
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
              const icons = ['🥇', '👑', '💎']
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

      {/* ── MODAL ── */}
      {selectedGame && (
        <GameModal
          game={selectedGame}
          mode="hall_of_fame"
          onClose={() => setSelectedGame(null)}
          onAction={(action) => {
            if (action === 'replay') {
              onReturnToLibrary(selectedGame)
              setSelectedGame(null)
            }
          }}
        />
      )}

    </div>
  )
}

export default HallOfFameView