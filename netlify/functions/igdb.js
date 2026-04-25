export const handler = async function(event) {
  const { name } = JSON.parse(event.body)

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Nombre requerido' })
    }
  }

  try {
    // Verificamos que las variables existen
    console.log('CLIENT_ID existe:', !!process.env.TWITCH_CLIENT_ID)
    console.log('CLIENT_SECRET existe:', !!process.env.TWITCH_CLIENT_SECRET)

    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: 'POST' }
    )
    const tokenData = await tokenRes.json()
    console.log('Token response:', tokenData)

    const accessToken = tokenData.access_token

    if (!accessToken) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No se pudo obtener token', detail: tokenData })
      }
    }

    const igdbRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain'
      },
      body: `search "${name}"; fields name, cover.url; limit 5;`
    })

    const games = await igdbRes.json()
    console.log('IGDB response:', games)

    const results = games
      .filter(g => g.cover)
      .map(g => ({
        id: g.id,
        name: g.name,
        cover: g.cover.url.replace('t_thumb', 't_cover_big')
      }))

    return {
      statusCode: 200,
      body: JSON.stringify(results)
    }

  } catch (error) {
    console.error('Error completo:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, stack: error.stack })
    }
  }
}