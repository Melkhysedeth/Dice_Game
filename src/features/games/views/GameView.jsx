// GameView.jsx — vista inline del juego
import { useState } from 'react'
import { getIgdbImage } from '../../../utils/gameUtils'
import { FaPlaystation, FaXbox, FaWindows, FaApple, FaAndroid, FaLinux, FaGamepad } from 'react-icons/fa'
import {
  Play, RotateCcw, Edit2, Star, MoreHorizontal,
  Trophy, StickyNote, BarChart2, Camera,
  Info, BookOpen, Medal, ChevronLeft,
  Gamepad2, Building2, Calendar, Sword, Monitor,
  ImageOff
} from 'lucide-react'
import styles from './GameView.module.css'

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCoverUrl(url) {
  if (!url) return null
  return url.startsWith('//') ? `https:${url}` : url
}
function getHeroUrl(url) {
  if (!url) return null
  const base = url.startsWith('//') ? `https:${url}` : url
  return base.replace('t_cover_big', 't_screenshot_big')
}

// Acepta tanto "summary" (campo IGDB) como "description" (campo custom)
function getDescription(game) {
  return game.summary || game.description || null
}

// ── Constantes ────────────────────────────────────────────────────────────────
const TABS = ['Resumen', 'Logros', 'Actividad', 'Notas', 'Capturas', 'Información']
const TAB_ICONS = {
  Resumen: <BookOpen size={13} />,
  Logros: <Trophy size={13} />,
  Actividad: <BarChart2 size={13} />,
  Notas: <StickyNote size={13} />,
  Capturas: <Camera size={13} />,
  Información: <Info size={13} />,
}

