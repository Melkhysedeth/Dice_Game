export const handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    }
  }

  const { gameName } = JSON.parse(event.body)
  if (!gameName) return { statusCode: 400, body: JSON.stringify({ error: 'gameName requerido' }) }

  try {
    const payload = {
      searchType: "games",
      searchTerms: gameName.split(" "),
      searchPage: 1,
      size: 20,
      searchOptions: {
        games: {
          userId: 0, platform: "", sortCategory: "popular",
          rangeCategory: "main", rangeTime: { min: null, max: null },
          gameplay: { perspective: "", flow: "", genre: "" },
          modifier: "",
        },
        users: { sortCategory: "postcount" },
        filter: "", sort: 0, randomizer: 0,
      },
    }

    const res = await fetch("https://howlongtobeat.com/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://howlongtobeat.com/",
        "Origin": "https://howlongtobeat.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "*/*",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ hltb_found: false, error: 'HLTB_BLOCKED' })
      }
    }

    const data = await res.json()
    const game = data.data?.find(g =>
      g.game_name.toLowerCase().includes(gameName.toLowerCase())
    ) || data.data?.[0]

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hltb_found: !!game,
        hltb_main:          game ? Math.round(game.comp_main  / 3600) : null,
        hltb_main_extra:    game ? Math.round(game.comp_plus  / 3600) : null,
        hltb_completionist: game ? Math.round(game.comp_100   / 3600) : null,
        hltb_source: game ? 'api' : 'manual',
      })
    }

  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ hltb_found: false, error: err.message })
    }
  }
}