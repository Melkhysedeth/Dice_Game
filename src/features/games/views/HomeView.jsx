import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import {
  ChartColumn, Gamepad2, Trophy, LayoutDashboard, Play, Plus, RefreshCw,
  Leaf, BookOpen, Crosshair, Skull, Users, Timer, Dices, LibraryBigIcon, Target
} from 'lucide-react'
import { getCover } from '../../../utils/gameUtils'
import InProgressSection from '../components/InProgressSection'
import LibraryScroll from '../components/LibraryScroll'
import Footer from '../../../components/layout/Footer'
import styles from './HomeView.module.css'
import { useAuthContext } from '../../../context/AuthContext'

// 1. El array de imágenes se define FUERA del componente para evitar recrearlo en cada render
const HERO_IMAGES = [
  '/src/assets/hero-baner1.png',
  '/src/assets/hero-baner2.png',
  '/src/assets/hero-baner3.png',
  '/src/assets/hero-baner4.png',
  '/src/assets/hero-baner5.png',
  '/src/assets/hero-baner6.png',
];

const MODES = [
  { Icon: Leaf, label: 'Relajado', sub: 'Para desconectar', color: '#4ade80' },
  { Icon: BookOpen, label: 'Historia', sub: 'Vive grandes historias', color: '#818cf8' },
  { Icon: Crosshair, label: 'Acción', sub: 'Pura adrenalina', color: '#fb923c' },
  { Icon: Skull, label: 'Terror', sub: 'Solo para valientes', color: '#f87171' },
  { Icon: Users, label: 'Cooperativo', sub: 'Mejor con amigos', color: '#60a5fa' },
  { Icon: Timer, label: 'Corto', sub: 'Sesiones rápidas', color: '#facc15' },
];

