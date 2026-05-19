// netlify/functions/igdb.js
export const handler = async function (event) {
  const { name } = JSON.parse(event.body)

  if (!name) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Nombre requerido' }) }
  }

  try {
    // 1. Token Twitch
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: 'POST' }
    )
    const { access_token } = await tokenRes.json()
    if (!access_token) {
      return { statusCode: 500, body: JSON.stringify({ error: 'No se pudo obtener token' }) }
    }

    // 2. Buscar en IGDB con todos los campos
    const igdbRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'text/plain'
      },
      body: `
        search "${name}";
        fields
         name,
         cover.url,
         first_release_date,
         involved_companies.company.name,
         involved_companies.developer,
         involved_companies.publisher,
         genres.name,
         themes.name,
         game_modes.name,
         platforms.name,
         summary,
         rating,
         rating_count,
         screenshots.url;
        limit 12;
      `
    })

    const games = await igdbRes.json()

    // Mapeo géneros IGDB → español
    const genreMap = {
      'Point-and-click': 'Aventura',
      'Fighting': 'Acción',
      'Shooter': 'FPS',
      'Platform': 'Plataformas',
      'Puzzle': 'Puzzle',
      'Racing': 'Carreras',
      'Real Time Strategy (RTS)': 'Estrategia',
      'Role-playing (RPG)': 'RPG',
      'Simulator': 'Simulador',
      'Sport': 'Deportes',
      'Strategy': 'Estrategia',
      'Turn-based strategy (TBS)': 'Estrategia',
      'Tactical': 'Estrategia',
      "Hack and slash/Beat 'em up": 'Acción',
      'Adventure': 'Aventura',
      'Arcade': 'Arcade',
      'Visual Novel': 'Narrativa',
      'Indie': 'Indie',
      'MOBA': 'Multijugador',
      'Stealth': 'Sigilo',
    }

    // Mapeo plataformas IGDB → tus plataformas
    const platformMap = {
      'PC (Microsoft Windows)': 'PC',
      'PlayStation 4': 'PS4',
      'PlayStation 5': 'PS5',
      'Xbox One': 'Xbox',
      'Xbox Series X|S': 'Xbox',
      'Nintendo Switch': 'Switch',
      'iOS': 'iOS',
      'Android': 'Android',
      'Mac': 'PC',
      'Linux': 'PC',
    }

    // Mapeo temas IGDB → español
    const themeMap = {
      'Action': 'Acción',
      'Fantasy': 'Fantasía',
      'Science fiction': 'Ciencia Ficción',
      'Horror': 'Terror',
      'Thriller': 'Thriller',
      'Survival': 'Supervivencia',
      'Historical': 'Histórico',
      'Stealth': 'Sigilo',
      'Comedy': 'Comedia',
      'Open world': 'Mundo Abierto',
      'Sandbox': 'Sandbox',
      'Mystery': 'Misterio',
      'Drama': 'Drama',
      'Kids': 'Familiar',
      'Warfare': 'Bélico',
    }

    // Mapeo modos de juego
    const gameModeMap = {
      'Single player': 'Un jugador',
      'Multiplayer': 'Multijugador',
      'Co-operative': 'Cooperativo',
      'Split screen': 'Pantalla dividida',
      'Massively Multiplayer Online (MMO)': 'MMO',
      'Battle Royale': 'Battle Royale',
    }

    const results = games
      .filter(g => g.cover)
      .map(g => {
        const devCompany = g.involved_companies?.find(ic => ic.developer)
        const pubCompany = g.involved_companies?.find(ic => ic.publisher)
        const developer = devCompany?.company?.name || pubCompany?.company?.name || ''

        const year = g.first_release_date
          ? new Date(g.first_release_date * 1000).getFullYear()
          : null

        const genres = (g.genres || [])
          .map(genre => genreMap[genre.name] || genre.name)
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 4)

        const platforms = (g.platforms || [])
          .map(p => platformMap[p.name])
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i)

        const screenshots = (g.screenshots || [])
          .slice(0, 3)
          .map(s => 'https:' + s.url.replace('t_thumb', 't_screenshot_big'))

        const rating = g.rating ? Math.round((g.rating / 100) * 50) / 10 : null

        const themes = (g.themes || [])
          .map(t => themeMap[t.name] || t.name)
          .filter((v, i, a) => a.indexOf(v) === i)

        // Unifica géneros + temas en un solo array "tags"
        const tags = [...new Set([...genres, ...themes])].slice(0, 8)

        const gameModes = (g.game_modes || [])
          .map(m => gameModeMap[m.name] || m.name)
          .filter((v, i, a) => a.indexOf(v) === i)

        return {
          id: g.id,
          name: g.name,
          cover: g.cover.url.replace('t_thumb', 't_cover_big'),
          developer,
          year,
          genres,      
          themes,     
          tags,      
          gameModes,
          platforms,
          summary: g.summary || '',
          rating,
          ratingCount: g.rating_count || 0,
          screenshots
        }
      })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    }

  } catch (error) {
    console.error('Error IGDB:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}