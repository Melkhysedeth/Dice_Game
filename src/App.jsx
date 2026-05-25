import { useGamesSupabase as useGames, useGamesSupabase } from './features/games/hooks/useGamesSupabase'
import { useFilters } from './features/filters/hooks/useFilters'
import { useState, useEffect } from 'react'
import { useAuth } from './lib/useAuth'
import { supabase } from './lib/supabase'
import { Navigate, Routes, Route, useNavigate } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext'
import StartView from './features/games/views/StartView'
import AddGameModal from './features/games/components/AddGameModal'
import AppHeader from './components/layout/AppHeader'
import SuggestedGameModal from './components/ui/SuggestedGameModal'
import styles from './styles/App.module.css'
import HomeView from './features/games/views/HomeView'
import LibraryView from './features/games/views/LibraryView'
import InProgressView from './features/games/views/InProgressView'
import HallOfFameView from './features/games/views/HallOfFameView'
import ResetPasswordModal from './components/ui/ResetPasswordModal'
import ProfileView from './features/games/views/ProfileView'
import GameProgressView from './features/games/views/GameProgressView'


function App() {
  const {
    libraryGames,
    inProgressGames,
    completedGames,
    sagas,
    suggestedGame,
    singles,
    loadingData,
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
  } = useGamesSupabase()

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
  const [deleteConfirm, setDeleteConfirm] = useState(null)

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
    setDeleteConfirm({
      label: `¿Eliminar "${game.title}"?`,
      sublabel: 'Esta acción no se puede deshacer.',
      onConfirm: () => deleteSingleGame(game.id)
    })
  }
  function handleDeleteEntry(sagaId, entryId) {
    setDeleteConfirm({
      label: '¿Eliminar esta entrega de la saga?',
      sublabel: 'Esta acción no se puede deshacer.',
      onConfirm: () => deleteSagaEntry(sagaId, entryId)
    })
  }
  function handleDeleteSaga(sagaId) {
    setDeleteConfirm({
      label: '¿Eliminar toda la saga y sus entregas?',
      sublabel: 'Se eliminarán todos los juegos dentro de la saga. Esta acción no se puede deshacer.',
      onConfirm: () => deleteSaga(sagaId)
    })
  }

  const donutData = [
    { name: 'Biblioteca', value: libraryGames.length || 1, color: 'var(--accent)' },
    { name: 'En progreso', value: inProgressGames.length || 0, color: 'var(--accent-2)' },
    { name: 'Salón de la fama', value: completedGames.length || 0, color: 'var(--state-fame)' },
  ]

  const totalLibraryCount = libraryGames.filter(g => !g.isSagaEntry).length +
    sagas.reduce((acc, s) => acc + (s.entries?.length ?? 1), 0)


  function handleStartEntry(sagaId, entryId) {
    const saga = sagas.find(s => s.id === sagaId)
    const entry = saga?.entries?.find(e => e.id === entryId)
    if (entry) startPlaying(entry)
  }

  function handleCompleteEntry(sagaId, entryId) {
    const saga = sagas.find(s => s.id === sagaId)
    const entry = saga?.entries?.find(e => e.id === entryId)
    if (entry) completeGame(entry)
  }

  function handleReplayEntry(sagaId, entryId) {
    const saga = sagas.find(s => s.id === sagaId)
    const entry = saga?.entries?.find(e => e.id === entryId)
    if (entry) returnToLibrary(entry)
  }
  function handleUpdateEntryStatus(sagaId, entryId) {
    // si tienes un modal de actualizar estado, ábrelo aquí igual que con singles
    const entry = sagas.find(s => s.id === sagaId)?.entries?.find(e => e.id === entryId)
    if (entry) handleEditSingle({ ...entry, isSagaEntry: true, sagaId })
  }

  return (
    // 👇 SidebarProvider envuelve TODO — así todas las vistas comparten el mismo estado
    <SidebarProvider>
      <div className={styles.appRoot}>

        {user && (
          <AppHeader
            onLogout={async () => { await logout(); navigate('/start') }}
            libraryGames={libraryGames}
            inProgressGames={inProgressGames}
            completedGames={completedGames}
            sagas={sagas}
          />
        )}

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
                  onResetPassword={async (email) => {
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: window.location.origin + '/reset-password'
                    })
                    if (error) throw error
                  }}
                />
            }
          />

          <Route
            path="/reset-password"
            element={<ResetPasswordModal />}
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
                onAddGame={() => setShowAddGame(true)}
                onNavigateToSaga={(saga) => {
                  setPendingSaga(saga)
                  navigate('/biblioteca')
                }}
              />
              : <Navigate to="/start" replace />
          } />

          <Route path="/biblioteca" element={
            <LibraryView
              loadingData={loadingData}
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
              onCompleteEntry={handleCompleteEntry}
              onReplayEntry={handleReplayEntry}
              onUpdateEntryStatus={handleUpdateEntryStatus}
              onStartPlayingEntry={handleStartEntry}
            />
          } />

          <Route path="/en-progreso" element={
            <InProgressView
              games={inProgressGames}
              onComplete={completeGame}
              onRandomGame={pickRandomGame}
              libraryCount={totalLibraryCount}
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
              libraryCount={totalLibraryCount}
              inProgressCount={inProgressGames.length}
              onEdit={handleEditSingle}
              onDelete={handleDeleteSingle}
            />
          } />

          <Route path="/perfil" element={
            user ? <ProfileView
              onLogout={async () => { await logout(); navigate('/start') }}
              libraryGames={libraryGames}
              inProgressGames={inProgressGames}
              completedGames={completedGames}
            /> : <Navigate to="/start" replace />
          } />

          <Route path="/en-progreso/:id" element={
            <GameProgressView
              games={inProgressGames}
              onComplete={completeGame}
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
            onMoveToSaga={moveGameToSaga}
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

        {deleteConfirm && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '16px',
              padding: '32px 28px',
              maxWidth: '420px', width: '90%',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22
              }}>🗑</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-bright)', fontWeight: 700 }}>
                {deleteConfirm.label}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {deleteConfirm.sublabel}
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', width: '100%' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { deleteConfirm.onConfirm(); setDeleteConfirm(null) }}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px',
                    border: '1px solid rgba(239,68,68,0.4)',
                    background: 'rgba(239,68,68,0.15)',
                    color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
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