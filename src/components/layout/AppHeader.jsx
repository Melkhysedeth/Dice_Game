import styles from './Header.module.css'

function Header({ totalGames, inProgress, completed }) {
  return (
  <header className={styles.header}>
    <div className={styles.inner}>
      <div className={styles.left}>
        <div className={styles.logo}>
          GAME<span className={styles.logoAccent}>VAULT</span>
        </div>
        <div className={styles.tagline}>Tu biblioteca personal de juegos</div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{totalGames}</span>
          <span className={styles.statLabel}>Títulos</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{inProgress}</span>
          <span className={styles.statLabel}>En Progreso</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{completed}</span>
          <span className={styles.statLabel}>Completados</span>
        </div>
      </div>
    </div>
  </header>
)
}

export default Header