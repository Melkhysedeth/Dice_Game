import { useNavigate } from 'react-router-dom'
import { House, LibraryBigIcon, Gamepad2, Trophy, Dices, Star, Clock, Users, Plus } from 'lucide-react'
import styles from './AppSidebar.module.css'
import { useState } from 'react'

/**
 * Sidebar izquierdo reutilizable para Biblioteca, En Progreso y Salón de la Fama.
 *
 * Props:
 * - activeRoute: 'biblioteca' | 'en-progreso' | 'salon'
 * - libraryCount, inProgressCount, completedCount
 * - onRandomGame
 * - widget: 'random' (dado) | 'motivation' (trofeo) — widget inferior
 */
function AppSidebar({
  activeRoute,
  libraryCount = 0,
  inProgressCount = 0,
  completedCount = 0,
  onRandomGame,
  widget = 'random',
  genreProps = null,
}) {
  const navigate = useNavigate()
  const [genresOpen, setGenresOpen] = useState(false)

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

  return (
    <aside className={styles.sidebar}>

      {/* NAVEGACIÓN */}
      <div className={styles.sideSection}>
        <span className={styles.sideSectionTitle}>NAVEGACIÓN</span>
        <nav className={styles.sideNav}>

          <button className={styles.sideNavItem} onClick={() => navigate('/')}>
            <House size={20} /> Inicio
          </button>

          <button
            className={`${styles.sideNavItem} ${activeRoute === 'biblioteca' ? styles.sideNavLibrary : ''}`}
            onClick={() => navigate('/biblioteca')}
          >
            <LibraryBigIcon size={20} /> Biblioteca
            <span className={styles.sideNavBadge}>{libraryCount}</span>
          </button>

          <button
            className={`${styles.sideNavItem} ${activeRoute === 'en-progreso' ? styles.sideNavInProgress : ''}`}
            onClick={() => navigate('/en-progreso')}
          >
            <Gamepad2 size={20} /> En Progreso
            <span className={styles.sideNavBadgeOrange}>{inProgressCount}</span>
          </button>

          <button
            className={`${styles.sideNavItem} ${activeRoute === 'salon' ? styles.sideNavHallOfFame : ''}`}
            onClick={() => navigate('/salon')}
          >
            <Trophy size={20} /> Salón de la Fama
            <span className={styles.sideNavBadgeGold}>{completedCount}</span>
          </button>

          <button className={styles.sideNavItem} onClick={onRandomGame}>
            <Dices size={20} /> Juegos al azar
          </button>

        </nav>
      </div>

      {/* GÉNEROS — solo si se pasan datos */}
      {genreProps && (
        <div className={styles.sideSection}>
          <GenreDropdown
            allGenres={genreProps.allGenres}
            genreStats={genreProps.genreStats}
            totalAll={genreProps.totalAll}
            activeGenre={genreProps.activeGenre}
            onSelect={genreProps.onSelect}
          />
        </div>
      )}

      {/* LISTAS */}
      <div className={styles.sideSection}>
        <span className={styles.sideSectionTitle}>LISTAS</span>
        <nav className={styles.sideNav}>
          <button className={styles.sideNavItem}><Star size={18} /> Favoritos</button>
          <button className={styles.sideNavItem}><Clock size={18} /> Juegos cortos</button>
          <button className={styles.sideNavItem}><Users size={18} /> Cooperativos</button>
          <button className={styles.sideNavItem}><Plus size={18} /> Nueva lista</button>
        </nav>
      </div>

      {/* WIDGET INFERIOR */}
      {widget === 'random' && (
        <div className={styles.sideRandom}>
          <h4 className={styles.sideRandomTitle}>¿No sabes qué jugar?</h4>
          <p className={styles.sideRandomSub}>Deja que el azar elija tu próxima aventura</p>
          <div className={styles.sideDice}>🎲</div>
          <button className={styles.sideRandomBtn} onClick={onRandomGame}>
            🚀 JUEGO AL AZAR
          </button>
        </div>
      )}

      {widget === 'motivation' && (
        <div className={styles.sideMotivation}>
          <h4 className={styles.sideMotivationTitle}>¡Sigue completando!</h4>
          <p className={styles.sideMotivationSub}>Cada juego completado te acerca a la leyenda.</p>
          <div className={styles.sideTrophy}>🏆</div>
          <button className={styles.sideMotivationBtn}>Ver mis logros</button>
        </div>
      )}

    </aside>
  )
}

export default AppSidebar
