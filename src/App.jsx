import { useGamesSupabase as useGames } from './features/games/hooks/useGamesSupabase'
import { useFilters } from './features/filters/hooks/useFilters'
import { useState, useEffect } from 'react'
import { useAuth } from './lib/useAuth'
import { Navigate, Routes, Route, useNavigate } from 'react-router-dom'
import StartView from './features/games/views/StartView'
import AddGameModal from './features/games/components/AddGameModal'
import AppHeader from './components/layout/AppHeader'
import SuggestedGameModal from './components/ui/SuggestedGameModal'
import styles from './styles/App.module.css'
import HomeView from './features/games/views/HomeView'
import LibraryView from './features/games/views/LibraryView'
import InProgressView from './features/games/views/InProgressView'
import HallOfFameView from './features/games/views/HallOfFameView'
import { SidebarProvider } from './context/SidebarContext'

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
    moveGameToSaga,
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
  const [successMsg, setSuccessMsg] = useState(null)
  const { user, loading, loginWithEmail, loginWithOAuth, logout, registerWithEmail } = useAuth()
  const librarySingles = libraryGames.filter(g => !g.isSagaEntry)
  const { filteredSingles, filteredSagas } = filterGames(librarySingles, sagas)

  const totalGames = libraryGames.length + inProgressGames.length + completedGames.length
  const libraryPct = totalGames > 0 ? Math.round((libraryGames.length / totalGames) * 100) : 0
  const progressPct = totalGames > 0 ? Math.round((inProgressGames.length / totalGames) * 100) : 0
  const famePct = totalGames > 0 ? Math.round((completedGames.length / totalGames) * 100) : 0

  function handleEditSingle(game) {
    setEditModal({ type: 'single', data: { type: 'single', game: { ...game, isSagaEntry: !!game.isSagaEntry, sagaId: game.sagaId ?? null } } })
  }
  function handleEditEntry(sagaId, entry) {
    setEditModal({ type: 'single', data: { type: 'single', game: { ...entry, isSagaEntry: true, sagaId } } })
  }
  function handleEditSaga(saga) {
    setEditModal({ type: 'saga', data: { type: 'saga', saga } })
  }

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
    // 👇 SidebarProvider envuelve TODO — así todas las vistas comparten el mismo estado
    <SidebarProvider>
      <div className={styles.appRoot}>

        <AppHeader
          onLogout={async () => { await logout(); navigate('/start') }}
          libraryGames={libraryGames}
          inProgressGames={inProgressGames}
          completedGames={completedGames}
          sagas={sagas}
        />

        <Routes>
          <Route
            path="/start"
            element={
              user
                ? <Navigate to="/" replace />
                : <StartView
                  onLoginWithEmail={loginWithEmail}
                  onLoginWithOAuth={loginWithOAuth}
                  onRegisterWithEmail={registerWithEmail}
                />
            }
          />

          <Route path="/" element={
            loading ? null : user
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
                currentUser={user}
                onNavigateToSaga={(saga) => {
                  setPendingSaga(saga)
                  navigate('/biblioteca')
                }}
              />
              : <Navigate to="/start" replace />
          } />

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

          <Route path="/en-progreso" element={
            <InProgressView
              games={inProgressGames}
              onComplete={completeGame}
              onRandomGame={pickRandomGame}
              libraryCount={libraryGames.filter(g => !g.isSagaEntry).length + sagas.length}
              completedCount={completedGames.length}
              onEdit={handleEditSingle}
              onDelete={handleDeleteSingle}
            />
          } />

          <Route path="/salon" element={
            <HallOfFameView
              games={completedGames}
              onReturnToLibrary={returnToLibrary}
              onRandomGame={pickRandomGame}
              libraryCount={libraryGames.filter(g => !g.isSagaEntry).length + sagas.length}
              inProgressCount={inProgressGames.length}
              onEdit={handleEditSingle}
              onDelete={handleDeleteSingle}
            />
          } />
        </Routes>

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
            successMsg={successMsg}
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
            onMoveToSaga={moveGameToSaga}
            onSuccess={(msg) => {
              setEditModal(null)
              setSuccessMsg(msg)
              setTimeout(() => setSuccessMsg(null), 3000)
            }}
          />
        )}

        {successMsg && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            background: '#22c55e', color: '#fff',
            padding: '12px 20px', borderRadius: 10,
            fontWeight: 600, fontSize: '0.9rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
          }}>
            ✅ {successMsg}
          </div>
        )}

      </div>
    </SidebarProvider>
  )
}

export default App