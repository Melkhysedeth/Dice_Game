import { useState } from 'react'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: '⌂' },
  { id: 'biblioteca', label: 'Biblioteca', icon: '▦' },
  { id: 'progreso', label: 'En progreso', icon: '◉' },
  { id: 'fama', label: 'Salón de la fama', icon: '✦' },
]

function AppHeader({ searchQuery, onSearch }) {
  const [activeNav, setActiveNav] = useState('inicio')

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* LOGO */}
        <div className={styles.logoBlock}>
          <div className={styles.logoIcon}>
            <span className={styles.logoIconGlyph}>⚙</span>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMy}>My</span>
            <span className={styles.logoGame}> Game</span>
            <span className={styles.logoUnderscore}>_</span>
            <span className={styles.logoVault}>Vault</span>
          </div>
        </div>

        {/* NAV */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeNav === item.id ? styles.navActive : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              {activeNav === item.id && <span className={styles.navUnderline} />}
            </button>
          ))}
        </nav>

        {/* DERECHA: buscador + campana + perfil */}
        <div className={styles.right}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar juegos..."
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
            />
            <span className={styles.searchShortcut}>Ctrl K</span>
          </div>

          <button className={styles.iconBtn}>
            <span className={styles.bellIcon}>🔔</span>
            <span className={styles.notifDot} />
          </button>

          <div className={styles.profile}>
            <div className={styles.avatar}>GX</div>
            <span className={styles.profileName}>GamerXX</span>
            <span className={styles.profileCaret}>▾</span>
            <span className={styles.onlineDot} />
          </div>
        </div>

      </div>
    </header>
  )
}

export default AppHeader