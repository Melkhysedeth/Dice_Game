import { useGames } from './features/games/hooks/useGames'
import { useFilters } from './features/filters/hooks/useFilters'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import StartView from './features/games/views/StartView'
import AddGameModal from './features/games/components/AddGameModal'
import AppHeader from './components/layout/AppHeader'
import SuggestedGameModal from './components/ui/SuggestedGameModal'
import styles from './styles/App.module.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import HomeView from './features/games/views/HomeView'
import LibraryView from './features/games/views/LibraryView'
import InProgressView from './features/games/views/InProgressView'
import HallOfFameView from './features/games/views/HallOfFameView'

function App() {
  const {
    libraryGames,
    inProgressGames,
    completedGames,
    sagas,
    suggestedGame,
    singles,
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
    updateEntryCover,
    addEmptySaga
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
  const navigate = useNavigate()
  const [pendingSaga, setPendingSaga] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const librarySingles = libraryGames.filter(g => !g.isSagaEntry)
  const { filteredSingles, filteredSagas } = filterGames(librarySingles, sagas)

  // -- Stats para el sidebar --
  const totalGames = libraryGames.length + inProgressGames.length + completedGames.length
  const libraryPct = totalGames > 0 ? Math.round((libraryGames.length / totalGames) * 100) : 0
  const progressPct = totalGames > 0 ? Math.round((inProgressGames.length / totalGames) * 100) : 0
  const famePct = totalGames > 0 ? Math.round((completedGames.length / totalGames) * 100) : 0

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

  const donutData = [
    { name: 'Biblioteca', value: libraryGames.length || 1, color: 'var(--accent)' },
    { name: 'En progreso', value: inProgressGames.length || 0, color: 'var(--accent-2)' },
    { name: 'Salón de la fama', value: completedGames.length || 0, color: 'var(--state-fame)' },
  ]

  return (
    <div className={styles.appRoot}>

      {/* Header con búsqueda global */}
      <AppHeader
        onLogout={() => { setIsLoggedIn(false); navigate('/start') }}
        libraryGames={libraryGames}
        inProgressGames={inProgressGames}
        completedGames={completedGames}
        sagas={sagas}
      />

      <Routes>
        {/* ── START / LANDING ── */}
        <Route path="/start" element={<StartView onLogin={() => { setIsLoggedIn(true); navigate('/') }} />} />

        {/* ── HOME ── */}
        <Route path="/" element={
          isLoggedIn
            ? <HomeView
              libraryGames={libraryGames}
              inProgressGames={inProgressGames}
              completedGames={completedGames}
              filteredSingles={filteredSingles}
              filteredSagas={filteredSagas}
              totalGames={totalGames}
              libraryPct={libraryPct}
              progressPct={progressPct}
              famePct={famePct}
              donutData={donutData}
              onComplete={completeGame}
              onStartPlaying={startPlaying}
              onRandomGame={pickRandomGame}
              onNavigateToSaga={(saga) => {
                setPendingSaga(saga)
                navigate('/biblioteca')
              }}
            />
            : <Navigate to="/start" replace />
        } />

        {/* ── BIBLIOTECA ── */}
        <Route path="/biblioteca" element={
          <LibraryView
            games={libraryGames.filter(g => !g.isSagaEntry)}
            sagas={sagas}
            onStartPlaying={startPlaying}
            onEdit={handleEditSingle}
            onDelete={handleDeleteSingle}
            onEditSaga={handleEditSaga}
            onDeleteSaga={handleDeleteSaga}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onUpdateSagaCover={updateSagaCover}
            onUpdateEntryCover={updateEntryCover}
            onAddGame={() => setShowAddGame(true)}
            onRandomGame={pickRandomGame}
            pendingSaga={pendingSaga}
            onPendingSagaConsumed={() => setPendingSaga(null)}
            onAddEmptySaga={addEmptySaga}
            onAddToSaga={addEntryToSaga}
            inProgressCount={inProgressGames.length}
            completedCount={completedGames.length}
          />
        } />

        {/* ── EN PROGRESO ── */}
        <Route path="/en-progreso" element={
          <InProgressView
            games={inProgressGames}
            onComplete={completeGame}
            onRandomGame={pickRandomGame}
            libraryCount={libraryGames.filter(g => !g.isSagaEntry).length + sagas.length}
            completedCount={completedGames.length}
          />
        } />

        {/* ── SALÓN DE LA FAMA ── */}
        <Route path="/salon" element={
          <HallOfFameView
            games={completedGames}
            onReturnToLibrary={returnToLibrary}
            onRandomGame={pickRandomGame}
            libraryCount={libraryGames.filter(g => !g.isSagaEntry).length + sagas.length}
            inProgressCount={inProgressGames.length}
          />
        } />

      </Routes>

      {/* MODALES — fuera de Routes para que estén disponibles en todas las vistas */}
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
          onAddEmptySaga={addEmptySaga}
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