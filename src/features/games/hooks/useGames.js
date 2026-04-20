import { useState, useEffect } from 'react'
import {
  getLibraryGames,
  getInProgressGames,
  getCompletedGames,
  getRandomGame,
  getAllSagas
} from '../services/gameService'

export function useGames() {

  // Los tres estados de tu app
  const [libraryGames, setLibraryGames] = useState([])
  const [inProgressGames, setInProgressGames] = useState([])
  const [completedGames, setCompletedGames] = useState([])
  const [sagas, setSagas] = useState([])

  // El juego sugerido por el aleatorio — empieza en null
  const [suggestedGame, setSuggestedGame] = useState(null)

  // Carga los datos cuando el hook se inicializa
  useEffect(() => {
    loadGames()
  }, [])

  function loadGames() {
    setLibraryGames(getLibraryGames())
    setInProgressGames(getInProgressGames())
    setCompletedGames(getCompletedGames())
    setSagas(getAllSagas())
  }

  // Elige un juego al azar y lo pone como sugerido
  function pickRandomGame() {
    const game = getRandomGame()
    setSuggestedGame(game)
  }

  // Descarta la sugerencia y vuelve a null
  function dismissSuggestion() {
    setSuggestedGame(null)
  }

  // Retorna todo lo que los componentes necesitan
  return {
    libraryGames,
    inProgressGames,
    completedGames,
    suggestedGame,
    sagas,
    pickRandomGame,
    dismissSuggestion
  }
}