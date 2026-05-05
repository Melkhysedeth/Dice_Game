import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'
import GameModal from '../../features/games/components/GameModal'
import { getCover } from '../../utils/gameUtils'
import styles from './GlobalSearch.module.css'

const STATE_META = {
  library: { label: 'Biblioteca', color: 'var(--accent)', emoji: '📚', mode: 'library' },
  in_progress: { label: 'En progreso', color: 'var(--accent-2)', emoji: '🎮', mode: 'in_progress' },
  completed: { label: 'Salón de la fama', color: 'var(--state-fame)', emoji: '🏆', mode: 'hall_of_fame' },
}

function GlobalSearch({ libraryGames = [], inProgressGames = [], completedGames = [], sagas = [] }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  // Cerrar panel al click fuera
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Ctrl+K / Escape
  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Lista plana con estado
  const allGames = [
    ...libraryGames.filter(g => !g.isSagaEntry).map(g => ({ ...g, _state: 'library' })),
    ...inProgressGames.map(g => ({ ...g, _state: 'in_progress' })),
    ...completedGames.map(g => ({ ...g, _state: 'completed' })),
    ...sagas.flatMap(saga =>
      (saga.entries ?? []).map(e => ({
        ...e,
        sagaTitle: saga.title,
        _state: 'library',
      }))
    ),
  ]

  const q = query.toLowerCase().trim()
  const results = q.length >= 1 ? allGames.filter(g => g.title?.toLowerCase().includes(q)) : []

  const groups = [
    { key: 'library', items: results.filter(g => g._state === 'library') },
    { key: 'in_progress', items: results.filter(g => g._state === 'in_progress') },
    { key: 'completed', items: results.filter(g => g._state === 'completed') },
  ].filter(g => g.items.length > 0)

  function handleSelect(game) {
    setSelectedGame(game)
    setOpen(false)
    setQuery('')
  }

  // Preparar el game para el modal (igual que en las vistas)
  function prepareGame(game) {
    if (!game) return null
    const cover = getCover(game)
    if (game._state === 'in_progress') {
      const d = game.sessions?.at(-1)?.startDate
      return {
        ...game,
        genres: game.genre ?? [],
        cover,
        startDate: d ?? '—',
        lastSession: (() => {
          if (!d) return '—'
          const diff = Math.floor((new Date() - new Date(d)) / 86400000)
          if (diff === 0) return 'Hoy'
          if (diff === 1) return 'Ayer'
          return `Hace ${diff} días`
        })(),
        sessions: game.sessions?.length ?? 0,
        progress: game.progress ?? 50,
      }
    }
    return { ...game, cover }
  }

  return (
    <>
      <div className={styles.wrapper} ref={wrapperRef}>
        <div className={`${styles.searchBox} ${open ? styles.searchBoxActive : ''}`}>
          <Search size={15} className={styles.icon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Buscar juegos..."
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
          />
          {query
            ? <button className={styles.clear} onClick={() => { setQuery(''); inputRef.current?.focus() }}><X size={13} /></button>
            : <span className={styles.shortcut}>Ctrl K</span>
          }
        </div>

        {open && q.length >= 1 && (
          <div className={styles.panel}>
            {results.length === 0 ? (
              <div className={styles.empty}>
                <span>🔍</span>
                <p>Sin resultados para <strong>"{query}"</strong></p>
              </div>
            ) : (
              <>
                <div className={styles.panelHeader}>
                  {results.length} resultado{results.length !== 1 ? 's' : ''}
                </div>
                {groups.map(group => {
                  const meta = STATE_META[group.key]
                  return (
                    <div key={group.key} className={styles.group}>
                      <div className={styles.groupLabel} style={{ color: meta.color }}>
                        <span>{meta.emoji}</span> {meta.label}
                      </div>
                      {group.items.map(game => {
                        const cover = getCover(game)
                        return (
                          <button
                            key={game.id}
                            className={styles.result}
                            onClick={() => handleSelect(game)}
                          >
                            <div className={styles.cover}>
                              {cover
                                ? <img src={cover} alt={game.title} className={styles.coverImg} />
                                : <div className={styles.coverPlaceholder}>{meta.emoji}</div>
                              }
                            </div>
                            <div className={styles.info}>
                              <span className={styles.title}>{game.title}</span>
                              {game.sagaTitle && (
                                <span className={styles.saga}>{game.sagaTitle}</span>
                              )}
                            </div>
                            <span className={styles.badge} style={{ color: meta.color, borderColor: meta.color }}>
                              {meta.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* MODAL — fuera del wrapper para no tener problemas de z-index */}
      {selectedGame && createPortal(
        <GameModal
          game={prepareGame(selectedGame)}
          mode={STATE_META[selectedGame._state].mode}
          onClose={() => setSelectedGame(null)}
          onAction={() => setSelectedGame(null)}
        />,
        document.body
      )}
    </>
  )
}

export default GlobalSearch