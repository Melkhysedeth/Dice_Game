import { useGames } from './features/games/hooks/useGames'
import Header from './components/layout/Header'
import GameGrid from './features/games/components/GameGrid'
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
  }

  return (
    <div>
      <Header
        totalGames={libraryGames.length}
        inProgress={inProgressGames.length}
        completed={completedGames.length}
      />

      <main>
        <button onClick={pickRandomGame}>Elegir al azar</button>
        {suggestedGame && (
          <div>
            <p>Sugerido: {suggestedGame.title}</p>
            <button onClick={dismissSuggestion}>Tirar de nuevo</button>
          </div>
        )}

        <GameGrid
          games={libraryGames}
          sagas={sagas}
          onStartPlaying={handleStartPlaying}
        />
      </main>
    </div>
  )
}

export default App