import { useNavigate, useLocation } from 'react-router-dom'
import { House, LibraryBigIcon, Gamepad2, Trophy, Bell, ChevronDown } from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: House, path: '/', color: '#f5a623' },
  { id: 'biblioteca', label: 'Biblioteca', icon: LibraryBigIcon, path: '/biblioteca', color: 'var(--accent)' },
  { id: 'progreso', label: 'En Progreso', icon: Gamepad2, path: '/en-progreso', color: 'var(--accent-2)' },
  { id: 'fama', label: 'Salón de la Fama', icon: Trophy, path: '/salon', color: 'var(--state-fame)' },
]

function AppHeader({ libraryGames = [], inProgressGames = [], completedGames = [], sagas = [] }) {
  const navigate = useNavigate()
  const location = useLocation()
  const activeColor = NAV_ITEMS.find(i => i.path === location.pathname)?.color ?? 'var(--accent)'

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* LOGO */}
        <div className={styles.logoBlock} onClick={() => navigate('/')}>
          <div className={styles.logoIcon}>
            <img
              src="/src/assets/vault-logo3.png"
              alt="logo"
              style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMy}>My</span>
            <span className={styles.logoGame}> Game_</span>
            <span className={styles.logoVault} style={{ color: activeColor }}>Vault</span>
          </div>
        </div>

        {/* NAV */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${location.pathname === item.path ? styles.navActive : ''}`}
                onClick={() => navigate(item.path)}>
                <span
                  className={styles.navIcon}
                  style={{ color: location.pathname === item.path ? item.color : 'inherit' }}>
                  <Icon size={20} strokeWidth={2} />
                </span>
                {item.label}
                {location.pathname === item.path && (
                  <span
                    className={styles.navUnderline}
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </button>

            )
          })}
        </nav>

        {/* DERECHA */}
        <div className={styles.right}>
          <GlobalSearch
            libraryGames={libraryGames}
            inProgressGames={inProgressGames}
            completedGames={completedGames}
            sagas={sagas}
          />

          <button className={styles.iconBtn}>
            <Bell size={16} />
            <span className={styles.notifDot} />
          </button>

          <div className={styles.profile}>
            <div className={styles.avatar}>GX</div>
            <span className={styles.profileName}>GamerXX</span>
            <ChevronDown size={14} />
            <span className={styles.onlineDot} />
          </div>
        </div>

      </div>
    </header>
  )
}

export default AppHeader