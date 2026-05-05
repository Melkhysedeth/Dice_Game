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
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import LibraryScroll from './features/games/components/LibraryScroll'
import Footer from './components/layout/Footer'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LibraryView from './features/games/views/LibraryView'
import InProgressView from './features/games/views/InProgressView'
import HallOfFameView from './features/games/views/HallOfFameView'
import { ChartColumn, Gamepad2, Trophy } from 'lucide-react'

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
    updateEntryCover,
    addEmptySaga,
    singles
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
  const libraryPct = totalGames > 0 ? Math.round((libraryGames.length / totalGames) * 100) : 0
  const progressPct = totalGames > 0 ? Math.round((inProgressGames.length / totalGames) * 100) : 0
  const famePct = totalGames > 0 ? Math.round((completedGames.length / totalGames) * 100) : 0

  return (
    <div className={styles.appRoot}>

      <AppHeader
        totalGames={totalGames}
        inProgress={inProgressGames.length}
        completed={completedGames.length}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      <Routes>

        {/* ── DASHBOARD ── */}
        <Route path="/" element={
          <>
            <div className={styles.layout}>
              <main className={styles.mainContent}>

                <section className={styles.hero}>
                  <div className={styles.heroTop}>
                    <img
                      src="/src/assets/vault-logo.png"
                      alt="Game Vault"
                      className={styles.heroVaultImg}
                      style={{ objectFit: 'cover', objectPosition: 'center 8%' }}
                    />
                    <div className={styles.heroText}>
                      <p className={styles.heroGreeting}>¡Bienvenido de vuelta, <span className={styles.heroNameAccent}>GamerXX!</span> 👋</p>
                      <p className={styles.heroTagline}>Organiza, juega y celebra cada aventura.</p>
                      <div className={styles.kpis}>
                        <div className={styles.kpiCard}>
                          <span className={styles.kpiIcon} style={{ background: 'rgba(0,212,255,0.12)', color: 'var(--accent)' }}>
                            <ChartColumn size={20} />
                          </span>
                          <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Juegos totales</span>
                            <span className={styles.kpiValue}>{totalGames}</span>
                          </div>
                        </div>
                        <div className={styles.kpiCard}>
                          <span className={styles.kpiIcon} style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                            <Gamepad2 size={20} />
                          </span>
                          <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Horas jugadas</span>
                            <span className={styles.kpiValue}>532h</span>
                          </div>
                        </div>
                        <div className={styles.kpiCard}>
                          <span className={styles.kpiIcon} style={{ background: 'rgba(251,191,36,0.12)', color: 'var(--state-fame)' }}>
                            <Trophy size={20} />
                          </span>
                          <div className={styles.kpiInfo}>
                            <span className={styles.kpiLabel}>Logros obtenidos</span>
                            <span className={styles.kpiValue}>{completedGames.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <span className={styles.sectionAccent} />
                      Tu progreso
                    </h2>
                    <button className={styles.seeAll}>Ver todos →</button>
                  </div>
                  <InProgressSection games={inProgressGames} onComplete={completeGame} />
                </section>

                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                      <span className={styles.sectionAccent} style={{ background: 'var(--accent)' }} />
                      Biblioteca
                      <span className={styles.sectionSub}>(Pendientes por jugar)</span>
                    </h2>
                    <button className={styles.seeAll}>Ver todos →</button>
                  </div>
                  <LibraryScroll
                    games={filteredSingles}
                    sagas={filteredSagas}
                    onStartPlaying={startPlaying}
                    onRandomGame={pickRandomGame}
                    onOpenSaga={(saga) => { setPendingSaga(saga); navigate('/biblioteca') }}
                  />
                </section>

              </main>

              <aside className={styles.sidebar}>
                <div className={styles.sideCard}>
                  <h3 className={styles.sideCardTitle}>
                    <span><ChartColumn size={25} /></span> Resumen de tu colección
                  </h3>

                  <div className={styles.donutRow}>
                    {/* DONUT */}
                    <div className={styles.donutWrapper}>
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Biblioteca', value: libraryGames.length || 0.001 },
                              { name: 'En progreso', value: inProgressGames.length || 0.001 },
                              { name: 'Salón de la fama', value: completedGames.length || 0.001 },
                            ]}
                            cx="50%" cy="50%"
                            innerRadius={48} outerRadius={68}
                            paddingAngle={3} dataKey="value" strokeWidth={0}
                          >
                            <Cell fill="var(--accent)" />
                            <Cell fill="var(--accent-2)" />
                            <Cell fill="var(--state-fame)" />
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--font-body)', fontSize: '12px' }}
                            cursor={false}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className={styles.donutCenter}>
                        <span className={styles.donutTotal}>{totalGames}</span>
                        <span className={styles.donutLabel}>Juegos</span>
                      </div>
                    </div>

                    {/* LEYENDA */}
                    <div className={styles.legend}>
                      <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: 'var(--accent)' }} />
                        <span className={styles.legendName}>Biblioteca</span>
                        <span className={styles.legendVal} style={{ color: 'var(--accent)' }}>
                          {libraryGames.length} ({libraryPct}%)
                        </span>
                      </div>
                      <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: 'var(--accent-2)' }} />
                        <span className={styles.legendName}>En progreso</span>
                        <span className={styles.legendVal} style={{ color: 'var(--accent-2)' }}>
                          {inProgressGames.length} ({progressPct}%)
                        </span>
                      </div>
                      <div className={styles.legendItem}>
                        <span className={styles.legendDot} style={{ background: 'var(--state-fame)' }} />
                        <span className={styles.legendName}>Salón de la fama</span>
                        <span className={styles.legendVal} style={{ color: 'var(--state-fame)' }}>
                          {completedGames.length} ({famePct}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className={styles.statsLink}>
                    <ChartColumn size={14} /> Ver estadísticas completas →
                  </button>
                </div>

                <div className={styles.randomCard}>
                  <h3 className={styles.randomTitle}>¿No sabes qué jugar?</h3>
                  <p className={styles.randomSub}>Deja que el azar elija tu próxima aventura.</p>
                  <div className={styles.diceWrapper}>
                    <div className={styles.diceGlow} />
                    <span className={styles.diceEmoji}>🎲</span>
                  </div>
                  <button className={styles.randomBtn} onClick={pickRandomGame}>
                    <span>🎲</span> JUEGO AL AZAR
                  </button>
                </div>

                <div className={styles.sideCard}>
                  <h3 className={styles.sideCardTitle}><span>⚡</span> Actividad reciente</h3>
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
            <Footer onRandomGame={pickRandomGame} />
          </>
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
            completedCount={completedGames.length}  // ← todos los singles sin filtrar por status
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

        {/* -- SALON DE LA FAMA -- */}
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
