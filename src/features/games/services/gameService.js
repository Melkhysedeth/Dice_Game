import gamesData from '../../../data/games.json'

// Retorna todos los juegos individuales de la biblioteca (status: library)
  export function getLibraryGames() {
  return gamesData.singles.filter(g => g.status === 'library')
}

// Retorna todos los juegos en progreso
export function getInProgressGames() {
  return gamesData.singles.filter(g => g.status === 'in_progress')
}

// Retorna todos los juegos completados
export function getCompletedGames() {
  return gamesData.singles.filter(g => g.status === 'completed')
}

// Elige un juego al azar de la biblioteca
export function getRandomGame() {
  const library = getLibraryGames()
  if (library.length === 0) return null
  const randomIndex = Math.floor(Math.random() * library.length)
  return library[randomIndex]
}

// Retorna todas las sagas con sus entradas
export function getAllSagas() {
  return gamesData.sagas
}