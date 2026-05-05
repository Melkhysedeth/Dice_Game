/**
 * Devuelve la URL completa de la portada de un juego o saga.
 * Maneja URLs relativas de IGDB que empiezan con //
 */
export function getCover(game) {
  if (!game?.cover) return null
  return game.cover.startsWith('//') ? `https:${game.cover}` : game.cover
}