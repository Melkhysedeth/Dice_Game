import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import styles from './OpenWorldProgressView.module.css'
import EmotionalProgress from '../components/EmotionalProgress'

const SESSION_TAGS = [
  { id: 'boss', label: '⚔️ Jefe derrotado' },
  { id: 'levelup', label: '🆙 Subí de nivel' },
  { id: 'newzone', label: '🗺️ Zona nueva' },
  { id: 'died', label: '💔 Morí mucho' },
  { id: 'epic', label: '🎵 Momento épico' },
  { id: 'trophy', label: '🏆 Logro desbloqueado' },
  { id: 'goal', label: '🎯 Objetivo cumplido' },
  { id: 'discover', label: '💡 Descubrí algo' },
]

const FEELINGS = [
  { id: 'hooked', label: '🔥 Enganchado' },
  { id: 'stressed', label: '😤 Agobiado' },
  { id: 'relaxed', label: '😌 Relajado' },
  { id: 'excited', label: '😱 Emocionado' },
  { id: 'bored', label: '😴 Aburrido' },
  { id: 'sad', label: '😢 Triste' },
]

const QUICK_HOURS = [0.5, 1, 2, '3+']

function getCover(game) {
  const url = game?.cover
  if (!url) return null
  return url.startsWith('//') ? `https:${url}` : url
}

