import { supabase } from '../lib/supabase'

const STORAGE_KEYS = {
  singles: 'gamevault_singles',
  sagas: 'gamevault_sagas'
}

function loadFromStorage(key) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function normalizeUrl(url) {
  if (!url) return null
  if (url.startsWith('//')) return 'https:' + url
  return url
}

export async function migrateToSupabase() {
  const singles = loadFromStorage(STORAGE_KEYS.singles)
  const sagas = loadFromStorage(STORAGE_KEYS.sagas)

  console.log('🚀 Iniciando migración...')
  console.log(`📦 Singles: ${singles.length} | Sagas: ${sagas.length}`)

  // ── 1. Insertar SAGAS ──────────────────────────────────
  const sagaRows = sagas.map(saga => ({
    slug: saga.id,
    title: saga.title,
    developer: saga.developer || null,
    cover_url: normalizeUrl(saga.cover),
    genres: saga.genre || [],
    platforms: saga.platform || []
  }))

  const { data: insertedSagas, error: sagasError } = await supabase
    .from('sagas')
    .upsert(sagaRows, { onConflict: 'slug' })
    .select()

  if (sagasError) {
    console.error('❌ Error insertando sagas:', sagasError.message)
    return { success: false, error: sagasError.message }
  }
  console.log(`✅ Sagas insertadas: ${insertedSagas.length}`)

  // Mapa slug → uuid para referencias
  const sagaIdMap = {}
  insertedSagas.forEach(s => { sagaIdMap[s.slug] = s.id })

  // ── 2. Insertar GAMES (entries de sagas) ───────────────
  const sagaGameRows = sagas.flatMap(saga =>
    (saga.entries || []).map(entry => ({
      slug: entry.id,
      title: entry.title,
      release_year: entry.year || null,
      developer: entry.developer || saga.developer || null,
      cover_url: normalizeUrl(entry.cover),
      description: entry.description || entry.summary || null,
      genres: entry.genre || entry.genres || saga.genre || [],
      platforms: entry.platform || entry.platforms || saga.platform || [],
      saga_id: sagaIdMap[saga.id] || null
    }))
  )

  // ── 3. Insertar GAMES (singles) ────────────────────────
  const singleGameRows = singles.map(game => ({
    slug: game.id,
    title: game.title,
    release_year: game.year || null,
    developer: game.developer || null,
    cover_url: normalizeUrl(game.cover),
    description: game.description || game.summary || null,
    genres: game.genre || game.genres || [],
    platforms: game.platform || game.platforms || [],
    saga_id: null
  }))

  const allGameRows = [...sagaGameRows, ...singleGameRows]

  const { data: insertedGames, error: gamesError } = await supabase
    .from('games')
    .upsert(allGameRows, { onConflict: 'slug' })
    .select()

  if (gamesError) {
    console.error('❌ Error insertando games:', gamesError.message)
    return { success: false, error: gamesError.message }
  }
  console.log(`✅ Games insertados: ${insertedGames.length}`)

  // Mapa slug → uuid
  const gameIdMap = {}
  insertedGames.forEach(g => { gameIdMap[g.slug] = g.id })

  // ── 4. Obtener usuario actual ──────────────────────────
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.warn('⚠️ No hay usuario autenticado. library_entries y play_sessions se omiten.')
    console.log('ℹ️ Ejecuta la migración después de hacer login.')
    return { success: true, partial: true, insertedGames: insertedGames.length }
  }

  // ── 5. Insertar LIBRARY ENTRIES ────────────────────────
  const allEntries = [
    ...singles.map(g => ({ ...g, isSaga: false, sagaId: null })),
    ...sagas.flatMap(saga =>
      (saga.entries || []).map(entry => ({ ...entry, isSaga: true, sagaId: saga.id }))
    )
  ]

  const libraryRows = allEntries.map(entry => ({
    user_id: user.id,
    game_id: gameIdMap[entry.id],
    status: entry.status || 'library'
  })).filter(r => r.game_id) // descarta cualquier huérfano

  const { data: insertedEntries, error: entriesError } = await supabase
    .from('library_entries')
    .upsert(libraryRows, { onConflict: 'user_id,game_id' })
    .select()

  if (entriesError) {
    console.error('❌ Error insertando library_entries:', entriesError.message)
    return { success: false, error: entriesError.message }
  }
  console.log(`✅ Library entries insertadas: ${insertedEntries.length}`)

  // Mapa game_id → library_entry uuid
  const entryIdMap = {}
  insertedEntries.forEach(e => { entryIdMap[e.game_id] = e.id })

  // ── 6. Insertar PLAY SESSIONS ──────────────────────────
  const sessionRows = allEntries.flatMap(entry => {
    const gameUuid = gameIdMap[entry.id]
    const entryUuid = entryIdMap[gameUuid]
    if (!entryUuid) return []

    return (entry.sessions || [])
      .filter(s => s.startDate)
      .map(s => ({
        library_entry_id: entryUuid,
        start_date: s.startDate,
        end_date: s.endDate || null,
        is_first_time: s.isFirstTime ?? true
      }))
  })

  if (sessionRows.length > 0) {
    const { error: sessionsError } = await supabase
      .from('play_sessions')
      .insert(sessionRows)

    if (sessionsError) {
      console.error('❌ Error insertando play_sessions:', sessionsError.message)
      return { success: false, error: sessionsError.message }
    }
    console.log(`✅ Play sessions insertadas: ${sessionRows.length}`)
  }

  console.log('🎉 Migración completada con éxito')
  return {
    success: true,
    sagas: insertedSagas.length,
    games: insertedGames.length,
    entries: insertedEntries.length,
    sessions: sessionRows.length
  }
}