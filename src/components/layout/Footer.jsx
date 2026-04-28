import styles from './Footer.module.css'

function Footer({ onRandomGame }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* COLUMNA LOGO */}
        <div className={styles.brand}>
          <img
            src="/src/assets/vault-logo.png"
            alt="My Game Vault"
            className={styles.brandLogo}
            style={{ objectFit: 'cover', objectPosition: 'center 10%' }}
          />
          <div className={styles.brandName}>
            <span className={styles.brandMy}>My </span>
            <span className={styles.brandGame}>Game</span>
            <span className={styles.brandUnderscore}>_</span>
            <span className={styles.brandVault}>Vault</span>
          </div>
          <p className={styles.brandTagline}>
            Tu biblioteca personal de juegos.<br />
            Organiza, juega y celebra cada aventura.
          </p>
          <div className={styles.brandStats}>
            <span className={styles.brandStat}>
              <span className={styles.statIcon}>📊</span> Biblioteca
            </span>
            <span className={styles.brandStat}>
              <span className={styles.statIcon}>🎮</span> En progreso
            </span>
            <span className={styles.brandStat}>
              <span className={styles.statIcon}>🏆</span> Salón de la fama
            </span>
          </div>
        </div>

        {/* EXPLORA */}
        <div className={styles.col}>
          <h4 className={`${styles.colTitle} ${styles.colTitleBlue}`}>Explora</h4>
          <div className={styles.colUnderline} style={{ background: '#00d4ff' }} />
          <ul className={styles.colList}>
            <li><span>▦</span> Biblioteca</li>
            <li><span>◉</span> En progreso</li>
            <li><span>✦</span> Salón de la fama</li>
            <li><span>🎲</span> Juegos al azar</li>
            <li><span>★</span> Novedades</li>
            <li><span>👍</span> Recomendados</li>
          </ul>
        </div>

        {/* MI CUENTA */}
        <div className={styles.col}>
          <h4 className={`${styles.colTitle} ${styles.colTitleGreen}`}>Mi cuenta</h4>
          <div className={styles.colUnderline} style={{ background: '#22c55e' }} />
          <ul className={styles.colList}>
            <li><span>👤</span> Mi perfil</li>
            <li><span>📊</span> Estadísticas</li>
            <li><span>📁</span> Colecciones</li>
            <li><span>☰</span> Listas</li>
            <li><span>⚙</span> Ajustes</li>
            <li><span>↪</span> Cerrar sesión</li>
          </ul>
        </div>

        {/* SOBRE MGV */}
        <div className={styles.col}>
          <h4 className={`${styles.colTitle} ${styles.colTitleYellow}`}>Sobre MGV</h4>
          <div className={styles.colUnderline} style={{ background: '#f5a623' }} />
          <ul className={styles.colList}>
            <li><span>ℹ</span> ¿Qué es MGV?</li>
            <li><span>?</span> Cómo funciona</li>
            <li><span>📄</span> Blog</li>
            <li><span>🎧</span> Soporte</li>
            <li><span>✉</span> Contacto</li>
          </ul>
        </div>

        {/* RANDOM */}
        <div className={styles.randomCol}>
          <div className={styles.randomBox}>
            <span className={styles.randomDice}>🎲</span>
            <h4 className={styles.randomTitle}>¿NO SABES QUÉ JUGAR?</h4>
            <p className={styles.randomSub}>Deja que el azar elija tu próxima aventura.</p>
            <button className={styles.randomBtn} onClick={onRandomGame}>
              <span>🎲</span> JUEGO AL AZAR
            </button>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <div className={styles.bottomLeft}>
            <span className={styles.lockIcon}>🔒</span>
            <span>© 2026 <strong>My Game_Vault</strong> · Todos los derechos reservados.</span>
            <span className={styles.sep}>|</span>
            <a href="#" className={styles.bottomLink}>Términos de uso</a>
            <span className={styles.sep}>|</span>
            <a href="#" className={styles.bottomLink}>Política de privacidad</a>
          </div>
          <div className={styles.bottomRight}>
            <span className={styles.followText}>Síguenos en</span>
            <a href="#" className={`${styles.social} ${styles.discord}`}>Discord</a>
            <a href="#" className={`${styles.social} ${styles.twitter}`}>𝕏</a>
            <a href="#" className={`${styles.social} ${styles.instagram}`}>Ig</a>
            <a href="#" className={`${styles.social} ${styles.youtube}`}>▶</a>
          </div>
        </div>
      </div>

    </footer>
  )
}

export default Footer