export async function searchGameCovers(name) {
  try {
    const cleaned = name.trim()
      .replace(/[":]/g, '')           // quita comillas y dos puntos
      .replace(/\b(19|20)\d{2}\b/g, '') // quita años tipo 2019, 1998
      .replace(/\s+/g, ' ')           // normaliza espacios
      .trim()

    const response = await fetch('/.netlify/functions/igdb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleaned })
    })

    if (!response.ok) throw new Error('Error en la búsqueda')

    const results = await response.json()
    return results
  } catch (error) {
    console.error('Error buscando carátulas:', error)
    return []
  }
}