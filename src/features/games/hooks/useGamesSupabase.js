import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function normalizeUrl(url) {
  if (!url) return null
  if (url.startsWith('//')) return 'https:' + url
  return url
}

// Convierte una fila de Supabase al shape que espera tu UI (igual que localStorage)
function rowToSingle(game, entry) {
  return {
    id: game.slug,
    _uuid: game.id,
    _entryUuid: entry.id,
    title: game.title,
    developer: game.developer,
    year: game.release_year,
    genre: game.genres || [],
    genres: game.genres || [],
    platform: game.platforms || [],
    platforms: game.platforms || [],
    cover: normalizeUrl(game.cover_url),
    description: game.description,
    summary: game.description,
    igdbId: game.igdb_id || null,
    status: entry.status,
    tags: game.tags?.length ? game.tags : (game.genres || []),
    gameModes: game.game_modes || [],
    screenshots: game.screenshots || [],
    _createdAt: entry.created_at || null,
    hltb_main: game.hltb_main ?? null,
    hltb_main_extra: game.hltb_main_extra ?? null,
    hltb_completionist: game.hltb_completionist ?? null,
    hltb_source: game.hltb_source ?? 'manual',
    progress_mode: game.progress_mode ?? 'linear',
    hltb_reference: entry.hltb_reference ?? 'main',
    sessions: (entry.play_sessions || []).map(s => ({
      startDate: s.start_date,
      endDate: s.end_date,
      isFirstTime: s.is_first_time
    }))
  }
}

