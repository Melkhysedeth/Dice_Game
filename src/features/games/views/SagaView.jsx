// SagaView.jsx — layout 3 columnas (sidebar izq + centro + sidebar der)
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SagaView.module.css'
import AddGameModal from '../components/AddGameModal'
import { 
  House, LibraryBigIcon, Gamepad2, Trophy, 
  Dices, CircleDotDashed, Building2, Sword, Calendar, 
  CalendarCheck, Milestone } from 'lucide-react'

function fixCover(url) {
  if (!url) return null
  return url.startsWith('//') ? `https:${url}` : url
}

function getStatusLabel(status) {
  if (status === 'completed') return { label: 'Completado', color: '#f5c518' }
  if (status === 'in_progress') return { label: 'En progreso', color: '#22c55e' }
  return { label: 'Pendiente', color: '#a78bfa' }
}

// ── Entry row ────────────────────────────────────────────────────────────────
function EntryRow({ entry, saga, index, onStartPlaying, onEditEntry, onDeleteEntry, onClick }) {
  const { label, color } = getStatusLabel(entry.status)
  const cover = fixCover(entry.cover)
  const lastSession = entry.sessions?.at(-1)

  return (
    <div
      className={`${styles.entryRow} ${entry.status === 'library' ? styles.entryRowLibrary :
          entry.status === 'in_progress' ? styles.entryRowInProgress :
            styles.entryRowCompleted
        }`}
        onClick={onClick}>
      <div className={styles.entryNumber}>{index + 1}</div>

      <div className={styles.entryCoverWrap}>
        {cover
          ? <img src={cover} alt={entry.title} className={styles.entryCoverImg} />
          : <div className={styles.entryCoverEmpty}>🎮</div>
        }
        {entry.status === 'completed' && <div className={styles.entryCompletedDot} />}
        {entry.status === 'in_progress' && <div className={styles.entryProgressRing} />}
      </div>

      <div className={styles.entryInfo}>
        <div className={styles.entryTitleRow}>
          <span className={styles.entryTitle}>{entry.title}</span>
          {entry.status === 'completed' && <span className={styles.entryCheck}>✓</span>}
        </div>
        <div className={styles.entryMeta}>
          <span className={styles.entryYear}>{entry.year}</span>
          <span className={styles.entryDot}>·</span>
          <span className={styles.entryPlatform}>{saga.platform?.slice(0, 2).join(' · ')}</span>
        </div>
      </div>

      <div className={styles.entryStatus}>
        <span className={styles.entryStatusDot} style={{ background: color }} />
        <span className={styles.entryStatusLabel} style={{ color }}>{label}</span>
      </div>

      <div className={styles.entryDates}>
        {lastSession?.endDate && (
          <><span className={styles.entryDateIcon}>📅</span><span className={styles.entryDateVal}>{lastSession.endDate}</span></>
        )}
        {entry.status === 'in_progress' && lastSession?.startDate && (
          <><span className={styles.entryDateIcon}>⏱</span><span className={styles.entryDateVal}>Desde {lastSession.startDate}</span></>
        )}
        {entry.status === 'library' && <span className={styles.entryDateEmpty}>—</span>}
      </div>

      {entry.rating && (
        <div className={styles.entryRating}>
          <span className={styles.entryStar}>★</span>
          <span className={styles.entryRatingVal}>{entry.rating}</span>
        </div>
      )}

      <div className={styles.entryArrow}>›</div>
    </div>
  )
}

