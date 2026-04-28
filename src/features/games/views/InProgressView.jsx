import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InProgressCard from '../components/InProgressCard'
import styles from './InProgressView.module.css'

function InProgressView({ games, onComplete, onRandomGame }) {
  const navigate = useNavigate()
  const [selectedGame, setSelectedGame] = useState(null)

  const totalGames = games.length
  const avgProgress = totalGames > 0
    ? Math.round(games.reduce((acc, g) => acc + (g.progress ?? 50), 0) / totalGames)
    : 0

  function getCover(game) {
    if (!game.cover) return null
    return game.cover.startsWith('//') ? `https:${game.cover}` : game.cover
  }

  function getDaysPlaying(game) {
    const session = game.sessions?.[game.sessions.length - 1]
    if (!session?.startDate) return '—'
    const diff = Math.floor((new Date() - new Date(session.startDate)) / 86400000)
    return diff === 0 ? 'Hoy' : `${diff} días`
  }

  function getStartDate(game) {
    const session = game.sessions?.[game.sessions.length - 1]
    return session?.startDate ?? '—'
  }

  function isFirstTime(game) {
    const session = game.sessions?.[game.sessions.length - 1]
    return session?.isFirstTime ? 'Primera vez' : 'Rejugando'
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
            <button className={styles.sideNavItem} onClick={() => navigate('/biblioteca')}>
              <span>▦</span> Biblioteca
            </button>
            <button className={`${styles.sideNavItem} ${styles.sideNavActive}`}>
              <span>◉</span> En progreso
              <span className={styles.sideNavBadge} style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--accent-2)' }}>
                {totalGames}
              </span>
            </button>
            <button className={styles.sideNavItem} onClick={() => navigate('/salon')}>
              <span>✦</span> Salón de la fama
            </button>
            <button className={styles.sideNavItem} onClick={onRandomGame}>
              <span>🎲</span> Juego al azar
            </button>
          </nav>
        </div>

        {/* STATS RÁPIDAS */}
        <div className={styles.sideSection}>
          <span className={styles.sideSectionTitle}>ESTADÍSTICAS</span>
          <div className={styles.sideStats}>
            <div className={styles.sideStat}>
              <span className={styles.sideStatValue}>{totalGames}</span>
              <span className={styles.sideStatLabel}>En progreso</span>
            </div>
            <div className={styles.sideStat}>
              <span className={styles.sideStatValue} style={{ color: 'var(--accent-2)' }}>{avgProgress}%</span>
              <span className={styles.sideStatLabel}>Progreso medio</span>
            </div>
            <div className={styles.sideStat}>
              <span className={styles.sideStatValue}>3</span>
              <span className={styles.sideStatLabel}>Slots disponibles</span>
            </div>
          </div>

          {/* Barra de slots usados */}
          <div className={styles.slotsBar}>
            <div className={styles.slotsBarLabel}>
              <span>Slots usados</span>
              <span style={{ color: 'var(--accent-2)' }}>{totalGames}/3</span>
            </div>
            <div className={styles.slotsTrack}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={styles.slotsSlot}
                  style={{ background: i < totalGames ? 'var(--accent-2)' : 'var(--surface-2)' }}
                />
              ))}
            </div>
          </div>
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

        {/* PAGE HEADER */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderLeft}>
            <div className={styles.pageIcon}>◉</div>
            <div>
              <h1 className={styles.pageTitle}>En Progreso</h1>
              <p className={styles.pageSubtitle}>Juegos que estás jugando ahora</p>
            </div>
          </div>
        </div>

        {/* STATS BANNER */}
        {totalGames > 0 && (
          <div className={styles.statsBanner}>
            <div className={styles.statsBannerLeft}>
              <div className={styles.statsBannerIcon}>◉</div>
              <div>
                <p className={styles.statsBannerCount}>{totalGames} juego{totalGames !== 1 ? 's' : ''} en progreso</p>
                <p className={styles.statsBannerSub}>Máximo 3 simultáneos</p>
              </div>
            </div>
            <div className={styles.statsBannerGames}>
              {games.map((game, i) => {
                const prog = game.progress ?? 50
                const colors = ['var(--accent-2)', 'var(--accent)', 'var(--accent-3)']
                return (
                  <div key={game.id} className={styles.statsBannerGame}>
                    <div className={styles.statsBannerGameTop}>
                      <span className={styles.statsBannerGameName}>{game.title}</span>
                      <span className={styles.statsBannerGamePct}>{prog}%</span>
                    </div>
                    <div className={styles.statsBannerBar}>
                      <div
                        className={styles.statsBannerBarFill}
                        style={{ width: `${prog}%`, background: colors[i % 3] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* GRID DE CARDS */}
        {totalGames > 0 ? (
          <div className={styles.grid}>
            {games.map(game => (
              <div
                key={game.id}
                className={styles.card}
                onClick={() => setSelectedGame(game)}
              >
                <div className={styles.cardCover}>
                  {getCover(game) ? (
                    <img src={getCover(game)} alt={game.title} className={styles.cardImg} />
                  ) : (
                    <div className={styles.cardPlaceholder}><span>🎮</span></div>
                  )}
                  <div className={styles.cardOverlay} />

                  {/* Badge de progreso sobre la carátula */}
                  <div className={styles.cardProgressBadge}>
                    {game.progress ?? 50}%
                  </div>
                </div>

                <div className={styles.cardInfo}>
                  <p className={styles.cardTitle}>{game.title}</p>
                  {game.sagaTitle && (
                    <p className={styles.cardSaga}>{game.sagaTitle}</p>
                  )}
                  <div className={styles.cardProgressRow}>
                    <div className={styles.cardProgressBar}>
                      <div
                        className={styles.cardProgressFill}
                        style={{ width: `${game.progress ?? 50}%` }}
                      />
                    </div>
                  </div>
                  <div className={styles.cardBottom}>
                    <span className={styles.cardBadge}>
                      <span className={styles.cardBadgeDot} />
                      {getDaysPlaying(game)}
                    </span>
                    <span className={styles.cardFirstTime}>{isFirstTime(game)}</span>
                  </div>
                </div>
              </div>
            ))}
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

      {/* MODAL DETALLE */}
      {selectedGame && (
        <div className={styles.backdrop} onClick={() => setSelectedGame(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                {selectedGame.sagaTitle && (
                  <span className={styles.modalSagaBadge}>{selectedGame.sagaTitle}</span>
                )}
                <h2 className={styles.modalTitle}>{selectedGame.title}</h2>
                <p className={styles.modalDev}>
                  {selectedGame.developer}
                  {selectedGame.year && ` — ${selectedGame.year}`}
                </p>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedGame(null)}>✕</button>
            </div>

            <div className={styles.modalStats}>
              <div className={styles.modalStat}>
                <span className={styles.modalStatLabel}>INICIADO</span>
                <span className={styles.modalStatValue}>{getStartDate(selectedGame)}</span>
              </div>
              <div className={styles.modalStat}>
                <span className={styles.modalStatLabel}>TIEMPO</span>
                <span className={styles.modalStatValue}>{getDaysPlaying(selectedGame)}</span>
              </div>
              <div className={styles.modalStat}>
                <span className={styles.modalStatLabel}>PARTIDA</span>
                <span className={styles.modalStatValue}>{isFirstTime(selectedGame)}</span>
              </div>
              <div className={styles.modalStat}>
                <span className={styles.modalStatLabel}>PROGRESO</span>
                <span className={styles.modalStatValue} style={{ color: 'var(--accent-2)' }}>
                  {selectedGame.progress ?? 50}%
                </span>
              </div>
            </div>

            <div className={styles.modalProgressWrap}>
              <div className={styles.modalProgressBar}>
                <div
                  className={styles.modalProgressFill}
                  style={{ width: `${selectedGame.progress ?? 50}%` }}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.modalComplete}
                onClick={() => { onComplete(selectedGame); setSelectedGame(null) }}
              >
                ✓ MARCAR COMO COMPLETADO
              </button>
              <button
                className={styles.modalEdit}
                onClick={() => setSelectedGame(null)}
              >
                ✎ EDITAR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default InProgressView
