import styles from './FilterBar.module.css'

function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange }) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.label}>FILTRAR</span>
        <div className={styles.filters}>
          <button
            className={`${styles.btn} ${activeFilter === 'all' ? styles.active : ''}`}
            onClick={() => onFilterChange('all')}
          >
            TODOS
          </button>
          <button
            className={`${styles.btn} ${activeFilter === 'sagas' ? styles.active : ''}`}
            onClick={() => onFilterChange('sagas')}
          >
            SAGAS
          </button>
          <button
            className={`${styles.btn} ${activeFilter === 'singles' ? styles.active : ''}`}
            onClick={() => onFilterChange('singles')}
          >
            JUEGO ÚNICO
          </button>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="Buscar juego..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>
    </div>
  )
}

export default FilterBar