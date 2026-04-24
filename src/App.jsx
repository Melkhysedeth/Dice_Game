import { useGames } from './features/games/hooks/useGames'
import { useFilters } from './features/filters/hooks/useFilters'
import { useState } from 'react'
import AddGameModal from './features/games/components/AddGameModal'
import Header from './components/layout/Header'
import FilterBar from './features/filters/components/FilterBar'
import GameGrid from './features/games/components/GameGrid'
import InProgressSection from './features/games/components/InProgressSection'
import HallOfFameSection from './features/games/components/HallOfFameSection'
import appStyles from './styles/App.module.css'
import RandomButton from './components/ui/RandomButton'
import SuggestedGameModal from './components/ui/SuggestedGameModal'

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
    deleteSaga
  } = useGames()

  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filterGames
  } = useFilters()

  const [showAddGame, setShowAddGame] = useState(false)
  const librarySingles = libraryGames.filter(g => !g.isSagaEntry)
  const { filteredSingles, filteredSagas } = filterGames(librarySingles, sagas)
  const [editModal, setEditModal] = useState(null)

  function handleEditSingle(game) {
    setEditModal({ type: 'single', data: { type: 'single', game } })
  }

  function handleEditEntry(sagaId, entry) {
    setEditModal({ type: 'entry', data: { type: 'entry', sagaId, entry } })
  }

  function handleEditSaga(saga) {
    setEditModal({ type: 'saga', data: { type: 'saga', saga } })
  }

  function handleDeleteSingle(game) {
    if (window.confirm(`¿Eliminar "${game.title}"?`)) {
      deleteSingleGame(game.id)
    }
  }

  function handleDeleteEntry(sagaId, entryId) {
    if (window.confirm('¿Eliminar esta entrega de la saga?')) {
      deleteSagaEntry(sagaId, entryId)
    }
  }

  function handleDeleteSaga(sagaId) {
    if (window.confirm('¿Eliminar toda la saga y sus entregas?')) {
      deleteSaga(sagaId)
    }
  }

  return (
    <div>
      <Header
        totalGames={libraryGames.length}
        inProgress={inProgressGames.length}
        completed={completedGames.length}
      />

      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main>
        <section className={appStyles.librarySection}>
          <div className={appStyles.libraryHeader}>
            <h2 className={appStyles.libraryTitle}>BIBLIOTECA</h2>
            <div className={appStyles.libraryActions}>
              <button
                className={appStyles.addBtn}
                onClick={() => setShowAddGame(true)}
              >
                + AGREGAR JUEGO
              </button>
              <span className={appStyles.libraryCount}>
                {filteredSingles.length + filteredSagas.length} juegos
              </span>
            </div>
          </div>

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
          />
        </section>

        <InProgressSection
          games={inProgressGames}
          onComplete={completeGame}
        />

        <HallOfFameSection
          games={completedGames}
          onReturnToLibrary={returnToLibrary}
        />
      </main>

      <RandomButton onClick={pickRandomGame} />

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