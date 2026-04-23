import { useGames } from './features/games/hooks/useGames'
import { useFilters } from './features/filters/hooks/useFilters'
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
    returnToLibrary
  } = useGames()

  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filterGames
  } = useFilters()

  const librarySingles = libraryGames.filter(g => !g.isSagaEntry)
  const { filteredSingles, filteredSagas } = filterGames(librarySingles, sagas)

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
            <h2 className={appStyles.libraryTitle}>📚 BIBLIOTECA</h2>
            <span className={appStyles.libraryCount}>
              {filteredSingles.length + filteredSagas.length} juegos
            </span>
          </div>

          <GameGrid
            games={filteredSingles}
            sagas={filteredSagas}
            onStartPlaying={startPlaying}
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
    </div>
  )
}

export default App