function rowToSagaEntry(game, entry, saga) {
  return {
    ...rowToSingle(game, entry),
    sagaTitle: saga.title,
    igdbId: game.igdb_id || null,
    sagaId: saga.slug,
    _sagaUuid: saga.id,
    isSagaEntry: true
  }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useGamesSupabase() {
  const [singles, setSingles] = useState(() => {
    const cached = localStorage.getItem('gamevault_singles')
    return cached ? JSON.parse(cached) : []
  })
  const [sagas, setSagas] = useState(() => {
    const cached = localStorage.getItem('gamevault_sagas')
    return cached ? JSON.parse(cached) : []
  })

  const [suggestedGame, setSuggestedGame] = useState(null)

  const [loadingData, setLoadingData] = useState(() => {
    const cached = localStorage.getItem('gamevault_singles')
    return !cached  // false si hay caché, true si no hay
  })

  const [currentUser, setCurrentUser] = useState(null)

  // ── Carga inicial desde Supabase ───────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const cached = localStorage.getItem('gamevault_singles')
    if (!cached) setLoadingData(true)  // solo muestra loading si no hay caché

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoadingData(false); return }

    // Fetch entries del usuario
    const { data: entries, error } = await supabase
      .from('library_entries')
      .select(`
        id, status, game_id, saga_id, created_at,
        games (
            id, slug, title, developer, release_year,
            cover_url, description, genres, platforms,
            igdb_id, tags, game_modes,
            hltb_main, hltb_main_extra, hltb_completionist,
            hltb_source, progress_mode, screenshots
        ),
        sagas ( id, slug, title, cover_url ),
        play_sessions ( id, start_date, end_date, is_first_time )`)
      .eq('user_id', user.id)

    // Fetch todas las sagas (incluyendo las vacías)
    const { data: allSagas } = await supabase
      .from('sagas')
      .select('id, slug, title, cover_url, user_id, created_at')
      .eq('user_id', user.id)
    if (error) {
      console.error('Error cargando datos:', error.message)
      setLoadingData(false)
      return
    }

    const singlesResult = []
    const sagasMap = {}

    // Inicializa todas las sagas (incluso las vacías)
    allSagas?.forEach(saga => {
      sagasMap[saga.slug] = {
        id: saga.slug,
        _uuid: saga.id,
        title: saga.title,
        developer: '',
        genre: [],
        platform: [],
        cover: normalizeUrl(saga.cover_url),
        entries: [],
        _createdAt: saga.created_at || null,
      }
    })

    // Agrega los juegos a sus sagas o a singles
    entries?.forEach(entry => {
      const game = entry.games
      if (!game) return

      if (entry.saga_id && entry.sagas) {
        const saga = entry.sagas
        if (sagasMap[saga.slug]) {
          sagasMap[saga.slug].entries.push(rowToSagaEntry(game, entry, saga))
        }
      } else {
        singlesResult.push(rowToSingle(game, entry))
      }
    })

    setSingles(singlesResult)
    setSagas(Object.values(sagasMap))
    localStorage.setItem('gamevault_singles', JSON.stringify(singlesResult))  // 👈
    localStorage.setItem('gamevault_sagas', JSON.stringify(Object.values(sagasMap)))  // 👈
    setLoadingData(false)
  }, [])

  useEffect(() => {
    fetchAll()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        localStorage.removeItem('gamevault_singles')
        localStorage.removeItem('gamevault_sagas')
        fetchAll()
      }
      if (event === 'SIGNED_OUT') {
        setSingles([])
        setSagas([])
        localStorage.removeItem('gamevault_singles')
        localStorage.removeItem('gamevault_sagas')
        setLoadingData(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchAll])

  // ── Computed ───────────────────────────────────────────────────────────────
  function getAllEntries() {
    const sagaEntries = sagas.flatMap(saga => saga.entries)
    return [...singles, ...sagaEntries]
  }

  const libraryGames = getAllEntries().filter(g => g.status === 'library')
  const inProgressGames = getAllEntries().filter(g => g.status === 'in_progress')
  const completedGames = getAllEntries().filter(g => g.status === 'completed')

  // ── Random ─────────────────────────────────────────────────────────────────
  function pickRandomGame() {
    if (libraryGames.length === 0) return
    const random = Math.floor(Math.random() * libraryGames.length)
    setSuggestedGame(libraryGames[random])
  }

  function dismissSuggestion() {
    setSuggestedGame(null)
  }

  // ── startPlaying ───────────────────────────────────────────────────────────
  async function startPlaying(game) {
    const today = new Date().toISOString().split('T')[0]
    const newSession = { startDate: today, endDate: null, isFirstTime: game.sessions.length === 0 }

    // Optimistic update
    _updateEntryOptimistic(game, { status: 'in_progress', sessions: [...game.sessions, newSession] })

    // Supabase
    await supabase
      .from('library_entries')
      .update({ status: 'in_progress' })
      .eq('id', game._entryUuid)

    await supabase
      .from('play_sessions')
      .insert({
        library_entry_id: game._entryUuid,
        start_date: today,
        end_date: null,
        is_first_time: game.sessions.length === 0
      })

    dismissSuggestion()
  }

  // ── completeGame ───────────────────────────────────────────────────────────
  async function completeGame(game) {
    const today = new Date().toISOString().split('T')[0]
    const updatedSessions = game.sessions.map((s, i) =>
      i === game.sessions.length - 1 ? { ...s, endDate: today } : s
    )

    // Optimistic update
    _updateEntryOptimistic(game, { status: 'completed', sessions: updatedSessions })

    // Supabase
    await supabase
      .from('library_entries')
      .update({ status: 'completed' })
      .eq('id', game._entryUuid)

    // Cierra la última sesión abierta
    const { data: sessions } = await supabase
      .from('play_sessions')
      .select('id')
      .eq('library_entry_id', game._entryUuid)
      .is('end_date', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (sessions?.length > 0) {
      await supabase
        .from('play_sessions')
        .update({ end_date: today })
        .eq('id', sessions[0].id)
    }
  }

  // ── returnToLibrary ────────────────────────────────────────────────────────
  async function returnToLibrary(game) {
    _updateEntryOptimistic(game, { status: 'library' })

    await supabase
      .from('library_entries')
      .update({ status: 'library' })
      .eq('id', game._entryUuid)
  }

  // ── addSingleGame ──────────────────────────────────────────────────────────
  async function addSingleGame(gameData) {
    const { data: { user } } = await supabase.auth.getUser()
    const slug = gameData.igdbId
      ? `igdb-${gameData.igdbId}`
      : gameData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()

    // Optimistic
    const optimistic = {
      id: slug, _uuid: null, _entryUuid: null,
      _createdAt: new Date().toISOString(),
      title: gameData.title, developer: gameData.developer,
      year: parseInt(gameData.year),
      genre: gameData.genre || [], genres: gameData.genre || [],
      platform: gameData.platform || [], platforms: gameData.platform || [],
      cover: normalizeUrl(gameData.cover) || null,
      description: gameData.description || gameData.summary || null,
      summary: gameData.summary || gameData.description || null,
      status: 'library', sessions: [], isSagaEntry: false
    }
    setSingles(prev => [optimistic, ...prev])

    // ¿Ya existe el juego en el catálogo global?
    let gameRecord = null

    if (gameData.igdbId) {
      const { data: existing } = await supabase
        .from('games')
        .select('id, slug, title, cover_url, description, genres, platforms, tags, game_modes, igdb_id, screenshots, hltb_main, hltb_main_extra, hltb_completionist, hltb_source, progress_mode')
        .eq('igdb_id', gameData.igdbId)
        .maybeSingle()

      if (existing) {
        gameRecord = existing

        if (gameData.hltb_completionist && !existing.hltb_completionist) {
          await supabase
            .from('games')
            .update({
              hltb_main: gameData.hltb_main,
              hltb_main_extra: gameData.hltb_main_extra,
              hltb_completionist: gameData.hltb_completionist,
            })
            .eq('id', existing.id)

          gameRecord = {
            ...existing,
            hltb_main: gameData.hltb_main,
            hltb_main_extra: gameData.hltb_main_extra,
            hltb_completionist: gameData.hltb_completionist
          }
        }
      }
    }

    if (!gameRecord) {
      const { data: newGame, error: gameError } = await supabase
        .from('games')
        .insert({
          slug,
          title: gameData.title,
          developer: gameData.developer,
          release_year: parseInt(gameData.year),
          cover_url: normalizeUrl(gameData.cover),
          description: gameData.description || gameData.summary || null,
          genres: gameData.genre || [],
          platforms: gameData.platform || [],
          tags: gameData.tags || [],
          game_modes: gameData.gameModes || [],
          igdb_id: gameData.igdbId || null,
          screenshots: gameData.screenshots || [],
          // ── NUEVO ──
          hltb_main: gameData.hltb_main ?? null,
          hltb_main_extra: gameData.hltb_main_extra ?? null,
          hltb_completionist: gameData.hltb_completionist ?? null,
          hltb_source: gameData.hltb_source ?? 'manual',
          progress_mode: gameData.progress_mode ?? 'linear',
        })
        .select()
        .single()

      if (gameError) {
        setSingles(prev => prev.filter(g => g.id !== slug))
        return
      }
      gameRecord = newGame
    }

    // ¿El usuario ya lo tiene en su biblioteca?
    const { data: entryExisting } = await supabase
      .from('library_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', gameRecord.id)
      .maybeSingle()

    if (entryExisting) {
      setSingles(prev => prev.filter(g => g.id !== slug))
      return
    }

    const { data: entry, error: entryError } = await supabase
      .from('library_entries')
      .insert({
        user_id: user.id,
        game_id: gameRecord.id,
        status: 'library',
        saga_id: null,
        hltb_reference: 'main',
      })
      .select()
      .single()

    if (entryError) {
      setSingles(prev => prev.filter(g => g.id !== slug))
      return
    }

    // Reemplaza el optimistic con los datos reales sin refetch
    setSingles(prev => prev.map(g =>
      g.id === slug
        ? {
          ...g,
          id: gameRecord.slug,
          _uuid: gameRecord.id,
          _entryUuid: entry.id,
          // ── Todos los campos que vienen de Supabase ──
          cover: normalizeUrl(gameRecord.cover_url),
          description: gameRecord.description,
          summary: gameRecord.description,
          genre: gameRecord.genres || [],
          genres: gameRecord.genres || [],
          platform: gameRecord.platforms || [],
          platforms: gameRecord.platforms || [],
          tags: gameRecord.tags || [],
          gameModes: gameRecord.game_modes || [],
          screenshots: gameRecord.screenshots || [],
          igdbId: gameRecord.igdb_id || null,
          hltb_main: gameRecord.hltb_main ?? null,
          hltb_main_extra: gameRecord.hltb_main_extra ?? null,
          hltb_completionist: gameRecord.hltb_completionist ?? null,
          hltb_source: gameRecord.hltb_source ?? 'manual',
          progress_mode: gameRecord.progress_mode ?? 'linear',
        }
        : g
    ))
  }

  // ── addEntryToSaga ─────────────────────────────────────────────────────────
  async function addEntryToSaga(sagaId, entryData) {
    const { data: { user } } = await supabase.auth.getUser()
    const saga = sagas.find(s => s.id === sagaId)
    if (!saga) return

    const slug = entryData.igdbId
      ? `igdb-${entryData.igdbId}`
      : entryData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()

    // Optimistic
    const optimistic = {
      id: slug, _uuid: null, _entryUuid: null,
      _createdAt: new Date().toISOString(),
      title: entryData.title, year: parseInt(entryData.year),
      developer: entryData.developer || saga.developer,
      genre: entryData.genre || entryData.genres || [],
      genres: entryData.genre || entryData.genres || [],
      platform: entryData.platform || entryData.platforms || [],
      platforms: entryData.platform || entryData.platforms || [],
      cover: normalizeUrl(entryData.cover) || null,
      description: entryData.description || entryData.summary || null,
      summary: entryData.summary || entryData.description || null,
      status: 'library', sessions: [],
      sagaTitle: saga.title, sagaId, _sagaUuid: saga._uuid, isSagaEntry: true
    }
    setSagas(prev => prev.map(s =>
      s.id === sagaId ? { ...s, entries: [optimistic, ...s.entries] } : s
    ))

    // ¿Ya existe en el catálogo global?
    let gameRecord = null

    if (entryData.igdbId) {
      const { data: existing } = await supabase
        .from('games')
        .select('id, slug')
        .eq('igdb_id', entryData.igdbId)
        .maybeSingle()

      if (existing) gameRecord = existing
    }

    if (!gameRecord) {
      const { data: newGame, error: gameError } = await supabase
        .from('games')
        .insert({
          slug,
          title: entryData.title,
          developer: entryData.developer || saga.developer || null,
          release_year: parseInt(entryData.year),
          cover_url: normalizeUrl(entryData.cover),
          description: entryData.description || entryData.summary || null,
          genres: entryData.genre || entryData.genres || [],
          platforms: entryData.platform || entryData.platforms || [],
          tags: entryData.tags || [],
          game_modes: entryData.gameModes || [],
          screenshots: entryData.screenshots || [],
          igdb_id: entryData.igdbId || null,
          hltb_main: entryData.hltb_main ?? null,
          hltb_main_extra: entryData.hltb_main_extra ?? null,
          hltb_completionist: entryData.hltb_completionist ?? null,
          hltb_source: entryData.hltb_source ?? 'manual',
          progress_mode: entryData.progress_mode ?? 'linear',
        })
        .select()
        .single()

      if (gameError) {
        setSagas(prev => prev.map(s =>
          s.id !== sagaId ? s : { ...s, entries: s.entries.filter(e => e.id !== slug) }
        ))
        return
      }
      gameRecord = newGame
    }

    // ¿El usuario ya lo tiene?
    const { data: entryExisting } = await supabase
      .from('library_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', gameRecord.id)
      .maybeSingle()

    if (entryExisting) {
      setSagas(prev => prev.map(s =>
        s.id !== sagaId ? s : { ...s, entries: s.entries.filter(e => e.id !== slug) }
      ))
      return
    }

    const { data: entry, error: entryError } = await supabase
      .from('library_entries')
      .insert({
        user_id: user.id,
        game_id: gameRecord.id,
        status: 'library',
        saga_id: saga._uuid,
        // ── NUEVO ──
        hltb_reference: 'main',
      })
      .select()
      .single()

    if (entryError) {
      setSagas(prev => prev.map(s =>
        s.id !== sagaId ? s : { ...s, entries: s.entries.filter(e => e.id !== slug) }
      ))
      return
    }

    setSagas(prev => prev.map(s =>
      s.id !== sagaId ? s : {
        ...s,
        entries: s.entries.map(e =>
          e.id === slug
            ? {
              ...e,
              _uuid: gameRecord.id,
              _entryUuid: entry.id,
              cover: normalizeUrl(gameRecord.cover_url),
              description: gameRecord.description,
              summary: gameRecord.description,
              genre: gameRecord.genres || [],
              genres: gameRecord.genres || [],
              platform: gameRecord.platforms || [],
              platforms: gameRecord.platforms || [],
              tags: gameRecord.tags || [],
              gameModes: gameRecord.game_modes || [],
              screenshots: gameRecord.screenshots || [],
              igdbId: gameRecord.igdb_id || null,
              hltb_main: gameRecord.hltb_main ?? null,
              hltb_main_extra: gameRecord.hltb_main_extra ?? null,
              hltb_completionist: gameRecord.hltb_completionist ?? null,
              hltb_source: gameRecord.hltb_source ?? 'manual',
              progress_mode: gameRecord.progress_mode ?? 'linear',
            }
            : e
        )
      }
    ))
  }

  // ── addNewSaga ─────────────────────────────────────────────────────────────
  async function addEmptySaga(sagaData) {
    const { data: { user } } = await supabase.auth.getUser()
    const slug = sagaData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()

    const optimistic = {
      id: slug, _uuid: null,
      _createdAt: new Date().toISOString(),
      title: sagaData.title, developer: '',
      genre: [], platform: [],
      cover: null, entries: []
    }
    setSagas(prev => [optimistic, ...prev])

    const { data: saga, error: sagaError } = await supabase
      .from('sagas')
      .insert({
        slug,
        title: sagaData.title,
        user_id: user.id
      })
      .select()
      .single()

    if (sagaError) {
      console.error('Error insertando saga:', sagaError.message)
      setSagas(prev => prev.filter(s => s.id !== slug))
      return null
    }

    setSagas(prev => prev.map(s =>
      s.id === slug ? { ...s, _uuid: saga.id } : s
    ))
    return slug
  }

  async function addNewSaga(sagaData, firstEntry) {
    console.log('addNewSaga llamado con:', sagaData, firstEntry)
    const sagaSlug = await addEmptySaga(sagaData)
    console.log('sagaSlug retornado:', sagaSlug)
    if (!sagaSlug) return
    if (firstEntry) await addEntryToSaga(sagaSlug, firstEntry)
  }

  // ── updateSingleGame ───────────────────────────────────────────────────────
  async function updateSingleGame(gameId, gameData) {
    setSingles(prev => prev.map(g =>
      g.id !== gameId ? g : {
        ...g,
        title: gameData.title, developer: gameData.developer,
        year: parseInt(gameData.year),
        genre: gameData.genre, genres: gameData.genre,
        platform: gameData.platform, platforms: gameData.platform,
        cover: gameData.cover !== undefined ? normalizeUrl(gameData.cover) : g.cover,
        description: gameData.description ?? g.description,
        summary: gameData.summary ?? g.summary,
        // ✅ Agregar tiempos al estado local
        hltb_main: gameData.hltb_main ?? g.hltb_main,
        hltb_main_extra: gameData.hltb_main_extra ?? g.hltb_main_extra,
        hltb_completionist: gameData.hltb_completionist ?? g.hltb_completionist,
      }
    ))

    const game = singles.find(g => g.id === gameId)
    if (!game?._uuid) return

    await supabase
      .from('games')
      .update({
        title: gameData.title, developer: gameData.developer,
        release_year: parseInt(gameData.year),
        cover_url: gameData.cover !== undefined ? normalizeUrl(gameData.cover) : undefined,
        description: gameData.description || gameData.summary || null,
        genres: gameData.genre || [],
        platforms: gameData.platform || [],
        // ✅ Agregar tiempos al update de Supabase
        hltb_main: gameData.hltb_main ? parseFloat(gameData.hltb_main) : null,
        hltb_main_extra: gameData.hltb_main_extra ? parseFloat(gameData.hltb_main_extra) : null,
        hltb_completionist: gameData.hltb_completionist ? parseFloat(gameData.hltb_completionist) : null,
      })
      .eq('id', game._uuid)
  }

  // ── updateSagaEntry ────────────────────────────────────────────────────────
  async function updateSagaEntry(sagaId, entryId, entryData) {
    setSagas(prev => prev.map(saga =>
      saga.id !== sagaId ? saga : {
        ...saga,
        entries: saga.entries.map(entry =>
          entry.id !== entryId ? entry : {
            ...entry,
            title: entryData.title, year: parseInt(entryData.year),
            developer: entryData.developer ?? entry.developer,
            genre: entryData.genre ?? entry.genre,
            genres: entryData.genre ?? entry.genres,
            platform: entryData.platform ?? entry.platform,
            platforms: entryData.platform ?? entry.platforms,
            cover: entryData.cover !== undefined ? normalizeUrl(entryData.cover) : entry.cover,
            description: entryData.description ?? entry.description,
            summary: entryData.summary ?? entry.summary
          }
        )
      }
    ))

    const saga = sagas.find(s => s.id === sagaId)
    const entry = saga?.entries.find(e => e.id === entryId)
    if (!entry?._uuid) return

    await supabase
      .from('games')
      .update({
        title: entryData.title, release_year: parseInt(entryData.year),
        developer: entryData.developer || null,
        cover_url: entryData.cover !== undefined ? normalizeUrl(entryData.cover) : undefined,
        description: entryData.description || entryData.summary || null,
        genres: entryData.genre || [],
        platforms: entryData.platform || []
      })
      .eq('id', entry._uuid)
  }

  // ── updateSaga ─────────────────────────────────────────────────────────────
  async function updateSaga(sagaId, sagaData) {
    setSagas(prev => prev.map(s =>
      s.id !== sagaId ? s : {
        ...s,
        title: sagaData.title, developer: sagaData.developer,
        genre: sagaData.genre, platform: sagaData.platform
      }
    ))

    const saga = sagas.find(s => s.id === sagaId)
    if (!saga?._uuid) return

    await supabase
      .from('sagas')
      .update({
        title: sagaData.title, developer: sagaData.developer,
        genres: sagaData.genre || [],
        platforms: sagaData.platform || []
      })
      .eq('id', saga._uuid)
  }

  // ── updateSagaCover ────────────────────────────────────────────────────────
  async function updateSagaCover(sagaId, cover) {
    setSagas(prev => prev.map(s =>
      s.id !== sagaId ? s : { ...s, cover: normalizeUrl(cover) }
    ))

    const saga = sagas.find(s => s.id === sagaId)
    if (!saga?._uuid) return

    await supabase.from('sagas').update({ cover_url: normalizeUrl(cover) }).eq('id', saga._uuid)
  }

  // ── updateEntryCover ───────────────────────────────────────────────────────
  async function updateEntryCover(sagaId, entryId, cover) {
    setSagas(prev => prev.map(s =>
      s.id !== sagaId ? s : {
        ...s,
        entries: s.entries.map(e =>
          e.id !== entryId ? e : { ...e, cover: normalizeUrl(cover) }
        )
      }
    ))

    const saga = sagas.find(s => s.id === sagaId)
    const entry = saga?.entries.find(e => e.id === entryId)
    if (!entry?._uuid) return

    await supabase.from('games').update({ cover_url: normalizeUrl(cover) }).eq('id', entry._uuid)
  }

  // ── deleteSingleGame ───────────────────────────────────────────────────────
  async function deleteSingleGame(gameId) {
    const game = singles.find(g => g.id === gameId)
    setSingles(prev => prev.filter(g => g.id !== gameId))

    if (game?._entryUuid) {
      await supabase.from('library_entries').delete().eq('id', game._entryUuid)
    }
  }

  // ── deleteSagaEntry ────────────────────────────────────────────────────────
  async function deleteSagaEntry(sagaId, entryId) {
    const saga = sagas.find(s => s.id === sagaId)
    const entry = saga?.entries.find(e => e.id === entryId)

    setSagas(prev => prev.map(s =>
      s.id !== sagaId ? s : { ...s, entries: s.entries.filter(e => e.id !== entryId) }
    ))

    if (entry?._entryUuid) {
      await supabase.from('library_entries').delete().eq('id', entry._entryUuid)
    }
  }

  // ── deleteSaga ─────────────────────────────────────────────────────────────
  async function deleteSaga(sagaId) {
    const saga = sagas.find(s => s.id === sagaId)
    setSagas(prev => prev.filter(s => s.id !== sagaId))

    if (saga?._uuid) {
      // Elimina primero todas las library_entries de la saga
      await supabase.from('library_entries').delete().eq('saga_id', saga._uuid)
      // Luego elimina la saga
      await supabase.from('sagas').delete().eq('id', saga._uuid)
    }
  }

  // ── moveGameToSaga ─────────────────────────────────────────────────────────
  async function moveGameToSaga(gameId, sagaId) {
    const game = singles.find(g => g.id === gameId)
    const saga = sagas.find(s => s.id === sagaId)
    if (!game || !saga) return

    const movedEntry = {
      ...game,
      sagaTitle: saga.title, sagaId, _sagaUuid: saga._uuid, isSagaEntry: true
    }

    setSingles(prev => prev.filter(g => g.id !== gameId))
    setSagas(prev => prev.map(s =>
      s.id !== sagaId ? s : { ...s, entries: [...s.entries, movedEntry] }
    ))

    // ✅ Actualiza library_entries con el _entryUuid del juego
    if (game._entryUuid && saga._uuid) {
      await supabase
        .from('library_entries')
        .update({ saga_id: saga._uuid })
        .eq('id', game._entryUuid)
    }
  }

  // ── Helper optimistic update ───────────────────────────────────────────────
  function _updateEntryOptimistic(game, changes) {
    if (game.isSagaEntry) {
      setSagas(prev => prev.map(saga =>
        saga.id !== game.sagaId ? saga : {
          ...saga,
          entries: saga.entries.map(e => e.id === game.id ? { ...e, ...changes } : e)
        }
      ))
    } else {
      setSingles(prev => prev.map(g => g.id === game.id ? { ...g, ...changes } : g))
    }
  }

  // ── Return (misma interfaz que useGames) ───────────────────────────────────
  return {
    singles,
    sagas,
    libraryGames,
    inProgressGames,
    completedGames,
    suggestedGame,
    loadingData,
    currentUser,
    pickRandomGame,
    dismissSuggestion,
    startPlaying,
    completeGame,
    returnToLibrary,
    addSingleGame,
    addEntryToSaga,
    addNewSaga,
    addEmptySaga,
    updateSingleGame,
    updateSagaEntry,
    updateSaga,
    updateSagaCover,
    updateEntryCover,
    deleteSingleGame,
    deleteSagaEntry,
    deleteSaga,
    moveGameToSaga
  }
}