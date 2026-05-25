import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { gameName, igdbGenres = [], igdbModes = [], timeToBeat = null } = await req.json();

    // 1. Lógica de progress_mode (Igual)
    let progress_mode = "linear";
    const competitiveModes = ["battle royale", "mmo", "massively multiplayer online"];
    const infiniteGenres   = ["simulator", "simulation", "strategy", "real time strategy"];
    const modesLower  = igdbModes.map((m: string) => m.toLowerCase());
    const genresLower = igdbGenres.map((g: string) => g.toLowerCase());

    if (modesLower.some((m: string) => competitiveModes.includes(m))) {
      progress_mode = "competitive";
    } else if (!timeToBeat && genresLower.some((g: string) => infiniteGenres.includes(g))) {
      progress_mode = "infinite";
    }

    // 2. Buscar en HLTB con Headers mejorados
    const payload = {
      searchType: "games",
      searchTerms: gameName.split(" "),
      searchPage: 1,
      size: 20,
      searchOptions: {
        games: {
          userId: 0,
          platform: "",
          sortCategory: "popular",
          rangeCategory: "main",
          rangeTime: { min: null, max: null },
          gameplay: { perspective: "", flow: "", genre: "" },
          modifier: "",
        },
        users: { sortCategory: "postcount" },
        filter: "",
        sort: 0,
        randomizer: 0,
      },
    };

    const hltbRes = await fetch("https://howlongtobeat.com/api/search", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Origin": "https://howlongtobeat.com",
        "Referer": "https://howlongtobeat.com/",
      },
      body: JSON.stringify(payload),
    });

    // Si HLTB falla, devolvemos un objeto vacío en lugar de un error 500
    if (!hltbRes.ok) {
      console.error(`HLTB API error: ${hltbRes.status}`);
      return new Response(JSON.stringify({ 
        progress_mode, 
        hltb_found: false, 
        error: "HLTB_BLOCKED" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hltbData = await hltbRes.json();
    // Buscamos el juego que mejor coincida (comparación simple de nombre)
    const game = hltbData.data?.find((g: any) => 
      g.game_name.toLowerCase().includes(gameName.toLowerCase())
    ) || hltbData.data?.[0];

    // 3. Respuesta
    const result = {
      progress_mode,
      hltb_found: !!game,
      hltb_main:          game ? Math.round(game.comp_main / 3600) : null,
      hltb_main_extra:    game ? Math.round(game.comp_plus / 3600) : null,
      hltb_completionist: game ? Math.round(game.comp_100 / 3600) : null,
      hltb_source: game ? "api" : "manual",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
