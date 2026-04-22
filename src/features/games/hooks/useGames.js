import { useState, useEffect } from 'react'
import gamesData from '../../../data/games.json'

export function useGames() {

  // Estado central — toda la data vive aquí
  const [singles, setSingles] = useState([])
  const [sagas, setSagas] = useState([])

  // Carga inicial desde el JSON
  useEffect(() => {
    setSingles(gamesData.singles)
    setSagas(gamesData.sagas)
  }, [])

  const [suggestedGame, setSuggestedGame] = useState(null)

  // ── Derivados — calculados desde singles y sagas ──

  function getAllEntries() {
    const sagaEntries = sagas.flatMap(saga =>
      saga.entries.map(entry => ({
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

  const libraryGames = getAllEntries().filter(g => g.status === 'library')
  const inProgressGames = getAllEntries().filter(g => g.status === 'in_progress')
  const completedGames = getAllEntries().filter(g => g.status === 'completed')

  // ── Acciones ──

  function pickRandomGame() {
    if (libraryGames.length === 0) return
    const random = Math.floor(Math.random() * libraryGames.length)
    setSuggestedGame(libraryGames[random])
  }

  function dismissSuggestion() {
    setSuggestedGame(null)
  }

  function startPlaying(game) {
    const today = new Date().toISOString().split('T')[0]

    if (game.isSagaEntry) {
      // Actualiza la entrada dentro de la saga
      setSagas(prev => prev.map(saga => {
        if (saga.id !== game.sagaId) return saga
        return {
          ...saga,
          entries: saga.entries.map(entry => {
            if (entry.id !== game.id) return entry
            return {
              ...entry,
              status: 'in_progress',
              sessions: [...entry.sessions, {
                startDate: today,
                endDate: null,
                isFirstTime: entry.sessions.length === 0
              }]
            }
          })
        }
      }))
    } else {
      // Actualiza el single
      setSingles(prev => prev.map(g => {
        if (g.id !== game.id) return g
        return {
          ...g,
          status: 'in_progress',
          sessions: [...g.sessions, {
            startDate: today,
            endDate: null,
            isFirstTime: g.sessions.length === 0
          }]
        }
      }))
    }

    dismissSuggestion()
  }

  function completeGame(game) {
    const today = new Date().toISOString().split('T')[0]

    if (game.isSagaEntry) {
      setSagas(prev => prev.map(saga => {
        if (saga.id !== game.sagaId) return saga
        return {
          ...saga,
          entries: saga.entries.map(entry => {
            if (entry.id !== game.id) return entry
            const updatedSessions = entry.sessions.map((s, i) =>
              i === entry.sessions.length - 1
                ? { ...s, endDate: today }
                : s
            )
            return { ...entry, status: 'completed', sessions: updatedSessions }
          })
        }
      }))
    } else {
      setSingles(prev => prev.map(g => {
        if (g.id !== game.id) return g
        const updatedSessions = g.sessions.map((s, i) =>
          i === g.sessions.length - 1
            ? { ...s, endDate: today }
            : s
        )
        return { ...g, status: 'completed', sessions: updatedSessions }
      }))
    }
  }

  function returnToLibrary(game) {
    if (game.isSagaEntry) {
      setSagas(prev => prev.map(saga => {
        if (saga.id !== game.sagaId) return saga
        return {
          ...saga,
          entries: saga.entries.map(entry => {
            if (entry.id !== game.id) return entry
            return { ...entry, status: 'library' }
          })
        }
      }))
    } else {
      setSingles(prev => prev.map(g => {
        if (g.id !== game.id) return g
        return { ...g, status: 'library' }
      }))
    }
  }

  return {
    singles,
    sagas,
    libraryGames,
    inProgressGames,
    completedGames,
    suggestedGame,
    pickRandomGame,
    dismissSuggestion,
    startPlaying,
    completeGame,
    returnToLibrary
  }
}