{/* Muro de actividad tipo GitHub Contribution */ }
function ActivityWall({ sessionHistory }) {
  const today = new Date()
  const month = today.getMonth() // 0-11

  // Semestre actual
  const isFirstHalf = month < 6
  const startMonth = isFirstHalf ? 0 : 6  // Ene o Jul
  const endMonth = isFirstHalf ? 5 : 11   // Jun o Dic
  const year = today.getFullYear()

  const start = new Date(year, startMonth, 1)
  const end = new Date(year, endMonth + 1, 0) // último día del mes final

  const days = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const session = sessionHistory.find(s => s.start_date === dateStr)
    const isFuture = d > today
    days.push({ date: dateStr, hours: session?.duration_hours ?? 0, isFuture })
  }

  function intensity(h) {
    if (h === 0) return 0
    if (h < 1) return 1
    if (h < 2) return 2
    if (h < 4) return 3
    return 4
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const monthLabels = weeks.map(week => MONTHS[new Date(week[0].date).getMonth()])
  const shownMonths = monthLabels.map((m, i) => (i === 0 || m !== monthLabels[i - 1] ? m : ''))

  return (
    <div className={styles.activityWall}>
      {/* Etiquetas de mes */}
      <div className={styles.activityMonths}>
        {shownMonths.map((m, i) => (
          <div key={i} className={styles.activityMonthLabel}>{m.toUpperCase()}</div>
        ))}
      </div>

      {/* Filas de días de la semana + grid */}
      <div className={styles.activityBody}>
        <div className={styles.activityDayNames}>
          {['Lun', '', 'Mié', '', 'Vie'].map((d, i) => (
            <div key={i} className={styles.activityDayName}>{d}</div>
          ))}
        </div>
        <div className={styles.activityGrid}>
          {weeks.map((week, wi) => (
            <div key={wi} className={styles.activityWeek}>
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`${styles.activityDay} ${day.isFuture ? styles.intensityFuture : styles[`intensity${intensity(day.hours)}`]}`}
                  title={day.isFuture ? '' : `${day.date}${day.hours ? ` — ${day.hours}h` : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className={styles.activityLegend}>
        <span className={styles.legendText}>Menos</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className={`${styles.activityDay} ${styles[`intensity${i}`]}`} />
        ))}
        <span className={styles.legendText}>Más</span>
      </div>
    </div>
  )
}

const MODE_CONFIG = {
  infinite: { badge: '🌍 Mundo infinito', saveLabel: 'Guardar sesión', placeholder: '¿Qué pasó hoy en el mundo?', sectionTitle: 'Logros de Identidad' },
  competitive: { badge: '🏆 Competitivo', saveLabel: 'Guardar partida', placeholder: '¿Qué pasó en la arena hoy?', sectionTitle: 'Logros Competitivos' },
}

export default function OpenWorldProgressView({ game, onComplete, achievements }) {
  const navigate = useNavigate()
  const currentUserRef = useRef(null)
  const config = MODE_CONFIG[game.progress_mode] ?? MODE_CONFIG.infinite

  const [progress, setProgress] = useState(null)
  const [sessionHistory, setSessionHistory] = useState([])
  const [xpData, setXpData] = useState({ total_xp: 0, level: 1 })
  const [currentUser, setCurrentUser] = useState(null)
  const [hoursToday, setHoursToday] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [customTag, setCustomTag] = useState('')
  const [customTags, setCustomTags] = useState([])
  const [currentFeeling, setCurrentFeeling] = useState(null)
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [newlyUnlocked, setNewlyUnlocked] = useState([])
  const [showAbandonModal, setShowAbandonModal] = useState(false)
  const [abandonReason, setAbandonReason] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return
      setCurrentUser(data.user)
      currentUserRef.current = data.user
      const { data: profile } = await supabase
        .from('profiles').select('total_xp, level').eq('id', data.user.id).single()
      if (profile) setXpData(profile)
    })
  }, [])

  useEffect(() => {
    if (!game?._entryUuid) return
    supabase.from('library_entries').select('*').eq('id', game._entryUuid).single()
      .then(({ data }) => { if (data) { setProgress(data); setCurrentFeeling(data.current_feeling ?? null) } })
    supabase.from('play_sessions')
      .select('start_date, duration_hours, feeling, global_tags, custom_tags')
      .eq('library_entry_id', game._entryUuid)
      .order('start_date', { ascending: false })
      .then(({ data }) => setSessionHistory(data ?? []))
    supabase.from('game_notes').select('*').eq('library_entry_id', game._entryUuid)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data ?? []))
    supabase.from('progress_achievements').select('achievement_id, unlocked_at')
      .eq('library_entry_id', game._entryUuid)
      .then(({ data }) => setUnlockedAchievements(data ?? []))
  }, [game?._entryUuid])

  const totalHours = progress?.total_hours ?? 0
  const streak = progress?.current_streak ?? 0
  const lastSession = progress?.last_session_date
  const totalSessions = sessionHistory.length
  const monthsActive = progress?.created_at
    ? Math.max(1, Math.floor((new Date() - new Date(progress.created_at)) / (1000 * 60 * 60 * 24 * 30)))
    : 0

  const sessionsThisWeek = sessionHistory.filter(s => {
    const d = new Date(s.start_date)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    return d >= weekAgo
  }).length

  const avgHoursPerSession = totalSessions > 0
    ? (totalHours / totalSessions).toFixed(1)
    : 0

  const lastSessionLabel = (() => {
    if (!lastSession) return '—'
    const diff = Math.floor((new Date() - new Date(lastSession)) / 86400000)
    if (diff === 0) return 'Hoy'
    if (diff === 1) return 'Ayer'
    return `Hace ${diff} días`
  })()

  const xpThisWeek = sessionsThisWeek * 10 + (notes.length * 5)
  const xpPct = ((xpData.total_xp % 500) / 500 * 100).toFixed(1)

  async function addXP(amount) {
    const uid = currentUserRef.current?.id
    if (!uid) return
    const { data } = await supabase.from('profiles').select('total_xp, level').eq('id', uid).single()
    if (!data) return
    const newXp = (data.total_xp ?? 0) + amount
    const newLevel = Math.floor(newXp / 500) + 1
    await supabase.from('profiles').update({ total_xp: newXp, level: newLevel }).eq('id', uid)
    setXpData({ total_xp: newXp, level: newLevel })
  }

  async function handleSaveSession() {
    const hours = parseFloat(hoursToday)
    if (!hours || hours <= 0) return
    if (hours > 24) { setSavedMsg({ type: 'error', text: 'Ni los inmortales juegan 24h seguidas.' }); return }
    if (hours > 8) {
      const ok = window.confirm(`¿Eres un androide? Confirma que realmente jugaste ${hours}h hoy.`)
      if (!ok) return
    }
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    const newTotal = parseFloat((totalHours + hours).toFixed(2))
    const newStreak = lastSession === today ? streak : streak + 1

    await supabase.from('play_sessions').insert({
      library_entry_id: game._entryUuid,
      duration_hours: hours,
      start_date: today,
      global_tags: selectedTags.length ? selectedTags : null,
      custom_tags: customTags.length ? customTags : null,
      feeling: currentFeeling ?? null,
      user_id: currentUserRef.current?.id,
    })
    await supabase.from('library_entries').update({
      total_hours: newTotal,
      current_streak: newStreak,
      last_session_date: today,
      current_feeling: currentFeeling,
    }).eq('id', game._entryUuid)

    const alreadyIds = unlockedAchievements.map(a => a.achievement_id)
    const toUnlock = achievements.filter(a =>
      !alreadyIds.includes(a.id) && a.condition(newTotal, newStreak, monthsActive)
    )
    if (toUnlock.length) {
      const rows = toUnlock.map(a => ({
        library_entry_id: game._entryUuid,
        user_id: currentUserRef.current?.id,
        achievement_id: a.id,
        pct_at_unlock: null,
      }))
      const { data: newAch } = await supabase.from('progress_achievements').insert(rows).select()
      if (newAch) {
        setUnlockedAchievements(prev => [...prev, ...newAch])
        setNewlyUnlocked(toUnlock)
        setTimeout(() => setNewlyUnlocked([]), 5000)
        for (const a of toUnlock) await addXP(a.xp)
      }
    }

    await addXP(10)
    setProgress(prev => ({ ...prev, total_hours: newTotal, current_streak: newStreak, last_session_date: today }))
    setSessionHistory(prev => [{ start_date: today, duration_hours: hours, feeling: currentFeeling, global_tags: selectedTags, custom_tags: customTags }, ...prev])
    setHoursToday('')
    setSelectedTags([])
    setCustomTags([])
    setSaving(false)
    setSavedMsg({ type: 'success', text: `+${hours}h registradas. ¡El mundo te espera!` })
    setTimeout(() => setSavedMsg(null), 3000)
  }

  const coverUrl = getCover(game)
  const heroUrl = useMemo(() => {
    const screenshots = game.screenshots ?? []
    if (screenshots.length === 0) return coverUrl
    const random = screenshots[Math.floor(Math.random() * screenshots.length)]
    return (random.startsWith('//') ? `https:${random}` : random)
      .replace(/t_[a-z_]+/, 't_1080p')
  }, [game.screenshots])

  return (
    <div className={styles.root}>

      {/* ── Toast logros ── */}
      {newlyUnlocked.length > 0 && (
        <div className={styles.toastWrap}>
          {newlyUnlocked.map(a => (
            <div key={a.id} className={styles.toast}>
              <span className={styles.toastIcon}>🏅</span>
              <div>
                <div className={styles.toastTitle}>¡Logro desbloqueado! {a.name}</div>
                <div className={styles.toastMsg}>{a.msg}</div>
                <div className={styles.toastXp}>+{a.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BODY — columna principal + sidebar */}
      <div className={styles.body}>

        {/* ── COLUMNA PRINCIPAL ── */}
        <div className={styles.mainCol}>

          {/* HERO HEADER */}
          <div className={styles.hero}>
            {/* Fondo difuminado con screenshot */}
            {heroUrl && <div className={styles.heroBg} style={{ backgroundImage: `url(${heroUrl})` }} />}
            <div className={styles.heroOverlay} />

            <div className={styles.heroInner}>
              {/* Botón volver */}
              <button className={styles.backBtn} onClick={() => navigate('/en-progreso')}>
                ← Volver a En progreso
              </button>

              <div className={styles.heroContent}>

                {/* IZQUIERDA — portada del juego */}
                <div className={styles.heroCover}>
                  {coverUrl
                    ? <img src={coverUrl} alt={game.title} className={styles.heroCoverImg} />
                    : <div className={styles.heroCoverEmpty}>🎮</div>
                  }
                </div>

                {/* CENTRO — meta del juego */}
                <div className={styles.heroMeta}>
                  <div className={styles.modeBadge}>🏆 {config.badge}</div>
                  <h1 className={styles.heroTitle}>{game.title}</h1>
                  <div className={styles.heroSub}>
                    <span className={styles.heroSubHighlight}>{totalHours}h jugando</span>
                    <span className={styles.heroDot}>·</span>
                    <span className={styles.heroSubHighlight}>{sessionsThisWeek} sesiones esta semana</span>
                    <span className={styles.heroDot}>·</span>
                    <span>{streak} día de racha</span>
                  </div>
                  <p className={styles.heroQuote}>
                    "Cada partida te convierte en una mejor versión de ti.<br />
                    La arena siempre recuerda a los que vuelven."
                  </p>
                  <div className={styles.heroActions}>
                    <button className={styles.pauseBtn} onClick={async () => {
                      await supabase.from('library_entries').update({ status: 'paused' }).eq('id', game._entryUuid)
                      navigate('/en-progreso')
                    }}>⏸ Poner en pausa</button>
                    <button className={styles.abandonBtn} onClick={() => setShowAbandonModal(true)}>
                      🚨 Abandonar
                    </button>
                  </div>
                </div>

                {/* DERECHA — métricas rápidas + XP */}
                <div className={styles.heroRight}>
                  {/* Métricas top */}
                  <div className={styles.heroMetrics}>
                    <div className={styles.heroMetric}>
                      <div className={styles.heroMetricLabel}>Tiempo total</div>
                      <div className={styles.heroMetricVal}>{totalHours}h</div>
                    </div>
                    <div className={styles.heroMetricDivider} />
                    <div className={styles.heroMetric}>
                      <div className={styles.heroMetricLabel}>Sesiones</div>
                      <div className={styles.heroMetricVal}>{totalSessions}</div>
                    </div>
                    <div className={styles.heroMetricDivider} />
                    <div className={styles.heroMetric}>
                      <div className={styles.heroMetricLabel}>Racha actual</div>
                      <div className={`${styles.heroMetricVal} ${styles.heroMetricAccent}`}>{streak} días</div>
                    </div>
                  </div>

                  {/* Nivel actual — tarjeta especial */}
                            <div className={styles.levelCard}>
                              <div className={styles.levelBadge}>{xpData.level}</div>
                              <div className={styles.levelInfo}>
                                <div className={styles.levelXp}>⭐ {xpData.total_xp} XP</div>
                                <div className={styles.levelXpBar}>
                                  <div className={styles.levelXpFill} style={{ width: `${xpPct}%` }} />
                                </div>
                                <div className={styles.levelXpNext}>{500 - (xpData.total_xp % 500)} XP para nivel {xpData.level + 1}</div>
                              </div>
                            </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── Fila top: Actividad + Resumen narrativo ── */}
          <div className={styles.topRow}>

            {/* ACTIVIDAD RECIENTE */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>ACTIVIDAD RECIENTE</span>
              </div>
              <ActivityWall sessionHistory={sessionHistory} />
            </div>

            {/* RESUMEN NARRATIVO */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>RESUMEN NARRATIVO</span>
              </div>
              <div className={styles.narrativeGrid}>
                <div className={styles.narrativeCard}>
                  <div className={styles.narrativeIcon}>⚡</div>
                  <div className={styles.narrativeCardLabel}>Actividad viva</div>
                  <div className={styles.narrativeVal}>{sessionsThisWeek} sesiones</div>
                  <div className={styles.narrativeSub}>esta semana</div>
                  <div className={styles.narrativeMicro}>Racha: {streak} día</div>
                </div>
                <div className={styles.narrativeCard}>
                  <div className={styles.narrativeIcon}>🌐</div>
                  <div className={styles.narrativeCardLabel}>Mundo activo</div>
                  <div className={styles.narrativeVal}>{monthsActive} mes{monthsActive !== 1 ? 'es' : ''}</div>
                  <div className={styles.narrativeSub}>activo</div>
                  <div className={styles.narrativeMicro}>Desde {progress?.created_at ? new Date(progress.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</div>
                </div>
                <div className={styles.narrativeCard}>
                  <div className={`${styles.narrativeIcon} ${styles.narrativeIconFire}`}>🔥</div>
                  <div className={`${styles.narrativeCardLabel} ${styles.narrativeLabelFire}`}>Horas registradas</div>
                  <div className={styles.narrativeVal}>{totalHours}h</div>
                  <div className={styles.narrativeSub}>tiempo total</div>
                  <div className={styles.narrativeMicro}>Prom. {avgHoursPerSession}h / sesión</div>
                </div>
                <div className={styles.narrativeCard}>
                  <div className={`${styles.narrativeIcon} ${styles.narrativeIconHeart}`}>❤️</div>
                  <div className={`${styles.narrativeCardLabel} ${styles.narrativeLabelHeart}`}>Estado actual</div>
                  <div className={`${styles.narrativeValLg} ${styles.narrativeValAccent}`}>
                    {currentFeeling ? FEELINGS.find(f => f.id === currentFeeling)?.label.split(' ').slice(1).join(' ') : 'Sin registrar'}
                  </div>
                  <div className={styles.narrativeMicro}>Última sesión</div>
                  <div className={styles.narrativeMicro}>{lastSessionLabel}</div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Fila media: Tendencia emocional + Logros ── */}
          <div className={styles.midRow}>

            {/* TENDENCIA EMOCIONAL */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>TENDENCIA EMOCIONAL</span>
              </div>
              <EmotionalProgress sessionHistory={sessionHistory} currentFeeling={currentFeeling} />
            </div>

            {/* LOGROS */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>{config.sectionTitle.toUpperCase()}</span>
              </div>
              <div className={styles.achievementsRow}>
                {achievements.map(a => {
                  const unlocked = unlockedAchievements.find(u => u.achievement_id === a.id)
                  return (
                    <div key={a.id} className={`${styles.achCard} ${unlocked ? styles.achUnlocked : styles.achLocked}`}>
                      <div className={styles.achIconWrap}>
                        <div className={styles.achIconBg}>
                          {unlocked ? '🏅' : '🔒'}
                        </div>
                        {!unlocked && <div className={styles.achLockOverlay}>🔒</div>}
                      </div>
                      <div className={styles.achName}>{a.name}</div>
                      <div className={styles.achMsg}>{unlocked ? a.msg : '???'}</div>
                      {unlocked && (
                        <div className={styles.achDate}>
                          {new Date(unlocked.unlocked_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* ── HISTORIAL DE SESIONES RECIENTES ── */}
          {sessionHistory.length > 0 && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <span className={styles.panelTitle}>HISTORIAL DE SESIONES RECIENTES</span>
              </div>
              <div className={styles.sessionCards}>
                {sessionHistory.slice(0, 3).map((s, i) => (
                  <div key={i} className={styles.sessionCard}>
                    {/* Miniatura de fondo */}
                    {heroUrl && (
                      <div className={styles.sessionCardBg} style={{ backgroundImage: `url(${heroUrl})` }} />
                    )}
                    <div className={styles.sessionCardOverlay} />
                    <div className={styles.sessionCardInner}>
                      <div className={styles.sessionCardDate}>
                        🕐 {new Date(s.start_date).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </div>
                      <div className={styles.sessionCardHours}>{s.duration_hours}h</div>
                      {s.feeling && (
                        <div className={styles.sessionCardFeeling}>
                          {FEELINGS.find(f => f.id === s.feeling)?.label ?? s.feeling}
                        </div>
                      )}
                      <div className={styles.sessionCardTags}>
                        {s.global_tags?.slice(0, 3).map(t => (
                          <span key={t} className={styles.sessionCardTag}>
                            {SESSION_TAGS.find(st => st.id === t)?.label ?? t}
                          </span>
                        ))}
                      </div>
                      <div className={styles.sessionCardXp}>+{Math.round(s.duration_hours * 10 + 10)} XP</div>
                    </div>
                  </div>
                ))}
              </div>
              {sessionHistory.length > 3 && (
                <button className={styles.verTodasBtn}>
                  Ver todas las sesiones →
                </button>
              )}
            </div>
          )}

          {/* ── TU LEGADO — barra inferior ── */}
          <div className={styles.legacyBar}>
            <div className={styles.legacyTitle}>TU LEGADO SE CONSTRUYE PARTIDA A PARTIDA</div>
            <div className={styles.legacyStats}>
              <div className={styles.legacyStat}>
                <div className={styles.legacyVal}>{totalHours}h</div>
                <div className={styles.legacyLabel}>Horas totales</div>
              </div>
              <div className={styles.legacyDivider} />
              <div className={styles.legacyStat}>
                <div className={styles.legacyVal}>{totalSessions}</div>
                <div className={styles.legacyLabel}>Sesiones</div>
              </div>
              <div className={styles.legacyDivider} />
              <div className={styles.legacyStat}>
                <div className={styles.legacyVal}>{streak} día</div>
                <div className={styles.legacyLabel}>Racha actual</div>
              </div>
              <div className={styles.legacyDivider} />
              <div className={styles.legacyStat}>
                <div className={styles.legacyVal}>{streak} días</div>
                <div className={styles.legacyLabel}>Mejor racha</div>
              </div>
              <div className={styles.legacyDivider} />
              <div className={styles.legacyStat}>
                <div className={styles.legacyVal}>{monthsActive} mes{monthsActive !== 1 ? 'es' : ''}</div>
                <div className={styles.legacyLabel}>Activo</div>
              </div>
              <div className={styles.legacyDivider} />
              <div className={styles.legacyStat}>
                <div className={`${styles.legacyVal} ${styles.legacyValGold}`}>
                  ⭐ +{xpThisWeek} XP
                </div>
                <div className={styles.legacyLabel}>Esta semana</div>
              </div>
            </div>
          </div>

          {/* ── Bitácora ── */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>BITÁCORA</span>
            </div>
            <div className={styles.noteInputWrap}>
              <textarea
                className={styles.noteInput}
                placeholder={config.placeholder}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={3}
              />
              <div className={styles.noteInputFooter}>
                <span className={styles.xpHint}>📜 +5 XP por nota</span>
                <button className={styles.noteBtn} onClick={async () => {
                  const content = noteText.trim()
                  if (!content) return
                  const { data, error } = await supabase.from('game_notes').insert({
                    library_entry_id: game._entryUuid,
                    user_id: currentUserRef.current?.id,
                    content,
                  }).select().single()
                  if (!error && data) { setNotes(prev => [data, ...prev]); setNoteText(''); await addXP(5) }
                }} disabled={!noteText.trim()}>
                  Añadir ↗
                </button>
              </div>
            </div>
            <div className={styles.notesList}>
              {notes.length === 0 && <div className={styles.notesEmpty}>Tu bitácora está vacía.</div>}
              {notes.map(n => (
                <div key={n.id} className={styles.noteItem}>
                  <div className={styles.noteContent}>{n.content}</div>
                  <div className={styles.noteMeta}>
                    <span>{new Date(n.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</span>
                    <button className={styles.noteDelete} onClick={async () => {
                      await supabase.from('game_notes').delete().eq('id', n.id)
                      setNotes(prev => prev.filter(x => x.id !== n.id))
                    }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>


          {/* Input horas */}
          <div className={styles.sideCard}>
            {/* Título sidebar */}
            <div className={styles.sidebarHeaderRow}>
              <h4><span className={styles.sidebarHeaderTitle}>NUEVA SESIÓN</span></h4>
              <button className={styles.sidebarResetBtn} title="Limpiar formulario" onClick={() => {
                setHoursToday(''); setSelectedTags([]); setCustomTags([]); setCurrentFeeling(null); setNoteText('')
              }}>↺</button>
            </div>
            <div className={styles.sidePanelLabel}>¿Cuánto jugaste hoy?</div>
            <div className={styles.hoursRow}>
              <input
                type="number" min="0" max="24" step="0.5"
                placeholder="2.5"
                value={hoursToday}
                onChange={e => setHoursToday(e.target.value)}
                className={styles.hoursInput}
              />
              <span className={styles.hoursUnit}>horas</span>
            </div>
            <div className={styles.quickHours}>
              {QUICK_HOURS.map(h => (
                <button
                  key={h}
                  className={`${styles.quickHourBtn} ${hoursToday == h ? styles.quickHourActive : ''}`}
                  onClick={() => setHoursToday(h === '3+' ? '3' : String(h))}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Sentimientos */}
            <div className={styles.sidePanelLabel}>¿Cómo te sentiste?</div>
            <div className={styles.feelingsGrid}>
              {FEELINGS.map(f => (
                <button
                  key={f.id}
                  className={`${styles.feelingBtn} ${currentFeeling === f.id ? styles.feelingBtnActive : ''}`}
                  onClick={() => setCurrentFeeling(f.id)}
                >
                  {f.label.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Tags de sesión */}
            <div className={styles.sidePanelLabel}>¿Qué pasó en tu sesión?</div>
            <div className={styles.tagsGrid}>
              {SESSION_TAGS.map(t => (
                <button
                  key={t.id}
                  className={`${styles.tagBtn} ${selectedTags.includes(t.id) ? styles.tagBtnActive : ''}`}
                  onClick={() => setSelectedTags(prev =>
                    prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id]
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className={styles.customTagRow}>
              <input
                className={styles.customTagInput}
                placeholder="+ Agregar tag personalizado"
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customTag.trim()) {
                    setCustomTags(prev => [...prev, customTag.trim()])
                    setCustomTag('')
                  }
                }}
              />
            </div>
            {customTags.length > 0 && (
              <div className={styles.customTagsList}>
                {customTags.map((t, i) => (
                  <span key={i} className={styles.customTagChip}>
                    {t}
                    <button onClick={() => setCustomTags(prev => prev.filter((_, j) => j !== i))}>✕</button>
                  </span>
                ))}
              </div>
            )}

            {/* Notas rápidas */}
            <div className={styles.sidePanelLabel}>Notas rápidas <span className={styles.optional}>(opcional)</span></div>
            <textarea
              className={styles.sideNoteInput}
              placeholder="¿Qué pasó hoy en la arena?"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              rows={3}
            />

            {/* Mensaje guardado */}
            {savedMsg && (
              <div className={`${styles.savedMsg} ${styles[savedMsg.type]}`}>{savedMsg.text}</div>
            )}

            {/* Botón guardar */}
            <button className={styles.saveBtn} onClick={handleSaveSession} disabled={saving || !hoursToday}>
              {saving ? 'Guardando...' : `${config.saveLabel} ☑`}
            </button>
            <div className={styles.xpHintSave}>⭐ +10 XP por registrar sesión</div>
          </div>

          {/* Consejo del viajero */}
          <div className={styles.tipCard}>
            <div className={styles.tipHeader}>
              <span className={styles.tipLabel}>CONSEJO DEL VIAJERO</span>
              <span className={styles.tipIcon}>🧭</span>
            </div>
            <p className={styles.tipText}>
              La constancia es más poderosa que el talento.
            </p>
          </div>
        </aside>
      </div>

      {/* ── Modal abandono ── */}
      {showAbandonModal && (
        <div className={styles.abandonBackdrop} onClick={() => setShowAbandonModal(false)}>
          <div className={styles.abandonModal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.abandonTitle}>¿Abandonas este mundo?</h3>
            <p className={styles.abandonSub}>No hay juicio aquí. ¿Qué pasó?</p>
            <div className={styles.abandonReasons}>
              {['Salió otro juego', 'Se puso muy difícil', 'Me aburrí', 'Por ahora no, pero volveré'].map(r => (
                <button
                  key={r}
                  className={`${styles.abandonReasonBtn} ${abandonReason === r ? styles.abandonReasonActive : ''}`}
                  onClick={() => setAbandonReason(r)}
                >{r}</button>
              ))}
            </div>
            <div className={styles.abandonActions}>
              <button className={styles.abandonCancel} onClick={() => setShowAbandonModal(false)}>Cancelar</button>
              <button className={styles.abandonConfirm} disabled={!abandonReason} onClick={async () => {
                const status = abandonReason === 'Por ahora no, pero volveré' ? 'paused' : 'abandoned'
                await supabase.from('library_entries').update({ status, abandon_reason: abandonReason }).eq('id', game._entryUuid)
                navigate('/en-progreso')
              }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}