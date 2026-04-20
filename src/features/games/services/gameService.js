import gamesData from '../../../data/games.json'

// Retorna todos los juegos individuales de la biblioteca (status: library)
export function getLibraryGames() {
  const singles = gamesData.singles.filter(g => g.status === 'library')
  
  const sagaEntries = gamesData.sagas.flatMap(saga =>
    saga.entries
      .filter(entry => entry.status === 'library')
      .map(entry => ({
        ...entry,
        developer: saga.developer,
        genre: saga.genre,
        platform: saga.platform,
        sagaTitle: saga.title,
        sagaId: saga.id,
        isSagaEntry: true
      }))
  )

  return [...singles, ...sagaEntries]
}

// Retorna todos los juegos en progreso
export function getInProgressGames() {
  const singles = gamesData.singles.filter(g => g.status === 'in_progress')

  const sagaEntries = gamesData.sagas.flatMap(saga =>
    saga.entries
      .filter(entry => entry.status === 'in_progress')
      .map(entry => ({
        ...entry,
        developer: saga.developer,
        genre: saga.genre,
        platform: saga.platform,
        sagaTitle: saga.title,
        sagaId: saga.id,
        isSagaEntry: true
      }))
  )

  return [...singles, ...sagaEntries]
}

// Retorna todos los juegos completados
export function getCompletedGames() {
  const singles = gamesData.singles.filter(g => g.status === 'completed')

  const sagaEntries = gamesData.sagas.flatMap(saga =>
    saga.entries
      .filter(entry => entry.status === 'completed')
      .map(entry => ({
        ...entry,
        developer: saga.developer,
        genre: saga.genre,
        platform: saga.platform,
        sagaTitle: saga.title,
        sagaId: saga.id,
        isSagaEntry: true
      }))
  )

  return [...singles, ...sagaEntries]
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