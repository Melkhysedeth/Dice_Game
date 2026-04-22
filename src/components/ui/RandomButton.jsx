import styles from './RandomButton.module.css'

function RandomButton({ onClick }) {
  return (
    <button className={styles.btn} onClick={onClick}>
      <span className={styles.icon}>▶</span>
      <span className={styles.label}>Elegir Juego</span>
    </button>
  )
}

export default RandomButton