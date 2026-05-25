export function detectProgressMode(igdbData = {}) {
  const modes = (igdbData.game_modes ?? []).map(m => m.toLowerCase())
  const genres = (igdbData.genres ?? []).map(g => g.toLowerCase())

  if (modes.some(m => ['battle royale', 'mmo', 'massively multiplayer online'].includes(m)))
    return 'competitive'
  if (genres.some(g => ['simulator', 'simulador', 'simulation', 'strategy', 'estrategia'].includes(g)))
    return 'infinite'
  return 'linear'
}

export async function fetchGameMetadata(gameName, igdbData = {}) {
  const progress_mode = detectProgressMode(igdbData)
  try {
    const res = await fetch('/.netlify/functions/hltb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName })
    })
    const data = await res.json()
    return { progress_mode, ...data }
  } catch {
    return { progress_mode, hltb_found: false, hltb_source: 'manual' }
  }
}