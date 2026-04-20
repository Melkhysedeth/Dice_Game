import { useGames } from './features/games/hooks/useGames'
import Header from './components/layout/Header'
import './styles/App.css'

function App() {
  const {
    libraryGames,
    inProgressGames,
    completedGames,
    suggestedGame,
    pickRandomGame,
    dismissSuggestion
  } = useGames()

  return (
    <div>
      <Header
        totalGames={libraryGames.length}
        inProgress={inProgressGames.length}
        completed={completedGames.length}
      />

      <main>
        <button onClick={pickRandomGame}>
          Elegir juego al azar
        </button>

        {suggestedGame && (
          <div>
            <h2>Juego sugerido:</h2>
            <p>{suggestedGame.title}</p>
            <p>{suggestedGame.developer}</p>
            <p>{suggestedGame.year}</p>
            <button onClick={dismissSuggestion}>Tirar de nuevo</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App