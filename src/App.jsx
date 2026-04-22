import { useGames } from './features/games/hooks/useGames'
import Header from './components/layout/Header'
import GameGrid from './features/games/components/GameGrid'
import InProgressSection from './features/games/components/InProgressSection'
import RandomButton from './components/ui/RandomButton'
import SuggestedGameModal from './components/ui/SuggestedGameModal'
import './styles/App.css'

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
    completeGame
  } = useGames()

  return (
    <div>
      <Header
        totalGames={libraryGames.length}
        inProgress={inProgressGames.length}
        completed={completedGames.length}
      />

      <main>
        <InProgressSection
          games={inProgressGames}
          onComplete={completeGame}
        />

        <GameGrid
          games={libraryGames.filter(g => !g.isSagaEntry)}
          sagas={sagas}
          onStartPlaying={startPlaying}
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