import { useGames } from './features/games/hooks/useGames'
import Header from './components/layout/Header'
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

  return (
    <div>
      <Header
        totalGames={libraryGames.length}
        inProgress={inProgressGames.length}
        completed={completedGames.length}
      />

      <main>
        <section className={appStyles.librarySection}>
          <div className={appStyles.libraryHeader}>
            <h2 className={appStyles.libraryTitle}>📚 BIBLIOTECA</h2>
            <span className={appStyles.libraryCount}>
              {libraryGames.length} juegos
            </span>
          </div>
          <GameGrid
            games={libraryGames.filter(g => !g.isSagaEntry)}
            sagas={sagas}
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