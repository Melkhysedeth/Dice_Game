/**
 * Devuelve la URL completa de la portada de un juego o saga.
 * Maneja URLs relativas de IGDB que empiezan con //
 */
export function getCover(game) {
  if (!game?.cover) return null
  return game.cover.startsWith('//') ? `https:${game.cover}` : game.cover
}

// Reemplaza el tamaño en URLs de IGDB (ej: t_thumb → t_1080p)
export function getIgdbImage(url, size = 't_screenshot_med') {
  if (!url) return null
  const full = url.startsWith('//') ? `https:${url}` : url
  return full.replace(/t_[a-z0-9_]+/, size)
}