// ── Icono de plataforma ───────────────────────────────────────────────────────
function PlatIcon({ name }) {
  const map = {
    'PS4': <FaPlaystation />,
    'PS5': <FaPlaystation />,
    'PS3': <FaPlaystation />,
    'Xbox': <FaXbox />,
    'PC': <FaWindows />,
    'Switch': <FaGamepad />,
    'iOS': <FaApple />,
    'Android': <FaAndroid />,
    'Linux': <FaLinux />,
    'Mac': <FaApple />,
  }
  return <span className={styles.platIcon}>{map[name] || <FaGamepad />}</span>
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: RESUMEN
// ─────────────────────────────────────────────────────────────────────────────
function TabResumen({ game }) {
  const [expanded, setExpanded] = useState(false)

  const description = getDescription(game)

  // Screenshots reales — solo si el juego tiene el campo screenshots/artworks
  // El usuario los cargará manualmente; por ahora mostramos el bloque vacío si no hay
  const screenshots = game.screenshots || game.artworks || []
  const [lightbox, setLightbox] = useState(null)


  // Datos para la tabla de detalles — todos los campos que puede traer IGDB
  const details = [
    { key: 'Género', val: (game.genres || game.genre)?.join(', ') },
    { key: 'Desarrollador', val: game.developer || game.developers?.join(', ') },
    { key: 'Editor', val: game.publisher || game.publishers?.join(', ') },
    { key: 'Fecha de lanzamiento', val: game.releaseDate || game.release_date },
    { key: 'Modos de juego', val: game.gameModes?.join(', ') || game.game_modes?.join(', ') },
    { key: 'Vista', val: game.playerPerspective || game.player_perspectives?.join(', ') },
    { key: 'Idioma', val: game.language },
    { key: 'Calificación IGDB', val: game.rating ? `${Math.round(game.rating)}/100` : null },
    // ── NUEVO ──
    { key: 'Historia principal:', val: game.hltb_main ? `~${game.hltb_main}h` : null },
    { key: 'Historia + extras:', val: game.hltb_main_extra ? `~${game.hltb_main_extra}h` : null },
    { key: 'Completionista:', val: game.hltb_completionist ? `~${game.hltb_completionist}h` : null },
  ].filter(d => d.val)

  {
    !game.hltb_main && !game.hltb_main_extra && !game.hltb_completionist && (
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '10px' }}>
        ⏱ Sin duración estimada.{' '}
        <a href={`https://howlongtobeat.com/?q=${encodeURIComponent(game.title)}`}
          target="_blank" rel="noreferrer"
          style={{ color: 'var(--accent)' }}>
          Consúltala en HowLongToBeat →
        </a>
      </p>
    )
  }

  // Plataformas — acepta array de strings o de objetos {name}
  const platforms = (game.platforms || game.platform || []).map(p =>
    typeof p === 'string' ? p : p.name
  )

  // Etiquetas = géneros + themes
  const tags = game.tags?.length
    ? game.tags
    : [
      ...(game.genres || game.genre || []),
      ...(game.themes || []),
      ...(game.keywords?.slice(0, 4) || []),
    ].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <div className={styles.tabContent}>

      {/* ── Fila superior: Descripción (izq) + Galería (der) ── */}
      <div className={styles.topRow}>
        {/* Descripción */}
        <div className={styles.descCol}>
          <span className={styles.sectionLabel}>DESCRIPCIÓN</span>
          {description ? (
            <>
              <p className={`${styles.descText} ${expanded ? styles.descExpanded : ''}`}>
                {description}
              </p>
              {description.length > 300 && (
                <button className={styles.linkBtn} onClick={() => setExpanded(v => !v)}>
                  {expanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </>
          ) : (
            <p className={styles.descEmpty}>Sin descripción disponible.</p>
          )}
        </div>

        {/* Galería */}
        {screenshots.length > 0 ? (
          <div className={styles.galleryCol}>
            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionLabel}>GALERÍA</span>
              {screenshots.length > 3 && (
                <button className={styles.linkBtn}>Ver todas ({screenshots.length})</button>
              )}
            </div>
            <div className={styles.galleryGrid}>
              {screenshots.slice(0, 3).map((s, i) => {
                const raw = typeof s === 'string' ? s : s.url
                const thumbUrl = getIgdbImage(raw, 't_screenshot_med')
                const hdUrl = getIgdbImage(raw, 't_1080p')
                return (
                  <div key={i} className={styles.galleryThumb} onClick={() => setLightbox(hdUrl)}>
                    <img src={thumbUrl} alt={`screenshot-${i + 1}`} />
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className={styles.galleryCol}>
            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionLabel}>GALERÍA</span>
            </div>
            <div className={styles.galleryEmpty}>
              <ImageOff size={22} />
              <span>Sin capturas aún</span>
            </div>
          </div>
        )}
      </div> {/* ← cierra topRow */}

      {/* ── Separador ── */}
      <div className={styles.divider} />

      {/* ── Fila inferior: Detalles + Plataformas + Etiquetas ── */}
      <div className={styles.bottomRow}>
        {/* Detalles */}
        <div className={styles.detailsCol}>
          <span className={styles.sectionLabel}>DETALLES</span>
          {details.length > 0 ? (
            <table className={styles.detailTable}>
              <tbody>
                {details.map(({ key, val }) => (
                  <tr key={key}>
                    <td className={styles.dKey}>{key}</td>
                    <td className={styles.dVal}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.descEmpty}>Sin información disponible.</p>
          )}
        </div>

        {/* Plataformas */}
        <div className={styles.platformsCol}>
          <span className={styles.sectionLabel}>PLATAFORMAS</span>
          {platforms.length > 0 ? (
            <div className={styles.platformGrid}>
              {platforms.map((p, i) => (
                <div key={i} className={styles.platformItem}>
                  <PlatIcon name={p} />
                  <div className={styles.platInfo}>
                    <span className={styles.platName}>{p}</span>
                    <span className={styles.platSub}>Disponible</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.descEmpty}>—</p>
          )}
        </div>

        {/* Etiquetas */}
        <div className={styles.tagsCol}>
          <span className={styles.sectionLabel}>ETIQUETAS</span>
          {tags.length > 0 ? (
            <div className={styles.tagCloud}>
              {tags.map((g, i) => (
                <span key={i} className={styles.tagPill}>{g}</span>
              ))}
            </div>
          ) : (
            <p className={styles.descEmpty}>—</p>
          )}
        </div>
      </div> {/* ← cierra bottomRow */}

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightboxOverlay} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="screenshot" className={styles.lightboxImg} />
        </div>
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: LOGROS
// ─────────────────────────────────────────────────────────────────────────────
function TabLogros() {
  const achievements = [
    { name: 'La conexión entre mundos', rarity: 'Raro', pct: 15.2, icon: '🏅', type: 'gold' },
    { name: 'Pasante', rarity: 'Común', pct: 87.1, icon: '⚔️', type: 'common' },
    { name: 'Geralt el Carnicero', rarity: 'Raro', pct: 22.7, icon: '🗡️', type: 'red' },
    { name: '???', rarity: 'Secreto', pct: null, icon: '🔒', type: 'secret' },
  ]
  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeaderRow}>
        <span className={styles.sectionLabel}>LOGROS</span>
        <button className={styles.linkBtn}>Ver todos (78)</button>
      </div>
      <div className={styles.achievementGrid}>
        {achievements.map((a, i) => (
          <div key={i} className={`${styles.achCard} ${styles[`ach_${a.type}`]}`}>
            <div className={styles.achIcon}>{a.icon}</div>
            <div className={styles.achName}>{a.name}</div>
            <div className={styles.achRarity}>{a.rarity}</div>
            {a.pct !== null && <div className={styles.achPct}>{a.pct}%</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: NOTAS
// ─────────────────────────────────────────────────────────────────────────────
function TabNotas({ game, onAction }) {
  return (
    <div className={styles.tabContent}>
      {game.notes ? (
        <>
          <div className={styles.sectionHeaderRow}>
            <span className={styles.sectionLabel}>NOTAS PERSONALES</span>
            <button className={styles.linkBtn} onClick={() => onAction?.('editNote')}>Editar</button>
          </div>
          <div className={styles.noteCard}>
            <span className={styles.noteQuote}>"</span>
            <p className={styles.noteText}>{game.notes}</p>
            <div className={styles.noteBottom}>
              {game.personalRating && <span className={styles.noteRating}>{game.personalRating}/10</span>}
              {game.notesDate && <span className={styles.noteMeta}>{game.notesDate}</span>}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <StickyNote size={32} className={styles.emptyIcon} />
          <p>Aún no has escrito notas para este juego.</p>
          <button className={styles.btnOutline} onClick={() => onAction?.('addNote')}>
            Añadir nota
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR DERECHO
// ─────────────────────────────────────────────────────────────────────────────
function RightSidebar({ game, mode }) {
  const showProgress = mode === 'in_progress' || mode === 'hall_of_fame'
  const pct = game.completionPct ?? 65
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const accentColor = mode === 'hall_of_fame' ? '#fbbf24' : '#a78bfa'
  const modeLabel = mode === 'hall_of_fame' ? 'Completado' : 'En progreso'
  const modeLabelColor = mode === 'hall_of_fame' ? '#fbbf24' : '#22c55e'

  const mockAch = [
    { name: 'La conexión entre mundos', rarity: 'Raro · 15.2%', icon: '🏅', type: 'gold' },
    { name: 'Pasante', rarity: 'Común · 87.1%', icon: '⚔️', type: 'common' },
    { name: 'Geralt el Carnicero', rarity: 'Raro · 22.7%', icon: '🗡️', type: 'red' },
    { name: '???', rarity: 'Secreto', icon: '🔒', type: 'secret' },
  ]

  return (
    <>
      {showProgress && (
        <div className={styles.sideCard}>
          <div className={styles.sideCardHeader}>
            <h4 className={styles.sideCardTitle}>TU PROGRESO</h4>
            <span className={styles.sideCardBadge} style={{ color: modeLabelColor }}>{modeLabel}</span>
          </div>
          <div className={styles.progressCircleRow}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
              <circle
                cx="45" cy="45" r={r} fill="none"
                stroke={accentColor} strokeWidth="7"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 45 45)"
                style={{ filter: `drop-shadow(0 0 5px ${accentColor}88)` }}
              />
              <text x="50%" y="44%" textAnchor="middle" dominantBaseline="central"
                fontSize="15" fontWeight="700" fill="#fff" fontFamily="var(--font-cards)">{pct}%</text>
              <text x="50%" y="60%" textAnchor="middle" dominantBaseline="central"
                fontSize="7.5" fill="rgba(255,255,255,0.4)" fontFamily="var(--font-body)">completado</text>
            </svg>
            <div className={styles.progressStats}>
              <div className={styles.progressStat}>
                <span className={styles.psLabel}>Tiempo jugado</span>
                <span className={styles.psVal}>{game.playTime || '—'}</span>
              </div>
              <div className={styles.progressStat}>
                <span className={styles.psLabel}>Iniciado el</span>
                <span className={styles.psVal}>{game.startDate || '—'}</span>
              </div>
              <div className={styles.progressStat}>
                <span className={styles.psLabel}>Última sesión</span>
                <span className={styles.psVal}>{game.lastSession || 'Hoy'}</span>
              </div>
              <div className={styles.progressStat}>
                <span className={styles.psLabel}>Tamaño</span>
                <span className={styles.psVal}>{game.size || '—'}</span>
              </div>
            </div>
          </div>
          <div className={styles.achievementsBar}>
            <div className={styles.achievementsBarFill}
              style={{ width: `${(game.achievementsUnlocked ?? 46) / (game.achievementsTotal ?? 78) * 100}%` }} />
          </div>
          <div className={styles.achievementsCount}>
            <Trophy size={11} />
            <span>{game.achievementsUnlocked ?? 46}/{game.achievementsTotal ?? 78} logros</span>
          </div>
        </div>
      )}

      <div className={styles.sideCard}>
        <div className={styles.sideCardHeader}>
          <h4 className={styles.sideCardTitle}>LOGROS</h4>
          <button className={styles.linkBtn}>Ver todos (78)</button>
        </div>
        <div className={styles.achGrid}>
          {mockAch.map((a, i) => (
            <div key={i} className={`${styles.achSmall} ${styles[`ach_${a.type}`]}`}>
              <div className={styles.achSmallIcon}>{a.icon}</div>
              <div className={styles.achSmallName}>{a.name}</div>
              <div className={styles.achSmallRarity}>{a.rarity}</div>
            </div>
          ))}
        </div>
      </div>

      {game.notes && (
        <div className={styles.sideCard}>
          <div className={styles.sideCardHeader}>
            <h4 className={styles.sideCardTitle}>NOTAS PERSONALES</h4>
            <button className={styles.linkBtn}>Editar</button>
          </div>
          <div className={styles.noteCardSide}>
            <span className={styles.noteQuote}>"</span>
            <p className={styles.noteText}>{game.notes}</p>
            {game.personalRating && (
              <div className={styles.noteBottom}>
                <span className={styles.noteRating}>{game.personalRating}/10</span>
                {game.notesDate && <span className={styles.noteMeta}>{game.notesDate}</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function GameView({ game, mode = 'library', onBack, onClose, onAction, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState('Resumen')
  const [isFav, setIsFav] = useState(game?.isFavorite || false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (!game) return null

  const coverUrl = getCoverUrl(game.cover)
  const heroUrl = game.heroImage || getHeroUrl(game.cover)

  const accentByMode = {
    library: 'var(--accent)',
    in_progress: 'var(--accent-2)',
    hall_of_fame: 'var(--accent-4, #fbbf24)',
  }
  const accent = accentByMode[mode] || 'var(--accent)'

  return (
    <div className={styles.root}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div className={styles.hero}>
        {heroUrl && (
          <div className={styles.heroBg} style={{ backgroundImage: `url(${heroUrl})` }} />
        )}
        <div className={styles.heroGradient} />

        <div className={styles.heroContent}>
          {/* ── Botón volver — posición absoluta para no afectar el layout ── */}
          <button className={styles.backBtn} onClick={onBack ?? onClose}>
            ← Volver Atras
          </button>

          {/* ── Fila principal: cover · meta · acciones ── */}
          <div className={styles.heroMain}>
            <div className={styles.heroCover}>
              {coverUrl
                ? <img src={coverUrl} alt={game.title} />
                : <div className={styles.heroCoverEmpty}><Gamepad2 size={28} /></div>
              }
            </div>

            <div className={styles.heroMeta}>
              <h1 className={styles.heroTitle}>{game.title}</h1>
              <div className={styles.heroSub}>
                {game.year && <span className={styles.heroPill}><Calendar size={11} /> {game.year}</span>}
                {(game.developer || game.developers?.[0]) && (
                  <><span className={styles.heroSep}>·</span>
                    <span className={styles.heroPill}><Building2 size={11} /> {game.developer || game.developers[0]}</span></>
                )}
                {game.genres?.length > 0 && (
                  <><span className={styles.heroSep}>·</span>
                    <span className={styles.heroPill}><Sword size={11} /> {game.genres.slice(0, 2).join(', ')}</span></>
                )}
                {game.rating && (
                  <><span className={styles.heroSep}>·</span>
                    <span className={`${styles.heroPill} ${styles.heroPillRating}`}>
                      <Star size={11} fill="#fbbf24" stroke="none" /> {Math.round(game.rating)}/100
                    </span></>
                )}
              </div>

              {/* Badges de plataformas */}
              {game.platforms?.length > 0 && (
                <div className={styles.heroPlatforms}>
                  {game.platforms.slice(0, 6).map((p, i) => {
                    const name = typeof p === 'string' ? p : p.name
                    return (
                      <div key={i} className={styles.heroPlatBadge} title={name}>
                        <PlatIcon name={name} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className={styles.heroActions}>
              {mode === 'library' && (
                <button className={styles.btnPrimary} onClick={() => onAction?.('start')}>
                  <Play size={14} fill="currentColor" /> Comenzar a jugar
                </button>
              )}
              {mode === 'in_progress' && (
                <button className={styles.btnPrimary} onClick={() => onAction?.('continue')}>
                  <Play size={14} fill="currentColor" /> Continuar jugando
                </button>
              )}
              {mode === 'hall_of_fame' && (
                <button className={styles.btnOutline} onClick={() => onAction?.('replay')}>
                  <RotateCcw size={13} /> Enviar a Biblioteca
                </button>
              )}
              <button className={styles.btnSecondary} onClick={() => onAction?.('updateStatus')}>
                <Edit2 size={13} /> Actualizar estado <span className={styles.btnChevron}>›</span>
              </button>
              <div style={{ position: 'relative' }}>
                <button className={styles.btnSquare} onClick={() => setMenuOpen(v => !v)}>
                  <MoreHorizontal size={16} />
                </button>
                {menuOpen && (
                  <div className={styles.cardMenuDropdown} onClick={e => e.stopPropagation()}>
                    {mode === 'in_progress' && (
                      <button onClick={() => { onAction?.('complete'); setMenuOpen(false) }}>
                        Marcar como completado
                      </button>
                    )}
                    <button onClick={() => { onEdit?.(game); setMenuOpen(false) }}>
                      Editar juego
                    </button>
                    <button onClick={() => { onDelete?.(game); setMenuOpen(false) }}>
                      Eliminar juego
                    </button>
                  </div>
                )}
              </div>
              <button
                className={`${styles.btnSquare} ${isFav ? styles.btnSquareFav : ''}`}
                onClick={() => setIsFav(v => !v)}
              >
                <Star size={16} fill={isFav ? '#fbbf24' : 'none'} stroke={isFav ? '#fbbf24' : 'currentColor'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TAB STRIP ════════════════════════════════════════════════════════ */}
      <div className={styles.tabStrip} style={{ '--tab-accent': accent }}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {TAB_ICONS[t]} {t}
          </button>
        ))}
      </div>

      {/* ══ BODY ═════════════════════════════════════════════════════════════ */}
      <div className={styles.body}>
        <div className={styles.mainCol}>
          <div className={styles.tabBody}>
            {activeTab === 'Resumen' && <TabResumen game={game} />}
            {activeTab === 'Logros' && <TabLogros />}
            {activeTab === 'Notas' && <TabNotas game={game} onAction={onAction} />}
            {(activeTab === 'Actividad' || activeTab === 'Capturas' || activeTab === 'Información') && (
              <div className={styles.emptyState}>
                <Medal size={28} className={styles.emptyIcon} />
                <p>Próximamente — <strong>{activeTab}</strong></p>
              </div>
            )}
          </div>
        </div>
        <aside className={styles.sideCol}>
          <RightSidebar game={game} mode={mode} />
        </aside>
      </div>
    </div>
  )
}