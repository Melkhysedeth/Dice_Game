import { useNavigate } from 'react-router-dom'
import { House, LibraryBigIcon, Gamepad2, Trophy, Dices, Star, Clock, Users, Plus } from 'lucide-react'
import styles from './AppSidebar.module.css'
import { useState, useRef } from 'react'
import { PanelLeftOpen, Pin, PanelLeftClose } from 'lucide-react'
import { useSidebar } from '../../context/SidebarContext' // ajusta la ruta según tu estructura

/* ── Ítem de navegación reutilizable ── */
function SideNavItem({ icon, label, expanded, active, activeClass, badge, badgeClass, onClick }) {
  return (
    <button
      className={`${styles.sideNavItem} ${active ? activeClass : ''}`}
      onClick={onClick}
      title={!expanded ? label : undefined}
    >
      <span className={styles.sideNavIcon}>{icon}</span>
      {expanded && <span className={styles.sideNavLabel}>{label}</span>}
      {expanded && badge !== undefined && (
        <span className={badgeClass}>{badge}</span>
      )}
    </button>
  )
}

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
  const { sidebarMode, setSidebarMode } = useSidebar()

  // hovered solo aplica cuando el modo es 'hover'
  const [hovered, setHovered] = useState(false)
  const hoverTimeout = useRef(null)

  // La sidebar se ve expandida si:
  // - modo 'expanded' (pinned)
  // - modo 'hover' Y el mouse está encima
  const expanded = sidebarMode === 'expanded' || (sidebarMode === 'hover' && hovered)

  function handleMouseEnter() {
    if (sidebarMode === 'hover') {
      clearTimeout(hoverTimeout.current)
      setHovered(true)
    }
  }

  function handleMouseLeave() {
    if (sidebarMode === 'hover') {
      hoverTimeout.current = setTimeout(() => setHovered(false), 150)
    }
  }

  // Ciclo de modos al hacer click en el botón pin:
  // collapsed → hover → expanded → collapsed → ...
  function cycleSidebarMode() {
    setSidebarMode(current => {
      if (current === 'collapsed') return 'hover'
      if (current === 'hover') return 'expanded'
      return 'collapsed'
    })
    setHovered(false)
  }

  // Ícono y tooltip del botón según el modo actual (muestra a dónde va al hacer click)
  const pinLabel = {
    collapsed: 'Activar hover (click para fijar)',
    hover: 'Fijar sidebar abierta',
    expanded: 'Colapsar sidebar',
  }[sidebarMode]

  const pinIcon = {
    collapsed: <PanelLeftOpen size={16} />,   // colapsado → puede expandir
    hover: <Pin size={16} />,              // hover → puede fijar
    expanded: <PanelLeftClose size={16} />,  // expandido → puede cerrar
  }[sidebarMode]

  /* ── Genre Dropdown (solo visible cuando expanded) ── */
  function GenreDropdown({ allGenres, genreStats, totalAll, activeGenre, onSelect }) {
    const [open, setOpen] = useState(false)
    const activeLabel = activeGenre === 'Todos' ? 'Todos' : activeGenre
    const activeCount = activeGenre === 'Todos' ? totalAll : (genreStats[activeGenre] || 0)

    return (
      <div className={styles.genreDropdown}>
        {expanded && <span className={styles.sideSectionTitle}>GÉNEROS</span>}
        <button
          className={styles.genreDropdownTrigger}
          onClick={() => setOpen(o => !o)}
          title={!expanded ? activeLabel : undefined}
        >
          <span className={styles.genreDropdownLabel}>
            <span className={styles.genreDropdownDot} />
            {expanded && (
              <>
                {activeLabel}
                <span className={styles.genreDropdownCount}>{activeCount}</span>
              </>
            )}
          </span>
          {expanded && (
            <span className={`${styles.genreDropdownArrow} ${open ? styles.genreDropdownArrowOpen : ''}`}>▾</span>
          )}
        </button>

        {open && expanded && (
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
    <aside
      className={`
    ${styles.sidebar}
    ${sidebarMode === 'expanded' ? styles.sidebarExpanded : ''}
    ${sidebarMode === 'collapsed' ? styles.sidebarCollapsed : ''}
    ${sidebarMode === 'hover' && !expanded ? styles.sidebarCollapsed : ''}
    ${sidebarMode === 'hover' && expanded ? styles.sidebarHoverExpanded : ''}
  `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      {/* ── BOTÓN PIN con 3 modos ── */}
      <div className={styles.pinRow}>
        <button
          className={`${styles.pinBtn} ${sidebarMode === 'expanded' ? (
            activeRoute === 'biblioteca' ? styles.pinBtnActiveLibrary :
              activeRoute === 'en-progreso' ? styles.pinBtnActiveProgress :
                activeRoute === 'salon' ? styles.pinBtnActiveFame :
                  styles.pinBtnActiveLibrary
          ) : ''}`}
          onClick={cycleSidebarMode}
          title={pinLabel}
        >
          <span className={styles.pinModeIndicator} data-mode={sidebarMode}>
            {pinIcon}
          </span>
        </button>
      </div>

      {/* ── NAVEGACIÓN ── */}
      <div className={styles.sideSection}>
        {expanded && <span className={styles.sideSectionTitle}>NAVEGACIÓN</span>}
        <nav className={styles.sideNav}>
          <SideNavItem
            icon={<House size={20} />} label="Inicio"
            expanded={expanded} onClick={() => navigate('/')}
          />
          <SideNavItem
            icon={<LibraryBigIcon size={20} />} label="Biblioteca"
            expanded={expanded} active={activeRoute === 'biblioteca'}
            activeClass={styles.sideNavLibrary}
            badge={libraryCount} badgeClass={styles.sideNavBadge}
            onClick={() => navigate('/biblioteca')}
          />
          <SideNavItem
            icon={<Gamepad2 size={20} />} label="En Progreso"
            expanded={expanded} active={activeRoute === 'en-progreso'}
            activeClass={styles.sideNavInProgress}
            badge={inProgressCount} badgeClass={styles.sideNavBadgeOrange}
            onClick={() => navigate('/en-progreso')}
          />
          <SideNavItem
            icon={<Trophy size={20} />} label="Salón de la Fama"
            expanded={expanded} active={activeRoute === 'salon'}
            activeClass={styles.sideNavHallOfFame}
            badge={completedCount} badgeClass={styles.sideNavBadgeGold}
            onClick={() => navigate('/salon')}
          />
          <SideNavItem
            icon={<Dices size={20} />} label="Juegos al azar"
            expanded={expanded} onClick={onRandomGame}
          />
        </nav>
      </div>

      {/* ── GÉNEROS ── */}
      {genreProps && (
        <div className={styles.sideSection}>
          <GenreDropdown {...genreProps} />
        </div>
      )}

      {/* ── LISTAS ── */}
      <div className={styles.sideSection}>
        {expanded && <span className={styles.sideSectionTitle}>LISTAS</span>}
        <nav className={styles.sideNav}>
          <SideNavItem icon={<Star size={18} />} label="Favoritos" expanded={expanded} />
          <SideNavItem icon={<Clock size={18} />} label="Juegos cortos" expanded={expanded} />
          <SideNavItem icon={<Users size={18} />} label="Cooperativos" expanded={expanded} />
          <SideNavItem icon={<Plus size={18} />} label="Nueva lista" expanded={expanded} />
        </nav>
      </div>

      {/* ── WIDGET INFERIOR ── */}
      {widget === 'random' && expanded && (
        <div className={styles.sideRandom}>
          <h4 className={styles.sideRandomTitle}>¿No sabes qué jugar?</h4>
          <p className={styles.sideRandomSub}>Deja que el azar elija tu próxima aventura</p>
          <div className={styles.sideDice}>🎲</div>
          <button className={styles.sideRandomBtn} onClick={onRandomGame}>
            🚀 JUEGO AL AZAR
          </button>
        </div>
      )}

      {widget === 'motivation' && expanded && (
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