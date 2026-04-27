import { useGames } from './features/games/hooks/useGames'
import { useFilters } from './features/filters/hooks/useFilters'
import { useState } from 'react'
import AddGameModal from './features/games/components/AddGameModal'
import AppHeader from './components/layout/AppHeader'
import FilterBar from './features/filters/components/FilterBar'
import GameGrid from './features/games/components/GameGrid'
import InProgressSection from './features/games/components/InProgressSection'
import HallOfFameSection from './features/games/components/HallOfFameSection'
import RandomButton from './components/ui/RandomButton'
import SuggestedGameModal from './components/ui/SuggestedGameModal'
import styles from './styles/App.module.css'

function App() {
  const {
    libraryGames,
    inProgressGames,
    completedGames,
    sagas,
    suggestedGame,
    pickRandomGame,
    dismissSuggestion,
    startPlaying,
    completeGame,
    returnToLibrary,
    addSingleGame,
    addEntryToSaga,
    addNewSaga,
    updateSingleGame,
    updateSagaEntry,
    updateSaga,
    deleteSingleGame,
    deleteSagaEntry,
    deleteSaga,
    updateSagaCover,
    updateEntryCover
  } = useGames()

  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filterGames
  } = useFilters()

  const [showAddGame, setShowAddGame] = useState(false)
  const [editModal, setEditModal] = useState(null)

  const librarySingles = libraryGames.filter(g => !g.isSagaEntry)
  const { filteredSingles, filteredSagas } = filterGames(librarySingles, sagas)

  // -- Handlers de edición --
  function handleEditSingle(game) {
    setEditModal({ type: 'single', data: { type: 'single', game } })
  }
  function handleEditEntry(sagaId, entry) {
    setEditModal({ type: 'entry', data: { type: 'entry', sagaId, entry } })
  }
  function handleEditSaga(saga) {
    setEditModal({ type: 'saga', data: { type: 'saga', saga } })
  }

  // -- Handlers de eliminación --
  function handleDeleteSingle(game) {
    if (window.confirm(`¿Eliminar "${game.title}"?`)) deleteSingleGame(game.id)
  }
  function handleDeleteEntry(sagaId, entryId) {
    if (window.confirm('¿Eliminar esta entrega de la saga?')) deleteSagaEntry(sagaId, entryId)
  }
  function handleDeleteSaga(sagaId) {
    if (window.confirm('¿Eliminar toda la saga y sus entregas?')) deleteSaga(sagaId)
  }

  // -- Stats para el sidebar --
  const totalGames = libraryGames.length + inProgressGames.length + completedGames.length
  const libraryPct  = totalGames > 0 ? Math.round((libraryGames.length  / totalGames) * 100) : 0
  const progressPct = totalGames > 0 ? Math.round((inProgressGames.length / totalGames) * 100) : 0
  const famePct     = totalGames > 0 ? Math.round((completedGames.length  / totalGames) * 100) : 0

  return (
    <div className={styles.appRoot}>

      {/* ── HEADER FIJO ── */}
      <AppHeader
        totalGames={totalGames}
        inProgress={inProgressGames.length}
        completed={completedGames.length}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className={styles.layout}>

        {/* ══ COLUMNA IZQUIERDA (contenido principal) ══ */}
        <main className={styles.mainContent}>

          {/* HERO — bienvenida + KPIs */}
          <section className={styles.hero}>
            <div className={styles.heroText}>
              <p className={styles.heroGreeting}>Bienvenido de vuelta,</p>
              <h1 className={styles.heroName}>GamerXX <span>👋</span></h1>
              <p className={styles.heroTagline}>Organiza, juega y celebra cada aventura.</p>
            </div>
            <div className={styles.kpis}>
              <div className={styles.kpiCard}>
                <span className={styles.kpiIcon}>📊</span>
                <span className={styles.kpiValue}>{totalGames}</span>
                <span className={styles.kpiLabel}>Juegos totales</span>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiIcon}>🎮</span>
                <span className={styles.kpiValue}>{inProgressGames.length}</span>
                <span className={styles.kpiLabel}>En progreso</span>
              </div>
              <div className={styles.kpiCard}>
                <span className={styles.kpiIcon}>🏆</span>
                <span className={styles.kpiValue}>{completedGames.length}</span>
                <span className={styles.kpiLabel}>Completados</span>
              </div>
            </div>
          </section>

          {/* TU PROGRESO — scroll horizontal */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionAccent} />
                Tu progreso
              </h2>
              <button className={styles.seeAll}>Ver todos →</button>
            </div>
            <InProgressSection
              games={inProgressGames}
              onComplete={completeGame}
              horizontal
            />
          </section>

          {/* BIBLIOTECA — scroll horizontal */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionAccent} style={{ background: 'var(--accent)' }} />
                Biblioteca
                <span className={styles.sectionSub}>(Pendientes por jugar)</span>
              </h2>
              <div className={styles.sectionActions}>
                <button
                  className={styles.addBtn}
                  onClick={() => setShowAddGame(true)}
                >
                  + Agregar juego
                </button>
                <button className={styles.seeAll}>Ver todos →</button>
              </div>
            </div>

            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <GameGrid
              games={filteredSingles}
              sagas={filteredSagas}
              onStartPlaying={startPlaying}
              onEdit={handleEditSingle}
              onDelete={handleDeleteSingle}
              onEditSaga={handleEditSaga}
              onDeleteSaga={handleDeleteSaga}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
              onUpdateSagaCover={updateSagaCover}
              onUpdateEntryCover={updateEntryCover}
            />
          </section>

          {/* SALÓN DE LA FAMA */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionAccent} style={{ background: 'var(--state-fame)' }} />
                Salón de la Fama
              </h2>
            </div>
            <HallOfFameSection
              games={completedGames}
              onReturnToLibrary={returnToLibrary}
            />
          </section>

        </main>

        {/* ══ SIDEBAR DERECHO ══ */}
        <aside className={styles.sidebar}>

          {/* Resumen / gráfica dona (placeholder) */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>
              <span>📊</span> Resumen de tu colección
            </h3>
            <div className={styles.donutPlaceholder}>
              <span className={styles.donutCenter}>{totalGames}<br /><small>Juegos</small></span>
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--accent)' }} />
                <span>Biblioteca</span>
                <span className={styles.legendVal}>{libraryGames.length} ({libraryPct}%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--accent-2)' }} />
                <span>En progreso</span>
                <span className={styles.legendVal}>{inProgressGames.length} ({progressPct}%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--state-fame)' }} />
                <span>Salón de la fama</span>
                <span className={styles.legendVal}>{completedGames.length} ({famePct}%)</span>
              </div>
            </div>
          </div>

          {/* Juego al Azar */}
          <div className={styles.sideCard}>
            <h3 className={styles.randomTitle}>¿No sabes qué jugar?</h3>
            <p className={styles.randomSub}>Deja que el azar elija tu próxima aventura.</p>
            <div className={styles.diceWrapper}>🎲</div>
            <RandomButton onClick={pickRandomGame} />
          </div>

          {/* Actividad reciente (placeholder) */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>
              <span>⚡</span> Actividad reciente
            </h3>
            <div className={styles.activityList}>
              {completedGames.slice(0, 3).map(game => (
                <div key={game.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>🏆</div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityGame}>{game.title}</span>
                    <span className={styles.activityMeta}>Completado</span>
                  </div>
                </div>
              ))}
              {inProgressGames.slice(0, 2).map(game => (
                <div key={game.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>🎮</div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityGame}>{game.title}</span>
                    <span className={styles.activityMeta}>En progreso</span>
                  </div>
                </div>
              ))}
              {completedGames.length === 0 && inProgressGames.length === 0 && (
                <p className={styles.emptyActivity}>Sin actividad aún.</p>
              )}
            </div>
          </div>

        </aside>
      </div>

      {/* ── MODALES ── */}
      <SuggestedGameModal
        game={suggestedGame}
        onConfirm={startPlaying}
        onDismiss={pickRandomGame}
        onClose={dismissSuggestion}
      />

      {showAddGame && (
        <AddGameModal
          onClose={() => setShowAddGame(false)}
          onAddSingle={addSingleGame}
          onAddToSaga={addEntryToSaga}
          onAddNewSaga={addNewSaga}
          existingSagas={sagas}
        />
      )}

      {editModal && (
        <AddGameModal
          onClose={() => setEditModal(null)}
          onAddSingle={addSingleGame}
          onAddToSaga={addEntryToSaga}
          onAddNewSaga={addNewSaga}
          onUpdateSingle={updateSingleGame}
          onUpdateEntry={updateSagaEntry}
          onUpdateSaga={updateSaga}
          existingSagas={sagas}
          editMode={true}
          editData={editModal.data}
        />
      )}
    </div>
  )
}

export default App