export function HomeView({
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
  onAddGame,
}) {
  const navigate = useNavigate()
  const { userName } = useAuthContext()
  const heroRef = useRef(null)

  // Estados unificados
  const [scrollY, setScrollY] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [pickIndex, setPickIndex] = useState(() =>
    libraryGames.length > 0 ? Math.floor(Math.random() * libraryGames.length) : 0
  )

  const pickGame = libraryGames[pickIndex] ?? null

  const handleReroll = () => {
    if (libraryGames.length <= 1) return
    let next
    do { next = Math.floor(Math.random() * libraryGames.length) } while (next === pickIndex)
    setPickIndex(next)
  }

  const handlePlayNow = () => {
    if (!pickGame) return
    onStartPlaying(pickGame)
    handleReroll()
  }

  // Auto-rotación de juegos cada 20 segundos
  useEffect(() => {
    if (libraryGames.length <= 1) return
    const timer = setInterval(handleReroll, 20000)
    return () => clearInterval(timer)
  }, [pickIndex, libraryGames.length])

  // Efecto 1: Rotador de imágenes (Cada 5 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Efecto 2: Captura del Scroll para el Parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cálculo del offset del parallax
  const parallaxOffset = scrollY * 0.4

  return (
    <>
      {/* ── HERO FULLSCREEN ── */}
      <section className={styles.hero} ref={heroRef}>

        {/* Fondo con parallax */}
        <div className={styles.heroContainer}>
          <div
            className={styles.heroBg}
            style={{
              transform: `translateY(${parallaxOffset}px)`,
              backgroundImage: `url(${HERO_IMAGES[currentImageIndex]})`,
            }}
          />
        </div>

        {/* Overlay gradiente */}
        <div className={styles.heroOverlay} />

        {/* Contenido principal del hero */}
        <div className={styles.heroInner}>

          {/* COLUMNA IZQUIERDA */}
          <div className={styles.heroLeft}>

            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              TU AVENTURA COMIENZA AQUÍ
            </div>

            <div className={styles.heroText}>
              <h1 className={styles.heroLine1}>¿No sabes qué jugar?</h1>
              <h1 className={styles.heroLine2}>
                <span className={styles.heroName}>Déjalo al destino</span>
                {' '}🎲
              </h1>
              <p className={styles.heroTagline}>
                Miles de juegos. Una sola decisión.<br />
                <span className={styles.heroTaglineSub}>
                  Tu próxima gran aventura te está esperando.
                </span>
              </p>
            </div>

            {/* CTAs */}
            <div className={styles.heroCtas}>
              <button className={styles.ctaPrimary} onClick={onRandomGame}>
                <Dices size={18} />ELEGIR JUEGO AL AZAR
              </button>
              <button className={styles.ctaSecondary} onClick={() => navigate('/biblioteca')}>
                <LibraryBigIcon size={18} />Explorar biblioteca
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA — 2 widgets apilados */}
          <div className={styles.heroRight}>

            {/* WIDGET 1: TU PRÓXIMO PICK */}
            <div className={styles.pickWidget}>
              <div className={styles.pickHeader}>
                <Target size={18} />&nbsp;&nbsp;TU PRÓXIMO PICK </div>

              {pickGame ? (
                <>
                  <div className={styles.pickGame}>
                    <div className={styles.pickCover}>
                      {getCover(pickGame)
                        ? <img src={getCover(pickGame)} alt={pickGame.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                        : '🎮'
                      }
                    </div>
                    <div className={styles.pickInfo}>
                      <span className={styles.pickTitle}>{pickGame.title}</span>
                      <span className={styles.pickMeta}>
                        {(inProgressGames[0]?.genre || inProgressGames[0]?.genres || []).join(' · ')}
                      </span>
                      <span className={styles.pickTime}>⏱ Pendiente</span>
                    </div>
                  </div>
                  <div className={styles.pickActions}>
                    <button className={styles.pickPlay} onClick={handlePlayNow}>
                      <Play size={16} strokeWidth={2} />
                      <span>&nbsp;&nbsp;JUGAR AHORA</span>
                    </button>
                    <button className={styles.pickReroll} onClick={handleReroll}>
                      <RefreshCw size={16} strokeWidth={2} />
                      <span>&nbsp;&nbsp;&nbsp;VOLVER A GIRAR</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.pickEmpty}>
                    <span>Sin juegos en biblioteca.<br />¡Agrega uno!</span>
                  </div>
                  <button className={styles.pickPlay} onClick={onAddGame}>
                    <Plus size={18} strokeWidth={2} /> &nbsp;&nbsp;AGREGA UN JUEGO YA!
                  </button>
                </>
              )}
            </div>

            {/* WIDGET 2: GENERAR AVENTURA */}
            <div className={styles.generateWidget} onClick={onRandomGame}>
              <div className={styles.generateBg} />
              <div className={styles.generateContent}>
                <span className={styles.generateIcon}>🎲</span>
                <span className={styles.generateTitle}>GENERAR AVENTURA</span>
                <span className={styles.generateSub}>Déjalo al destino</span>
              </div>
            </div>

          </div>

        </div>

        {/* FILA DE MODOS DE JUEGO */}
        <div className={styles.modesRow}>
          <span className={styles.modesLabel}>¿Cómo quieres jugar hoy?</span>
          <div className={styles.modeChips}>  {/* ← este wrapper es necesario */}
            {MODES.map(({ Icon, label, sub, color }) => (
              <button key={label} className={styles.modeChip} onClick={onRandomGame}>
                <Icon size={28} color={color} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                <div className={styles.modeTexts}>
                  <span className={styles.modeLabel}>{label}</span>
                  <span className={styles.modeSub}>{sub}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className={styles.scrollIndicator}>
          <span className={styles.scrollLine} />
        </div>
      </section>

      {/* ── CONTENIDO DEBAJO DEL HERO ── */}
      <div className={styles.layout}>
        <main className={styles.mainContent}>

          {/* TU PROGRESO */}
          <section className={styles.section}>
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
          </section>

          {/* BIBLIOTECA */}
          <section className={styles.section}>
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
              onOpenSaga={onNavigateToSaga}
            />
          </section>

        </main>

        {/* SIDEBAR DERECHO */}
        <aside className={styles.sidebar}>

          {/* DISTRIBUCIÓN */}
          <div className={styles.sideCard}>
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
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px'
                      }}
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
          </div>

          {/* RANDOM */}
          <div className={styles.randomCard} onClick={onRandomGame}>
            <div className={styles.randomBg} />
            <div className={styles.randomOverlay} />
            <div className={styles.randomCardContent}>
              <div className={styles.randomTop}>
                <h3 className={styles.randomTitle}>¿No sabes qué jugar?</h3>
                <p className={styles.randomSub}>Deja que el azar elija tu próxima aventura.</p>
              </div>
              <span className={styles.diceEmoji}>🎲</span>
            </div>
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className={styles.sideCard}>
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
          </div>

        </aside>
      </div>

      <Footer onRandomGame={onRandomGame} />
    </>
  )
}

export default HomeView