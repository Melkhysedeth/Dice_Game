import OpenWorldProgressView from './OpenWorldProgressView'
import { useParams, useNavigate } from 'react-router-dom'
import LinearProgressView from './LinearProgressView'

const INFINITE_ACHIEVEMENTS = [
  { id: 'IA01', name: '100 horas en el abismo',  condition: h => h >= 100,      msg: 'Este mundo ya es parte de ti.',        xp: 30 },
  { id: 'IA02', name: 'Constante',               condition: (_, s) => s >= 7,   msg: 'Racha de 7 días. Imparable.',          xp: 25 },
  { id: 'IA03', name: 'Veterano',                condition: h => h >= 500,       msg: '500 horas. Una leyenda viviente.',     xp: 50 },
  { id: 'IA04', name: 'Primera temporada',       condition: (_, __, m) => m >= 1, msg: 'Un mes activo en este mundo.',        xp: 20 },
  { id: 'IA05', name: 'Mundo Activo',            condition: (_, s) => s >= 30,  msg: '30 sesiones registradas.',             xp: 20 },
]

const COMPETITIVE_ACHIEVEMENTS = [
  { id: 'CA01', name: 'Primera sangre',     condition: (_, s) => s >= 1,  msg: 'Primera sesión registrada.',        xp: 10 },
  { id: 'CA02', name: 'En racha',           condition: (_, s) => s >= 7,  msg: 'Racha de 7 días. Imparable.',       xp: 25 },
  { id: 'CA03', name: 'Veterano del campo', condition: h => h >= 100,     msg: '100 horas en el campo de batalla.', xp: 30 },
  { id: 'CA04', name: 'Obsesionado',        condition: (_, s) => s >= 50, msg: '50 sesiones. La arena es tu hogar.',xp: 40 },
  { id: 'CA05', name: 'Leyenda',            condition: h => h >= 500,     msg: '500 horas. Tu nombre resuena.',     xp: 50 },
]

export default function GameProgressView({ games, onComplete }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const game = games?.find(g => g.id === id)

  if (!game) return (
    <div style={{ padding: '2rem', color: 'var(--text)' }}>
      Juego no encontrado.{' '}
      <button onClick={() => navigate('/en-progreso')}>← Volver</button>
    </div>
  )

  if (game.progress_mode === 'infinite')
    return <OpenWorldProgressView game={game} onComplete={onComplete} achievements={INFINITE_ACHIEVEMENTS} />
  if (game.progress_mode === 'competitive')
    return <OpenWorldProgressView game={game} onComplete={onComplete} achievements={COMPETITIVE_ACHIEVEMENTS} />
  return <LinearProgressView game={game} onComplete={onComplete} />
}