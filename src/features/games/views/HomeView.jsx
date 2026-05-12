import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartColumn, Gamepad2, Trophy, Dices } from 'lucide-react'
import InProgressSection from '../components/InProgressSection'
import LibraryScroll from '../components/LibraryScroll'
import Footer from '../../../components/layout/Footer'
import styles from './HomeView.module.css'

function HomeView({
  libraryGames,
  inProgressGames,
  completedGames,
  filteredSingles,
  filteredSagas,
  totalGames,
  libraryPct,
  progressPct,
  famePct,
  donutData,
  onComplete,
  onStartPlaying,
  onRandomGame,
  onNavigateToSaga,
  currentUser
}) {
  const navigate = useNavigate()

  const [profileName, setProfileName] = useState(null)

  useEffect(() => {
    if (!currentUser?.id) return
    supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', currentUser.id)
      .single()
      .then(({ data }) => {
        setProfileName(data?.full_name || data?.username || null)
      })
  }, [currentUser?.id])

  const userName = profileName
  ?? currentUser?.user_metadata?.full_name  // ← lo encuentra aquí
  ?? currentUser?.email?.split('@')[0]
  ?? 'Jugador'

  return (
    <>
      <div className={styles.layout}>
        <main className={styles.mainContent}>

          {/* HERO */}
          <section className={styles.hero}>
            <div className={styles.heroAccentBar} />

            {/* SOLO el logo + texto aquí */}
            <div className={styles.heroTop}>
              <div className={styles.heroContent}>
                <img src="/src/assets/vault-logo2.png" alt="Game Vault" className={styles.heroVaultImg} />
                <div className={styles.heroText}>
                  <p className={styles.heroGreetingLine1}>¡Bienvenido de vuelta,</p>
                  <p className={styles.heroGreetingLine2}>
                    <span className={styles.heroNameAccent}>{userName}</span>{' '}
                    <span className={styles.heroWave}>👋</span>
                  </p>
                  <p className={styles.heroTagline}>Organiza, juega y celebra cada aventura.</p>
                </div>
              </div>
            </div>


            {/* Botón aleatorio (solo en hero) 
              <button className={styles.heroRandomBtn} onClick={onRandomGame}>
                <Dices size={28} className={styles.heroRandomIcon} />
                <span className={styles.heroRandomText}>
                  <span className={styles.heroRandomTitle}>ELEGIR UN JUEGO AL AZAR</span>
                  <span className={styles.heroRandomSub}>Descubre tu próxima aventura</span>
                </span>
              </button>*/}

            <div className={styles.kpis}>
              <div className={`${styles.kpiCard} ${styles.kpiCardCyan}`}>
                <span className={styles.kpiIcon} style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--accent)' }}>
                  <ChartColumn size={28} />
                </span>
                <div className={styles.kpiInfo}>
                  <span className={styles.kpiLabel}>Juegos totales</span>
                  <span className={styles.kpiValue}>{totalGames}</span>
                  <span className={styles.kpiSub}>en tu vault</span>
                </div>
              </div>
              <div className={`${styles.kpiCard} ${styles.kpiCardGreen}`}>
                <span className={styles.kpiIcon} style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--accent-2)' }}>
                  <Gamepad2 size={28} />
                </span>
                <div className={styles.kpiInfo}>
                  <span className={styles.kpiLabel}>Horas jugadas</span>
                  <span className={styles.kpiValue}>532h</span>
                  <span className={styles.kpiSub}>de pura diversión</span>
                </div>
              </div>
              <div className={`${styles.kpiCard} ${styles.kpiCardGold}`}>
                <span className={styles.kpiIcon} style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--state-fame)' }}>
                  <Trophy size={28} />
                </span>
                <div className={styles.kpiInfo}>
                  <span className={styles.kpiLabel}>Logros obtenidos</span>
                  <span className={styles.kpiValue}>{completedGames.length}</span>
                  <span className={styles.kpiSub}>¡Sigue así!</span>
                </div>
              </div>
            </div>
          </section >

          {/* TU PROGRESO */}
          < section className={styles.section} >
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionAccent} />
                Tu progreso
              </h2>
              <button className={styles.seeAll} onClick={() => navigate('/en-progreso')}>
                Ver todos →
              </button>
            </div>
            <InProgressSection games={inProgressGames} onComplete={onComplete} />
          </section >

          {/* BIBLIOTECA */}
          < section className={styles.section} >
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionAccent} style={{ background: 'var(--accent)' }} />
                Biblioteca
                <span className={styles.sectionSub}>(Pendientes por jugar)</span>
              </h2>
              <button className={styles.seeAll} onClick={() => navigate('/biblioteca')}>
                Ver todos →
              </button>
            </div>
            <LibraryScroll
              games={filteredSingles}
              sagas={filteredSagas}
              onStartPlaying={onStartPlaying}
              onRandomGame={onRandomGame}
              onNavigateToSaga={onNavigateToSaga}
            />
          </section >

        </main >

        {/* SIDEBAR DERECHO */}
        < aside className={styles.sidebar} >

          {/* DISTRIBUCIÓN */}
          < div className={styles.sideCard} >
            <h3 className={styles.sideCardTitle}>
              <ChartColumn size={16} /> Resumen de tu colección
            </h3>
            <div className={styles.donutRow}>
              <div className={styles.donutWrapper}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '12px' }}
                      cursor={false}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.donutCenter}>
                  <span className={styles.donutTotal}>{totalGames}</span>
                  <span className={styles.donutLabel}>Juegos</span>
                </div>
              </div>
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: 'var(--accent)' }} />
                  <span className={styles.legendName}>Biblioteca</span>
                  <span className={styles.legendVal} style={{ color: 'var(--accent)' }}>
                    {libraryGames.length} ({libraryPct}%)
                  </span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: 'var(--accent-2)' }} />
                  <span className={styles.legendName}>En progreso</span>
                  <span className={styles.legendVal} style={{ color: 'var(--accent-2)' }}>
                    {inProgressGames.length} ({progressPct}%)
                  </span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: 'var(--state-fame)' }} />
                  <span className={styles.legendName}>Salón de la fama</span>
                  <span className={styles.legendVal} style={{ color: 'var(--state-fame)' }}>
                    {completedGames.length} ({famePct}%)
                  </span>
                </div>
              </div>
            </div>
            <button className={styles.statsLink}>
              <ChartColumn size={14} /> Ver estadísticas completas →
            </button>
          </div >

          {/* RANDOM */}
          < div className={styles.randomCard} onClick={onRandomGame} >
            <div className={styles.randomBg} />
            <div className={styles.randomOverlay} />
            <div className={styles.randomCardContent}>
              <div className={styles.randomTop}>
                <h3 className={styles.randomTitle}>¿No sabes qué jugar?</h3>
                <p className={styles.randomSub}>Deja que el azar elija tu próxima aventura.</p>
              </div>
              <span className={styles.diceEmoji}>🎲</span>
            </div>
          </div >

          {/* ACTIVIDAD RECIENTE */}
          < div className={styles.sideCard} >
            <h3 className={styles.sideCardTitle}><span>⚡</span> Actividad reciente</h3>
            <div className={styles.activityList}>
              {completedGames.slice(0, 3).map(game => (
                <div key={game.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>🏆</div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityGame}>{game.title}</span>
                    <span className={styles.activityMeta}>Completado</span>
                  </div>
                </div>
              ))}
              {inProgressGames.slice(0, 2).map(game => (
                <div key={game.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>🎮</div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityGame}>{game.title}</span>
                    <span className={styles.activityMeta}>En progreso</span>
                  </div>
                </div>
              ))}
              {completedGames.length === 0 && inProgressGames.length === 0 && (
                <p className={styles.emptyActivity}>Sin actividad aún.</p>
              )}
            </div>
          </div >

        </aside >
      </div >
      <Footer onRandomGame={onRandomGame} />
    </>
  )
}

export default HomeView