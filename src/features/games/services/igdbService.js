export async function searchGameCovers(name) {
  try {
    const response = await fetch('/.netlify/functions/igdb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })

    if (!response.ok) throw new Error('Error en la búsqueda')

    const results = await response.json()
    return results
  } catch (error) {
    console.error('Error buscando carátulas:', error)
    return []
  }
}