import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { House, LayoutGrid, Gamepad2, Trophy, Search, Bell, ChevronDown } from 'lucide-react'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { id: 'inicio',    label: 'Inicio',           icon: House,       path: '/' },
  { id: 'biblioteca',label: 'Biblioteca',        icon: LayoutGrid,  path: '/biblioteca' },
  { id: 'progreso',  label: 'En progreso',       icon: Gamepad2,    path: '/en-progreso' },
  { id: 'fama',      label: 'Salón de la fama',  icon: Trophy,      path: '/salon' },
]

// Rutas que tienen su propio sidebar con navegación
const SIDEBAR_ROUTES = ['/biblioteca', '/en-progreso', '/salon']

function AppHeader({ searchQuery, onSearch }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  const hasSidebar = SIDEBAR_ROUTES.includes(location.pathname)

  return (
    <header className={`${styles.header} ${hasSidebar ? styles.headerSlim : ''}`}>
      <div className={styles.inner}>

        {/* LOGO — siempre visible */}
        <div className={styles.logoBlock} onClick={() => navigate('/')}>
          <div className={styles.logoIcon}>
            <img
              src="/src/assets/vault-logo.png"
              alt="logo"
              style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
          {/* En vistas con sidebar ocultamos el texto del logo para ganar espacio */}
          {!hasSidebar && (
            <div className={styles.logoText}>
              <span className={styles.logoMy}>My</span>
              <span className={styles.logoGame}> Game_</span>
              <span className={styles.logoVault}>Vault</span>
            </div>
          )}
        </div>

        {/* NAV — solo en el dashboard */}
        {!hasSidebar && (
          <nav className={styles.nav}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${location.pathname === item.path ? styles.navActive : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className={styles.navIcon}>
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  {item.label}
                  {location.pathname === item.path && <span className={styles.navUnderline} />}
                </button>
              )
            })}
          </nav>
        )}

        {/* BUSCADOR — siempre visible, se expande cuando no hay nav */}
        <div className={`${styles.right} ${hasSidebar ? styles.rightExpanded : ''}`}>
          <div className={`${styles.searchBox} ${hasSidebar ? styles.searchBoxWide : ''}`}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder={hasSidebar ? 'Buscar juegos, sagas, géneros...' : 'Buscar juegos...'}
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
            />
            <span className={styles.searchShortcut}>Ctrl K</span>
          </div>

          <button className={styles.iconBtn}>
            <Bell size={16} />
            <span className={styles.notifDot} />
          </button>

          {/* Icono de estadísticas — solo en vistas internas */}
          {hasSidebar && (
            <button className={styles.iconBtn}>
              <LayoutGrid size={16} />
            </button>
          )}

          <div className={styles.profile}>
            <div className={styles.avatar}>GX</div>
            {!hasSidebar && <span className={styles.profileName}>GamerXX</span>}
            <ChevronDown size={14} />
            <span className={styles.onlineDot} />
          </div>
        </div>

      </div>
    </header>
  )
}

export default AppHeader