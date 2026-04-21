import styles from './RandomButton.module.css'

function RandomButton({ onClick }) {
  return (
    <button className={styles.btn} onClick={onClick}>
      <span className={styles.dice}>🎲</span>
      <span className={styles.label}>JUEGO ALEATORIO</span>
    </button>
  )
}

export default RandomButton