// ── Modal entry ──────────────────────────────────────────────────────────────
function EntryModal({ entry, saga, onClose, onStartPlaying, onEditEntry, onDeleteEntry }) {
  const { label, color } = getStatusLabel(entry.status)
  const cover = fixCover(entry.cover)

  return (
    <div className={styles.entryModalOverlay} onClick={onClose}>
      <div className={styles.entryModalBox} onClick={e => e.stopPropagation()}>
        <button className={styles.entryModalClose} onClick={onClose}>✕</button>
        <div className={styles.entryModalTop}>
          <div className={styles.entryModalCover}>
            {cover
              ? <img src={cover} alt={entry.title} />
              : <div className={styles.entryModalCoverEmpty}>🎮</div>
            }
          </div>
          <div className={styles.entryModalInfo}>
            <span className={styles.entryModalSagaTag}>{saga.title}</span>
            <h3 className={styles.entryModalTitle}>{entry.title}</h3>
            <p className={styles.entryModalMeta}>{saga.developer} · {entry.year}</p>
            <div className={styles.entryModalStatusRow}>
              <span className={styles.entryStatusDot} style={{ background: color }} />
              <span style={{ color, fontSize: '0.82rem', fontWeight: 600 }}>{label}</span>
            </div>
            <div className={styles.entryModalGenres}>
              {saga.genre?.map(g => <span key={g} className={styles.entryModalGenre}>{g}</span>)}
            </div>
          </div>
        </div>
        <div className={styles.entryModalActions}>
          {entry.status === 'library' && (
            <button
              className={styles.entryModalPlay}
              onClick={() => {
                onStartPlaying({ ...entry, developer: saga.developer, genre: saga.genre, platform: saga.platform, sagaId: saga.id, sagaTitle: saga.title, isSagaEntry: true })
                onClose()
              }}
            >▶ Comenzar a jugar</button>
          )}
          <button className={styles.entryModalEdit}
            onClick={() => { onEditEntry(saga.id, entry); onClose() }}
          >✎ Editar</button>
          <button className={styles.entryModalDelete}
            onClick={() => { onDeleteEntry(saga.id, entry.id); onClose() }}
          >✕ Eliminar</button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
function SagaView({ saga, allSagas = [], onBack, onStartPlaying, onAddEntry, onEditEntry, onDeleteEntry, onEditSaga, onDeleteSaga, onUpdateEntryCover, onRandomGame }) {
  const navigate = useNavigate()
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [heroCoverIdx, setHeroCoverIdx] = useState(0)
  const [heroCoverFade, setHeroCoverFade] = useState(true)
  const intervalRef = useRef(null)
  const [showAddEntry, setShowAddEntry] = useState(false)

  const coversPool = saga.entries.map(e => fixCover(e.cover)).filter(Boolean)

  useEffect(() => {
    if (coversPool.length <= 1) return
    intervalRef.current = setInterval(() => {
      setHeroCoverFade(false)
      setTimeout(() => {
        setHeroCoverIdx(prev => (prev + 1) % coversPool.length)
        setHeroCoverFade(true)
      }, 300)
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [coversPool.length])

  const total = saga.entries.length
  const completed = saga.entries.filter(e => e.status === 'completed').length
  const inProgress = saga.entries.filter(e => e.status === 'in_progress').length
  const pending = saga.entries.filter(e => e.status === 'library').length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  const sortedByYear = [...saga.entries].sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
  const heroCover = coversPool[heroCoverIdx] ?? null

  return (
    <div className={styles.root}>

      {/* ══ SIDEBAR IZQUIERDO ══ */}
      <aside className={styles.sidebar}>
        <div className={styles.sideSection}>
          <span className={styles.sideSectionTitle}>NAVEGACIÓN</span>
          <nav className={styles.sideNav}>
            <button className={styles.sideNavItem} onClick={() => navigate('/')}>
              <House size={20} />Inicio
            </button>
            <button className={`${styles.sideNavItem} ${styles.sideNavActive}`} onClick={onBack}>
              <LibraryBigIcon size={20} /> Biblioteca
            </button>
            <button className={styles.sideNavItem} onClick={() => navigate('/en-progreso')}>
              <Gamepad2 size={20} /> En progreso
            </button>
            <button className={styles.sideNavItem} onClick={() => navigate('/salon')}>
              <Trophy size={20} /> Salón de la fama
            </button>
            <button className={styles.sideNavItem} onClick={onRandomGame}>
              <Dices size={20} /> Juegos al azar
            </button>
          </nav>
        </div>

        {/* Lista de sagas */}
        {allSagas.length > 0 && (
          <div className={styles.sideSection}>
            <span className={styles.sideSectionTitle}>SAGAS</span>
            <nav className={styles.sideNav}>
              {allSagas.slice(0, 6).map(s => (
                <button
                  key={s.id}
                  className={`${styles.sagaNavItem} ${s.id === saga.id ? styles.sagaNavItemActive : ''}`}
                >
                  <span>◈</span>
                  {s.title}
                  <span className={styles.sagaNavBadge}>{s.entries.length}</span>
                </button>
              ))}
              {allSagas.length > 6 && (
                <button className={styles.sideNavItem} onClick={onBack}>
                  <span>+</span> Ver todas
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Dado */}
        <div className={styles.sideRandom}>
          <h4 className={styles.sideRandomTitle}>¿No sabes qué jugar?</h4>
          <p className={styles.sideRandomSub}>Deja que el azar elija tu próxima aventura.</p>
          <div className={styles.sideDice}>🎲</div>
          <button className={styles.sideRandomBtn} onClick={onRandomGame}>
            <span>🎲</span> JUEGO AL AZAR
          </button>
        </div>
      </aside>

      {/* ══ COLUMNA CENTRAL ══ */}
      <div className={styles.centerCol}>

        {/* HERO */}
        <div className={styles.hero}>
          {heroCover && (
            <div
              className={`${styles.heroBg} ${heroCoverFade ? styles.heroBgVisible : ''}`}
              style={{ backgroundImage: `url(${heroCover})` }}
            />
          )}
          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            <button className={styles.backBtn} onClick={onBack}>
              ← Volver a Biblioteca
            </button>
            <span className={styles.heroLabel}>SAGA</span>
            <h1 className={styles.heroTitle}>{saga.title}</h1>
            <p className={styles.heroDesc}>
              {saga.description || `Explora la saga completa de ${saga.title} — ${total} ${total === 1 ? 'juego' : 'juegos'} en total.`}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className={styles.body}>
          <div className={styles.mainCol}>

            {/* Progreso */}
            <div className={styles.progressCard}>
              <div className={styles.progressCardHeader}>
                <span className={styles.progressCardTitle}>PROGRESO DE LA SAGA</span>
                <span className={styles.progressCardPct}>{progress}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.progressStats}>
                <div className={styles.progressStat}>
                  <span className={styles.progressStatIcon} ><Trophy size={25} color="var(--state-fame)" /></span>
                  <span className={styles.progressStatNum}>{completed}</span>
                  <span className={styles.progressStatLabel}>Completados</span>
                </div>
                <div className={styles.progressStat}>
                  <span className={styles.progressStatIcon}><Gamepad2 size={25} color="var(--accent-2)" /></span>
                  <span className={styles.progressStatNum}>{inProgress}</span>
                  <span className={styles.progressStatLabel}>En progreso</span>
                </div>
                <div className={styles.progressStat}>
                  <span className={styles.progressStatIcon} ><CircleDotDashed size={25} color="var(--accent)" /></span>
                  <span className={styles.progressStatNum}>{pending}</span>
                  <span className={styles.progressStatLabel}>Pendientes</span>
                </div>
              </div>
            </div>

            {/* Lista de juegos */}
            <div className={styles.entriesSection}>
              <div className={styles.entriesSectionHeader}>
                <span className={styles.entriesSectionTitle}>JUEGOS DE LA SAGA</span>
                <button className={styles.addEntryBtn} onClick={() => setShowAddEntry(true)}>
                  + Agregar título
                </button>
              </div>

              <div className={styles.entriesList}>
                {saga.entries.map((entry, i) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    saga={saga}
                    index={i}
                    onStartPlaying={onStartPlaying}
                    onEditEntry={onEditEntry}
                    onDeleteEntry={onDeleteEntry}
                    onClick={() => setSelectedEntry(entry)}
                  />
                ))}
              </div>
              {saga.entries.length === 0 && (
                <div className={styles.emptyEntries}>
                  <span>📚</span>
                  <p>No hay juegos en esta saga aún</p>
                  <button className={styles.addEntryBtn} onClick={onAddEntry}>
                    + Agregar el primer título
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ══ SIDEBAR DERECHO ══ */}
      <aside className={styles.sidebarRight}>

        {/* Info de la saga */}
        <div className={styles.sideCard}>
          <h4 className={styles.sideCardTitle}>INFORMACIÓN DE LA SAGA</h4>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}><Building2 size={20} /></span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Desarrollador</span>
              <span className={styles.infoVal}>{saga.developer || '—'}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}><Sword size={20} /></span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Género</span>
              <span className={styles.infoVal}>{saga.genre?.join(', ') || '—'}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}><Calendar size={20} /></span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Primera aparición</span>
              <span className={styles.infoVal}>{sortedByYear[0]?.year ?? '—'}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}><CalendarCheck size={20} /></span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Último lanzamiento</span>
              <span className={styles.infoVal}>{sortedByYear.at(-1)?.year ?? '—'}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}><Milestone size={20} /></span>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Juegos en la saga</span>
              <span className={styles.infoVal}>{total}</span>
            </div>
          </div>
        </div>

        {/* Orden recomendado */}
        <div className={styles.sideCard}>
          <h4 className={styles.sideCardTitle}>ORDEN RECOMENDADO</h4>
          <div className={styles.orderList}>
            {sortedByYear.map((entry, i) => {
              const icon = entry.status === 'completed' ? '✓' : entry.status === 'in_progress' ? '▶' : '○'
              const iconColor = entry.status === 'completed' ? '#f5c518' : entry.status === 'in_progress' ? '#22c55e' : 'rgba(255,255,255,0.2)'
              return (
                <div key={entry.id} className={styles.orderItem} onClick={() => setSelectedEntry(entry)}>
                  <span className={styles.orderNum}>{i + 1}</span>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderTitle}>{entry.title}</span>
                    <span className={styles.orderYear}>({entry.year})</span>
                  </div>
                  <span className={styles.orderIcon} style={{ color: iconColor }}>{icon}</span>
                </div>
              )
            })}
          </div>
          <p className={styles.orderNote}>
            ℹ Este es el orden recomendado para seguir la historia de {saga.title}.
          </p>
        </div>

        {/* Logros */}
        <div className={styles.sideCard}>
          <h4 className={styles.sideCardTitle}>LOGROS DE LA SAGA</h4>
          <div className={styles.sagaAchievement}>
            <div className={styles.sagaAchievementTop}>
              <span className={styles.sagaAchievementLabel}>Completa todos los juegos de la saga</span>
              <span className={styles.sagaAchievementCount}>{completed} / {total}</span>
            </div>
            <div className={styles.sagaAchievementTrack}>
              <div className={styles.sagaAchievementFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className={styles.sagaAchievementReward}>
            <span className={styles.sagaAchievementRewardLabel}>Recompensa:</span>
            <span className={styles.sagaAchievementRewardVal}>🏆 Maestro de {saga.title}</span>
          </div>
        </div>

        {/* Gestionar */}
        <div className={styles.sideCard}>
          <h4 className={styles.sideCardTitle}>GESTIONAR SAGA</h4>
          <div className={styles.sagaActions}>
            <button className={styles.sagaActionBtn} onClick={() => onEditSaga(saga)}>
              ✎ Editar saga
            </button>
            <button
              className={styles.sagaActionBtnDanger}
              onClick={() => {
                if (window.confirm(`¿Eliminar toda la saga "${saga.title}" y sus entregas?`))
                  onDeleteSaga(saga.id)
              }}
            >✕ Eliminar saga</button>
          </div>
        </div>

      </aside>

      {/* Modal entry */}
      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          saga={saga}
          onClose={() => setSelectedEntry(null)}
          onStartPlaying={onStartPlaying}
          onEditEntry={(sagaId, entry) => { onEditEntry(sagaId, entry); setSelectedEntry(null) }}
          onDeleteEntry={(sagaId, entryId) => { onDeleteEntry(sagaId, entryId); setSelectedEntry(null) }}
        />
      )}

      {showAddEntry && (
        <AddGameModal
          onClose={() => setShowAddEntry(false)}
          onAddSingle={() => { }}
          onAddToSaga={(sagaId, entryData) => {
            onAddEntry(sagaId, entryData)
            setShowAddEntry(false)
          }}
          onAddNewSaga={() => { }}
          onAddEmptySaga={() => { }}
          existingSagas={[saga]}
          defaultSagaId={saga.id}
        />
      )}
    </div>
  )
}

export default SagaView
