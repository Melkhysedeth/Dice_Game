import { useGames } from './features/games/hooks/useGames'
import Header from './components/layout/Header'
import GameGrid from './features/games/components/GameGrid'
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
    dismissSuggestion
  } = useGames()

  function handleStartPlaying(game) {
    console.log('Comenzar a jugar:', game.title)
    dismissSuggestion()
  }

  return (
    <div>
      <Header
        totalGames={libraryGames.length}
        inProgress={inProgressGames.length}
        completed={completedGames.length}
      />

      <main>
        <GameGrid
          games={libraryGames.filter(g => !g.isSagaEntry)}
          sagas={sagas}
          onStartPlaying={handleStartPlaying}
        />
      </main>

      <RandomButton onClick={pickRandomGame} />

      <SuggestedGameModal
        game={suggestedGame}
        onConfirm={handleStartPlaying}
        onDismiss={pickRandomGame}
        onClose={dismissSuggestion}
      />

    </div>
  )
}

export default App