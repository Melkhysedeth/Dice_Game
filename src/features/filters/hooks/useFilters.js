import { useState } from 'react'

export function useFilters() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  function filterGames(singles, sagas) {
    const query = searchQuery.toLowerCase().trim()

    let filteredSingles = singles
    let filteredSagas = sagas

    // Filtro por tipo
    if (activeFilter === 'sagas') {
      filteredSingles = []
    } else if (activeFilter === 'singles') {
      filteredSagas = []
    }

    // Filtro por búsqueda
    if (query) {
      filteredSingles = filteredSingles.filter(g =>
        g.title.toLowerCase().includes(query)
      )
      filteredSagas = filteredSagas.filter(saga =>
        saga.title.toLowerCase().includes(query) ||
        saga.entries.some(e => e.title.toLowerCase().includes(query))
      )
    }

    return { filteredSingles, filteredSagas }
  }

  return {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filterGames
  }
}