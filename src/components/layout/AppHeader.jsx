import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
// 1. Importa los iconos de Lucide
import { House, LayoutGrid, Gamepad2, Trophy, Search, Bell, ChevronDown } from 'lucide-react'
import styles from './Header.module.css'

// 2. Asigna los componentes a la propiedad icon (sin comillas)
const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: House, path: '/' },
  { id: 'biblioteca', label: 'Biblioteca', icon: LayoutGrid, path: '/biblioteca' },
  { id: 'progreso', label: 'En progreso', icon: Gamepad2, path: '/en-progreso' },
  { id: 'fama', label: 'Salón de la fama', icon: Trophy, path: '/salon' },
]

function AppHeader({ searchQuery, onSearch }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* ... (LogoBlock se mantiene igual) ... */}
        <div className={styles.logoBlock} onClick={() => navigate('/')}>
          <div className={styles.logoIcon}>
            <img src="/src/assets/vault-logo.png" alt="logo" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoMy}>My</span>
            <span className={styles.logoGame}> Game_</span>
            <span className={styles.logoVault}>Vault</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(item => {
            // 3. Extraemos el icono en una variable con Mayúscula
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${location.pathname === item.path ? styles.navActive : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className={styles.navIcon}>
                  {/* 4. Renderizamos como componente */}
                  <IconComponent size={18} strokeWidth={2} />
                </span>
                {item.label}
                {location.pathname === item.path && <span className={styles.navUnderline} />}
              </button>
            );
          })}
        </nav>

        <div className={styles.right}>
          <div className={styles.searchBox}>
            {/* Reemplazo de emoji por Lucide */}
            <Search size={16} className={styles.searchIcon} />
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
            {/* Reemplazo de caret flecha */}
            <ChevronDown size={14} />
            <span className={styles.onlineDot} />
          </div>
        </div>

      </div>
    </header>
  )
}

export default AppHeader
