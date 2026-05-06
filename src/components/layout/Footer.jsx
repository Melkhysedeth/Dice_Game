import styles from './Footer.module.css'
import {
  LayoutGrid, Gamepad2, Trophy, Dices, Star, ThumbsUp,
  User, BarChart2, FolderOpen, List, Settings, LogOut,
  Info, HelpCircle, FileText, Headphones, Mail, Lock
} from 'lucide-react'

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
        </div>

        {/* EXPLORA */}
        <div className={styles.col}>
          <h4 className={`${styles.colTitle} ${styles.colTitleBlue}`}>Explora</h4>
          <div className={styles.colUnderline} style={{ background: '#00d4ff' }} />
          <ul className={styles.colList}>
            <li><LayoutGrid size={15} /> Biblioteca</li>
            <li><Gamepad2 size={15} /> En progreso</li>
            <li><Trophy size={15} /> Salón de la fama</li>
            <li><Dices size={15} /> Juegos al azar</li>
            <li><Star size={15} /> Novedades</li>
            <li><ThumbsUp size={15} /> Recomendados</li>
          </ul>
        </div>

        {/* MI CUENTA */}
        <div className={styles.col}>
          <h4 className={`${styles.colTitle} ${styles.colTitleGreen}`}>Mi cuenta</h4>
          <div className={styles.colUnderline} style={{ background: '#22c55e' }} />
          <ul className={styles.colList}>
            <li><User size={15} /> Mi perfil</li>
            <li><BarChart2 size={15} /> Estadísticas</li>
            <li><FolderOpen size={15} /> Colecciones</li>
            <li><List size={15} /> Listas</li>
            <li><Settings size={15} /> Ajustes</li>
            <li><LogOut size={15} /> Cerrar sesión</li>
          </ul>
        </div>

        {/* SOBRE MGV */}
        <div className={styles.col}>
          <h4 className={`${styles.colTitle} ${styles.colTitleYellow}`}>Sobre MGV</h4>
          <div className={styles.colUnderline} style={{ background: '#f5a623' }} />
          <ul className={styles.colList}>
            <li><Info size={15} /> ¿Qué es MGV?</li>
            <li><HelpCircle size={15} /> Cómo funciona</li>
            <li><FileText size={15} /> Blog</li>
            <li><Headphones size={15} /> Soporte</li>
            <li><Mail size={15} /> Contacto</li>
          </ul>
        </div>

        {/* RANDOM */}
        <div className={styles.randomCol}>
          <div className={styles.randomBox}>
            <div className={styles.randomDiceWrap}>
              <div className={styles.randomGlow} />
              <span className={styles.randomDice}>🎲</span>
            </div>
            <h4 className={styles.randomTitle}>¿NO SABES QUÉ JUGAR?</h4>
            <p className={styles.randomSub}>Deja que el azar elija tu próxima aventura.</p>
            <button className={styles.randomBtn} onClick={onRandomGame}>
              <Dices size={16} /> JUEGO AL AZAR
            </button>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <div className={styles.bottomLeft}>
            <Lock size={13} />
            <span>© 2026 <strong>My Game_Vault</strong> · Todos los derechos reservados.</span>
            <span className={styles.sep}>|</span>
            <a href="#" className={styles.bottomLink}>Términos de uso</a>
            <span className={styles.sep}>|</span>
            <a href="#" className={styles.bottomLink}>Política de privacidad</a>
          </div>
          <div className={styles.bottomRight}>
            <span className={styles.followText}>Síguenos en</span>
            <a href="#" className={`${styles.social} ${styles.facebook}`}>f</a>
            <a href="#" className={`${styles.social} ${styles.twitter}`}>𝕏</a>
            <a href="#" className={`${styles.social} ${styles.twitch}`}>tw</a>
            <a href="#" className={`${styles.social} ${styles.youtube}`}>▶</a>
          </div>
        </div>
      </div>

    </footer>
  )
}

export default Footer