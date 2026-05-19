import styles from './Footer.module.css'
import { SiSteam } from 'react-icons/si'
import { FaPlaystation, FaXbox, FaGamepad } from 'react-icons/fa'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* IZQUIERDA: logo + tagline */}
        <div className={styles.brand}>
          <img src="/src/assets/vault-logo.png" alt="My Game Quest" className={styles.logo} />
          <p className={styles.tagline}>
            Tu biblioteca. Tu historia.<br />
            Tus aventuras. Tu destino.
          </p>
        </div>

        {/* CENTRO: copyright */}
        <div className={styles.copy}>
          <p className={styles.copyTitle}>© 2026 <strong>MyGame_Quest</strong></p>
          <p className={styles.copySub}>Todos los derechos reservados.</p>
        </div>

        {/* DERECHA: plataformas */}
        <div className={styles.platforms}>
          <div className={styles.platform}>
            <SiSteam size={18} /> <span>Steam</span>
          </div>
          <div className={styles.platform}>
            <FaXbox size={18} /> <span>Xbox</span>
          </div>
          <div className={styles.platform}>
            <FaPlaystation size={18} /> <span>PlayStation</span>
          </div>
          <div className={styles.platform}>
            <FaGamepad size={18} /> <span>Nintendo</span>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer