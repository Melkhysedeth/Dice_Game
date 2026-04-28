import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { id: 'inicio',     label: 'Inicio',           icon: '⌂', path: '/'           },
  { id: 'biblioteca', label: 'Biblioteca',        icon: '▦', path: '/biblioteca' },
  { id: 'progreso',   label: 'En progreso',       icon: '◉', path: '/en-progreso' },
  { id: 'fama',       label: 'Salón de la fama',  icon: '✦', path: '/salon'      },
]

function AppHeader({ searchQuery, onSearch }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        <div className={styles.logoBlock} onClick={() => navigate('/')}>
          <div className={styles.logoIcon}>
            <img
              src="/src/assets/vault-logo.png"
              alt="logo"
              style={{ width: '32px', height: '32px', objectFit: 'cover', objectPosition: 'center 10%', borderRadius: '50%' }}
            />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMy}>My</span>
            <span className={styles.logoGame}> Game</span>
            <span className={styles.logoUnderscore}>_</span>
            <span className={styles.logoVault}>Vault</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${location.pathname === item.path ? styles.navActive : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              {location.pathname === item.path && <span className={styles.navUnderline} />}
            </button>
          ))}
        </nav>

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