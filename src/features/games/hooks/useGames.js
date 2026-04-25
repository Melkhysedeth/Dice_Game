import { useState, useEffect } from 'react'
import gamesData from '../../../data/games.json'

const STORAGE_KEYS = {
  singles: 'gamevault_singles',
  sagas: 'gamevault_sagas'
}

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    console.error('Error guardando en localStorage')
  }
}

export function useGames() {

  const [singles, setSingles] = useState(() =>
    loadFromStorage(STORAGE_KEYS.singles, gamesData.singles)
  )

  const [sagas, setSagas] = useState(() =>
    loadFromStorage(STORAGE_KEYS.sagas, gamesData.sagas)
  )

  const [suggestedGame, setSuggestedGame] = useState(null)

  // Guarda automáticamente cada vez que singles cambia
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.singles, singles)
  }, [singles])

  // Guarda automáticamente cada vez que sagas cambia
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.sagas, sagas)
  }, [sagas])

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
              i === entry.sessions.length - 1 ? { ...s, endDate: today } : s
            )
            return { ...entry, status: 'completed', sessions: updatedSessions }
          })
        }
      }))
    } else {
      setSingles(prev => prev.map(g => {
        if (g.id !== game.id) return g
        const updatedSessions = g.sessions.map((s, i) =>
          i === g.sessions.length - 1 ? { ...s, endDate: today } : s
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

  function addSingleGame(gameData) {
    const newGame = {
      id: gameData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      title: gameData.title,
      developer: gameData.developer,
      year: parseInt(gameData.year),
      genre: gameData.genre,
      platform: gameData.platform,
      cover: gameData.cover || null,
      status: 'library',
      sessions: []
    }
    setSingles(prev => [...prev, newGame])
  }

  function addEntryToSaga(sagaId, entryData) {
    setSagas(prev => prev.map(saga => {
      if (saga.id !== sagaId) return saga
      const newEntry = {
        id: entryData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        title: entryData.title,
        year: parseInt(entryData.year),
        cover: null,
        status: 'library',
        sessions: []
      }
      return { ...saga, entries: [...saga.entries, newEntry] }
    }))
  }

  function addNewSaga(sagaData, firstEntry) {
    const newSaga = {
      id: sagaData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      title: sagaData.title,
      developer: sagaData.developer,
      genre: sagaData.genre,
      platform: sagaData.platform,
      cover: sagaData.cover || null,
      entries: [{
        id: firstEntry.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        title: firstEntry.title,
        year: parseInt(firstEntry.year),
        cover: null,
        status: 'library',
        sessions: []
      }]
    }
    setSagas(prev => [...prev, newSaga])
  }

  function updateSingleGame(gameId, gameData) {
    setSingles(prev => prev.map(g => {
      if (g.id !== gameId) return g
      return {
        ...g,
        title: gameData.title,
        developer: gameData.developer,
        year: parseInt(gameData.year),
        genre: gameData.genre,
        platform: gameData.platform,
        cover: gameData.cover !== undefined ? gameData.cover : g.cover
      }
    }))
  }

  function updateSagaEntry(sagaId, entryId, entryData) {
    setSagas(prev => prev.map(saga => {
      if (saga.id !== sagaId) return saga
      return {
        ...saga,
        entries: saga.entries.map(entry => {
          if (entry.id !== entryId) return entry
          return { ...entry, title: entryData.title, year: parseInt(entryData.year) }
        })
      }
    }))
  }

  function updateSaga(sagaId, sagaData) {
    setSagas(prev => prev.map(saga => {
      if (saga.id !== sagaId) return saga
      return {
        ...saga,
        title: sagaData.title,
        developer: sagaData.developer,
        genre: sagaData.genre,
        platform: sagaData.platform
      }
    }))
  }

  function updateSagaCover(sagaId, cover) {
    setSagas(prev => prev.map(saga => {
      if (saga.id !== sagaId) return saga
      return { ...saga, cover }
    }))
  }

  function updateEntryCover(sagaId, entryId, cover) {
    setSagas(prev => prev.map(saga => {
      if (saga.id !== sagaId) return saga
      return {
        ...saga,
        entries: saga.entries.map(entry => {
          if (entry.id !== entryId) return entry
          return { ...entry, cover }
        })
      }
    }))
  }

  function deleteSingleGame(gameId) {
    setSingles(prev => prev.filter(g => g.id !== gameId))
  }

  function deleteSagaEntry(sagaId, entryId) {
    setSagas(prev => prev.map(saga => {
      if (saga.id !== sagaId) return saga
      return {
        ...saga,
        entries: saga.entries.filter(entry => entry.id !== entryId)
      }
    }))
  }

  function deleteSaga(sagaId) {
    setSagas(prev => prev.filter(saga => saga.id !== sagaId))
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
    returnToLibrary,
    addSingleGame,
    addEntryToSaga,
    addNewSaga,
    updateSingleGame,
    updateSagaEntry,
    updateSaga,
    deleteSingleGame,
    deleteSagaEntry,
    deleteSaga,
    updateSagaCover,
    updateEntryCover
    }
}