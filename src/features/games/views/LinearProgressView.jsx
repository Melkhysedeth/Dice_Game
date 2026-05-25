import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import styles from './LinearProgressView.module.css'
import EmotionalProgress, { FEELINGS, FEELING_COLORS } from '../components/EmotionalProgress'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {
  Sunrise, Compass, Swords, Castle, Moon, Crown,
  Footprints, Shield, Sword, Flame, Skull, Star, Lock,
  TrendingUp, Map, Heart, BookOpen, Zap, Trophy,
  Angry, Users, RefreshCw, Target, Lightbulb,
  Timer, Calendar, ChevronDown
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCover(game) {
  const url = game?.cover
  if (!url) return null
  return url.startsWith('//') ? `https:${url}` : url
}

function getDaysSince(dateStr) {
  if (!dateStr) return null
  const diff = Math.floor((new Date() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return `Hace ${diff} días`
}

// ── Constantes ────────────────────────────────────────────────────────────────
const JOURNEY_STAGES = [
  { id: 0, icon: Sunrise, name: 'Inicio del viaje', range: '0–10%', min: 0, max: 10 },
  { id: 1, icon: Compass, name: 'Aventurero', range: '11–30%', min: 11, max: 30 },
  { id: 2, icon: Swords, name: 'Guerrero', range: '31–50%', min: 31, max: 50 },
  { id: 3, icon: Castle, name: 'Leyenda', range: '51–70%', min: 51, max: 70 },
  { id: 4, icon: Moon, name: 'El último umbral', range: '71–90%', min: 71, max: 90 },
  { id: 5, icon: Crown, name: 'Final épico', range: '91–100%', min: 91, max: 100 },
]

const PROGRESS_ACHIEVEMENTS = [
  { id: 'PA01', icon: Footprints, name: 'Primeros Pasos', pct: 10, msg: 'Ya no eres un extraño en estas tierras.', xp: 20 },
  { id: 'PA02', icon: Shield, name: 'Veterano Local', pct: 30, msg: 'Conoces los caminos mejor que los NPC.', xp: 20 },
  { id: 'PA03', icon: Sword, name: 'Héroe del Reino', pct: 60, msg: 'La gente susurra tu nombre al pasar.', xp: 20 },
  { id: 'PA04', icon: Flame, name: 'Leyenda Viviente', pct: 90, msg: 'El destino del mundo está en tus manos.', xp: 20 },
  { id: 'PA05', icon: Crown, name: 'Inmortal', pct: 100, msg: 'Tu historia será contada por generaciones.', xp: 50 },
]

const GLOBAL_ACHIEVEMENTS = [
  { id: 'UA01', icon: BookOpen, name: 'El Cronista', msg: '10 notas de bitácora' },
  { id: 'UA02', icon: Timer, name: 'Maratonista', msg: '5h en una sesión' },
  { id: 'UA03', icon: Zap, name: 'Constante', msg: 'Racha de 7 días' },
  { id: 'UA05', icon: Skull, name: 'El que Abandona', msg: 'Primer juego abandonado' },
  { id: 'UA06', icon: Star, name: 'Crítico', msg: 'Calificaste 10 juegos' },
]

const SESSION_TAGS = [
  { id: 'boss', icon: Swords, label: 'Jefe derrotado' },
  { id: 'levelup', icon: TrendingUp, label: 'Subí de nivel' },
  { id: 'newzone', icon: Map, label: 'Zona nueva' },
  { id: 'died', icon: Heart, label: 'Morí mucho' },
  { id: 'plot', icon: BookOpen, label: 'Giro argumental' },
  { id: 'epic', icon: Zap, label: 'Momento épico' },
  { id: 'trophy', icon: Trophy, label: 'Logro desbloqueado' },
  { id: 'frustrat', icon: Angry, label: 'Sesión frustrante' },
  { id: 'coop', icon: Users, label: 'Jugué en coop' },
  { id: 'restart', icon: RefreshCw, label: 'Empecé de nuevo' },
  { id: 'goal', icon: Target, label: 'Objetivo cumplido' },
  { id: 'discover', icon: Lightbulb, label: 'Descubrí algo' },
]

const STAGE_COLORS = ['#94a3b8', '#64748b', '#22c55e', '#06b6d4', '#7c3aed', '#f59e0b']

const STAGE_ICONS = [
]

function stageFromPct(pct) {
  const idx = JOURNEY_STAGES.findIndex(s => pct <= s.max)
  return idx === -1 ? 5 : idx
}

function getAbandonAlert(days) {
  if (!days || days < 3) return null
  if (days < 5) return { level: 'warn', msg: 'El mundo te espera, viajero...' }
  if (days < 10) return { level: 'danger', msg: '¡No has visitado este mundo en varios días! El jefe final te extraña.' }
  if (days < 30) return { level: 'danger', msg: 'Las tierras se oscurecen sin tu presencia. ¿Continúas o abandonas la misión?' }
  return { level: 'critical', msg: 'Este juego ha sido sellado en el olvido. ¿Lo rescatas?' }
}

// Tooltip personalizado para el gráfico emocional
const EmotionalTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload
  const feeling = FEELINGS.find(f => f.id === p?.feeling)
  return (
    <div style={{
      background: 'rgba(15,12,25,0.97)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '8px 12px',
      fontSize: 12, color: '#e8e6f0',
    }}>
      <div style={{ color: FEELING_COLORS[p?.feeling] }}>{feeling?.label}</div>
      <div style={{ color: 'rgba(232,230,240,0.5)', marginTop: 2 }}>{p?.date}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LinearProgressView({ game, onComplete }) {
  const navigate = useNavigate()
  const currentUserRef = useRef(null)

  const [progress, setProgress] = useState(null)
  const [hoursToday, setHoursToday] = useState('')
  const [storyPct, setStoryPct] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(null)
  const [hltbRef, setHltbRef] = useState('main')

  const [currentUser, setCurrentUser] = useState(null)

  {/* estado para el dropdown */ }
  const [hltbDropdownOpen, setHltbDropdownOpen] = useState(false)

  // opciones disponibles
  const hltbOptions = [
    game.hltb_main && { value: 'main', label: `Historia principal · ~${game.hltb_main}h` },
    game.hltb_main_extra && { value: 'main_extra', label: `Historia + Extras · ~${game.hltb_main_extra}h` },
    game.hltb_completionist && { value: 'completionist', label: `Completionista · ~${game.hltb_completionist}h` },
  ].filter(Boolean)

  const [xpData, setXpData] = useState({ total_xp: 0, level: 1 })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return
      setCurrentUser(data.user)
      currentUserRef.current = data.user
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, level')
        .eq('id', data.user.id)
        .single()
      if (profile) setXpData(profile)

      supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', currentUserRef.current?.id ?? '')
        .then(({ data }) => setUserAchievements(data ?? []))
    })
  }, [])

  const [selectedTags, setSelectedTags] = useState([])
  const [customTag, setCustomTag] = useState('')
  const [customTags, setCustomTags] = useState([])
  const [sessionHistory, setSessionHistory] = useState([])

  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [newlyUnlocked, setNewlyUnlocked] = useState([])

  const [userRating, setUserRating] = useState(null)
  const [currentFeeling, setCurrentFeeling] = useState(null)
  const [savingMeta, setSavingMeta] = useState(false)

  const [showAbandonModal, setShowAbandonModal] = useState(false)
  const [abandonReason, setAbandonReason] = useState('')

  const [userAchievements, setUserAchievements] = useState([])

  const [hoverRating, setHoverRating] = useState(null)

  useEffect(() => {
    if (!game?._entryUuid) return

    supabase
      .from('library_entries')
      .select('*, user_id')
      .eq('id', game._entryUuid)
      .single()
      .then(({ data }) => {
        if (data) {
          setProgress(data)
          setStoryPct(data.story_pct ?? 0)
          setHltbRef(data.hltb_reference ?? 'main')
          setUserRating(data.user_rating ?? null)
          setCurrentFeeling(data.current_feeling ?? null)
        }
      })

    supabase
      .from('game_notes')
      .select('*')
      .eq('library_entry_id', game._entryUuid)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data ?? []))

    supabase
      .from('progress_achievements')
      .select('achievement_id, pct_at_unlock, unlocked_at')
      .eq('library_entry_id', game._entryUuid)
      .then(({ data }) => setUnlockedAchievements(data ?? []))

    supabase.from('play_sessions')
      .select('start_date, duration_hours, feeling, global_tags, custom_tags, session_rating')
      .eq('library_entry_id', game._entryUuid)
      .order('start_date', { ascending: true })
      .then(({ data }) => setSessionHistory(data ?? []))

  }, [game?._entryUuid])

  if (!game) return (
    <div style={{ padding: '2rem', color: 'var(--text)' }}>
      Juego no encontrado.{' '}
      <button onClick={() => navigate('/en-progreso')}>← Volver</button>
    </div>
  )

  // ── Datos calculados ──────────────────────────────────────────────────────
  const totalHours = progress?.total_hours ?? 0
  const hltbValue = hltbRef === 'main' ? game.hltb_main : hltbRef === 'main_extra' ? game.hltb_main_extra : game.hltb_completionist
  const currentStage = stageFromPct(storyPct)
  const streak = progress?.current_streak ?? 0
  const lastSession = progress?.last_session_date
  const daysSince = lastSession ? Math.floor((new Date() - new Date(lastSession)) / 86400000) : null
  const abandonAlert = getAbandonAlert(daysSince)
  const isOvertime = hltbValue && totalHours > hltbValue
  const overtimeHours = isOvertime ? Math.round(totalHours - hltbValue) : 0

  // Datos emocionales para gráficos
  const FEELINGS_BY_IDX = ['sad', 'stressed', 'bored', 'relaxed', 'excited', 'hooked']

  const emotionalChartData = sessionHistory.map((s, i) => ({
    date: new Date(s.start_date).toLocaleDateString('es', { day: '2-digit', month: 'short' }),
    time: new Date(s.start_date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }), // ← agrega hora
    feeling: s.feeling ?? 'bored',
    feelingIdx: FEELINGS_BY_IDX.indexOf(s.feeling ?? 'bored'),
    hours: s.duration_hours,
    index: i, // ← agrega índice único
  }))

  const feelingCounts = FEELINGS.map(f => ({
    ...f,
    color: FEELING_COLORS[f.id],
    count: sessionHistory.filter(s => s.feeling === f.id).length,
  })).filter(f => f.count > 0)

  const totalSessions = sessionHistory.length || 1

  const feelingPct = feelingCounts.map(f => ({
    ...f,
    color: FEELING_COLORS[f.id],
    pct: Math.round((f.count / totalSessions) * 100),
  }))

  // XP progress dentro del nivel
  const xpInLevel = xpData.total_xp % 500
  const xpPct = Math.round((xpInLevel / 500) * 100)

  function toggleTag(tagId) {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  function addCustomTag() {
    const t = customTag.trim()
    if (!t || customTags.includes(t)) return
    setCustomTags(prev => [...prev, t])
    setCustomTag('')
  }

  function removeCustomTag(t) {
    setCustomTags(prev => prev.filter(x => x !== t))
  }

  async function handleSaveSession() {
    const hours = parseFloat(hoursToday)
    if (!hours || hours <= 0) return
    if (hours > 24) {
      setSavedMsg({ type: 'error', text: 'Ni los inmortales juegan 24h seguidas. Revisa el número.' })
      return
    }
    if (hours > 8) {
      const ok = window.confirm(`¿Eres un androide? Confirma que realmente jugaste ${hours}h hoy.`)
      if (!ok) return
    }

    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    const newTotal = parseFloat((totalHours + hours).toFixed(2))
    const newHltbPct = hltbValue ? Math.round((newTotal / hltbValue) * 100) : progress?.hltb_pct ?? 0
    const newStreak = lastSession === today ? streak : streak + 1
    const allTags = [...selectedTags, ...customTags]

    await supabase.from('play_sessions').insert({
      library_entry_id: game._entryUuid,
      duration_hours: hours,
      start_date: today,
      story_advance: storyPct,
      global_tags: selectedTags.length ? selectedTags : null,
      custom_tags: customTags.length ? customTags : null,
      feeling: currentFeeling ?? null,
      user_id: currentUser?.id,
      session_rating: userRating ?? null,
    })

    const { data: history } = await supabase
      .from('play_sessions')
      .select('start_date, duration_hours, feeling, global_tags, custom_tags')
      .eq('library_entry_id', game._entryUuid)
      .order('start_date', { ascending: true })
    setSessionHistory(history ?? [])

    await supabase.from('library_entries').update({
      total_hours: newTotal,
      story_pct: storyPct,
      hltb_pct: newHltbPct,
      hltb_reference: hltbRef,
      current_streak: newStreak,
      last_session_date: today,
      journey_stage: currentStage,
      user_rating: userRating ?? null,
    }).eq('id', game._entryUuid)

    const alreadyIds = unlockedAchievements.map(a => a.achievement_id)
    const toUnlock = PROGRESS_ACHIEVEMENTS.filter(
      a => storyPct >= a.pct && !alreadyIds.includes(a.id)
    )
    if (toUnlock.length) {
      const rows = toUnlock.map(a => ({
        library_entry_id: game._entryUuid,
        user_id: currentUser?.id,
        achievement_id: a.id,
        pct_at_unlock: storyPct,
      }))
      const { data: newAch } = await supabase.from('progress_achievements').insert(rows).select()
      if (newAch) {
        setUnlockedAchievements(prev => [...prev, ...newAch])
        setNewlyUnlocked(toUnlock)
        setTimeout(() => setNewlyUnlocked([]), 5000)
      }
    }

    setProgress(prev => ({
      ...prev,
      total_hours: newTotal,
      story_pct: storyPct,
      current_streak: newStreak,
      last_session_date: today,
    }))
    setHoursToday('')
    setSelectedTags([])
    setCustomTags([])
    await addXP(10)
    if (toUnlock.length) {
      for (const a of toUnlock) await addXP(a.xp)
    }
    setSaving(false)
    setSavedMsg({ type: 'success', text: `+${hours}h registradas. ¡Sigue adelante, guerrero!` })
    setTimeout(() => setSavedMsg(null), 3000)
  }

  async function handleSaveNote() {
    const content = noteText.trim()
    if (!content) return
    setSavingNote(true)
    const { data, error } = await supabase.from('game_notes').insert({
      library_entry_id: game._entryUuid,
      user_id: currentUser?.id,
      content,
    }).select().single()
    if (!error && data) {
      const updatedNotes = [data, ...notes]
      setNotes(updatedNotes)
      setNoteText('')
      await addXP(5)
      await checkCronistaAchievement(updatedNotes.length)
    }
    setSavingNote(false)
  }

  async function checkCronistaAchievement(totalNotes) {
    if (totalNotes < 10) return
    const uid = currentUserRef.current?.id
    if (!uid) return
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', uid)
      .eq('achievement_id', 'UA01')
      .maybeSingle()
    if (existing) return
    await supabase.from('user_achievements').insert({ user_id: uid, achievement_id: 'UA01' })
    await addXP(20)
    setNewlyUnlocked([{ id: 'UA01', name: 'El Cronista', msg: '¡Has escrito 10 notas de bitácora!', xp: 20 }])
    setTimeout(() => setNewlyUnlocked([]), 5000)
  }

  async function handleDeleteNote(noteId) {
    await supabase.from('game_notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  const coverUrl = getCover(game)
  const heroUrl = useMemo(() => {
    const screenshots = game.screenshots ?? []
    if (screenshots.length === 0) return coverUrl
    const random = screenshots[Math.floor(Math.random() * screenshots.length)]
    return (random.startsWith('//') ? `https:${random}` : random)
      .replace(/t_[a-z_]+/, 't_1080p')
  }, [game.screenshots])

  async function addXP(amount) {
    const uid = currentUser?.id
    if (!uid) return
    const { data } = await supabase
      .from('profiles')
      .select('total_xp, level')
      .eq('id', uid)
      .single()
    if (!data) return
    const newXp = (data.total_xp ?? 0) + amount
    const newLevel = Math.floor(newXp / 500) + 1
    const { error } = await supabase.from('profiles')
      .update({ total_xp: newXp, level: newLevel })
      .eq('id', uid)
    setXpData({ total_xp: newXp, level: newLevel })
  }

  const CurrentStageIcon = JOURNEY_STAGES[currentStage].icon

  return (
    <div className={styles.root}>

      {/* ══ TOAST DE LOGROS ══════════════════════════════════════════════════ */}
      {newlyUnlocked.length > 0 && (
        <div className={styles.achievementToastWrap}>
          {newlyUnlocked.map(a => (
            < div key={a.id} className={styles.achievementToast} >
              <div className={styles.achievementToastIcon}>
                <a.icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div className={styles.achievementToastTitle}>¡Hito desbloqueado! {a.name}</div>
                <div className={styles.achievementToastMsg}>{a.msg}</div>
                <div className={styles.achievementToastXp}>+{a.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      )
      }

      {/* ══ BODY ════════════════════════════════════════════════════════════ */}
      <div className={styles.body}>

        {/* ── COLUMNA PRINCIPAL ── */}
        <div className={styles.mainCol}>

          {/* ══ HEADER CINEMÁTICO ════════════════════════════════════════════════ */}
          <div className={styles.header}>
            {heroUrl && <div className={styles.heroBg} style={{ backgroundImage: `url(${heroUrl})` }} />}
            <div className={styles.heroOverlay} />

            <div className={styles.headerInner}>
              <button className={styles.backBtn} onClick={() => navigate('/en-progreso')}>
                ← Volver a En progreso
              </button>

              <div className={styles.headerMain}>
                {/* Cover grande izquierda */}
                <div className={styles.cover}>
                  {coverUrl
                    ? <img src={coverUrl} alt={game.title} />
                    : <div className={styles.coverEmpty}>🎮</div>}
                </div>

                {/* Meta central */}
                <div className={styles.meta}>
                  <div className={styles.statusBadge}>En progreso</div>
                  <h1 className={styles.title}>{game.title}</h1>
                  <div className={styles.metaSub}>
                    {game.developer && <span>{game.developer}</span>}
                    {game.year && <><span className={styles.dot}>·</span><span>{game.year}</span></>}
                    {game.platform?.length > 0 && <><span className={styles.dot}>·</span><span>{game.platform.join(', ')}</span></>}
                  </div>
                  <div className={styles.tags}>
                    {game.genre?.slice(0, 4).map(g => <span key={g} className={styles.tag}>{g}</span>)}
                  </div>

                  {game.hltb_main || game.hltb_main_extra || game.hltb_completionist ? (
                    <div className={styles.hltbRef} style={{ position: 'relative' }}>
                      <span className={styles.hltbRefLabel}>Referencia activa</span>
                      <button
                        className={styles.hltbDropdownBtn}
                        onClick={() => setHltbDropdownOpen(o => !o)}
                      >
                        {hltbOptions.find(o => o.value === hltbRef)?.label ?? 'Seleccionar'}
                        <ChevronDown size={12} strokeWidth={2} style={{ marginLeft: 6, transition: 'transform 0.2s', transform: hltbDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </button>

                      {hltbDropdownOpen && (
                        <div className={styles.hltbDropdownMenu}>
                          {hltbOptions.map(o => (
                            <button
                              key={o.value}
                              className={`${styles.hltbDropdownItem} ${hltbRef === o.value ? styles.hltbDropdownItemActive : ''}`}
                              onClick={() => { setHltbRef(o.value); setHltbDropdownOpen(false) }}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.hltbMissing}>
                      ⏱ Sin duración estimada.{' '}
                      <a href={`https://howlongtobeat.com/?q=${encodeURIComponent(game.title)}`} target="_blank" rel="noreferrer">
                        Consúltala en HowLongToBeat →
                      </a>
                    </div>
                  )}

                  <div className={styles.headerActions}>
                    <button
                      className={styles.pauseBtn}
                      onClick={async () => {
                        await supabase.from('library_entries')
                          .update({ status: 'paused' })
                          .eq('id', game._entryUuid)
                        navigate('/en-progreso')
                      }}
                    >
                      ⏸ Poner en pausa
                    </button>

                    <button
                      className={styles.abandonBtn}
                      onClick={() => setShowAbandonModal(true)}
                    >
                      🏳 Abandonar
                    </button>
                  </div>

                </div>

                {/* Progreso derecha */}
                <div className={styles.progressBlock}>
                  <div className={styles.progressLabel}>PROGRESO ESTIMADO</div>
                  <div className={styles.progressPct}>{storyPct}%</div>
                  <div className={styles.progressBarWrap}>
                    <div
                      className={`${styles.progressBar} ${isOvertime ? styles.progressBarOvertime : ''}`}
                      style={{ width: `${Math.min(storyPct, 100)}%` }}
                    />
                  </div>
                  {hltbValue && (
                    <div className={styles.progressSub}>
                      {totalHours}h / {hltbValue}h
                      {isOvertime && <span className={styles.overtimeBadge}>+{overtimeHours}h 🔥</span>}
                    </div>
                  )}
                  <div className={styles.stageBlock}>
                    <div className={styles.stageLabel}>ETAPA ACTUAL</div>
                    <div className={styles.stageCurrent}>
                      <span className={styles.stageIcon}>
                        <CurrentStageIcon size={18} strokeWidth={1.5} />
                      </span>
                      <div>
                        <div className={styles.stageName}>{JOURNEY_STAGES[currentStage].name}</div>
                        <div className={styles.stageRange}>{JOURNEY_STAGES[currentStage].range}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Estadísticas + Nivel */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Estadísticas de tu Aventura</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>⏱</span>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Tiempo total</span>
                  <span className={styles.statVal}>{totalHours}/h</span>
                  <span className={styles.statSub}>Jugadas</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>🔥</span>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Racha actual</span>
                  <span className={styles.statVal}>{streak} día{streak !== 1 ? 's' : ''}</span>
                  <span className={styles.statSub}>Seguido · Mejor racha: 7 días</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>📅</span>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Última sesión</span>
                  <span className={styles.statVal}>{getDaysSince(lastSession) ?? '—'}</span>
                  {daysSince !== null && daysSince > 0 && (
                    <span className={styles.statSub}>{daysSince} día{daysSince !== 1 ? 's' : ''} sin jugar</span>
                  )}
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>💜</span>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Progreso emocional</span>
                  <span className={styles.statVal} style={{ color: FEELING_COLORS[currentFeeling] ?? '#c4b5fd' }}>
                    {FEELINGS.find(f => f.id === currentFeeling)?.label?.split(' ')[1] ?? 'Continuamos...'}
                  </span>
                  <span className={styles.statSub}>Estado actual</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>📊</span>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Progreso (tiempo)</span>
                  <span className={styles.statVal}>{storyPct}%</span>
                  <div className={styles.miniBar}>
                    <div className={styles.miniBarFill} style={{ width: `${storyPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {abandonAlert && (
              <div className={`${styles.statCard} ${styles[`alert_${abandonAlert.level}`]}`} style={{ marginTop: 10 }}>
                <span className={styles.statIcon}>⚠️</span>
                <span className={styles.statLabel}>Alerta</span>
                <span className={styles.statValSm}>{abandonAlert.msg}</span>
              </div>
            )}
          </section>

          {/* 2. Etapas del viaje + Logros de progreso */}
          <div className={styles.twoColGrid}>

            {/* Etapas */}
            <div className={styles.journeyWrap}>
              <h3 className={styles.sectionTitle}>Etapas del Viaje</h3>
              <div className={styles.journey}>
                {JOURNEY_STAGES.map((stage, i) => {
                  const done = i < currentStage
                  const active = i === currentStage
                  const locked = i > currentStage
                  const color = STAGE_COLORS[i]

                  return (
                    <div key={stage.id} className={styles.journeyItem}>
                      {i > 0 && (
                        <div
                          className={styles.journeyLine}
                          style={
                            done || active
                              ? { background: `linear-gradient(to right, ${STAGE_COLORS[i - 1]}, ${STAGE_COLORS[i]})` }
                              : { background: 'rgba(255,255,255,0.06)' }
                          }
                        />
                      )}
                      <button
                        className={`${styles.journeyNode} ${active ? styles.journeyActive : ''} ${locked ? styles.journeyLocked : ''}`}
                        style={!locked ? {
                          background: 'transparent',
                          border: `2px solid ${color}90`,
                          color: '#ffffff',
                          boxShadow: `0 0 10px ${color}60, 0 0 4px ${color}40`,
                        } : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '2px solid rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.2)',
                          boxShadow: 'none',
                        }}
                        onClick={() => !locked && setStoryPct(stage.min)}
                      >
                        <stage.icon size={40} strokeWidth={1.7} />
                      </button>
                      <span className={styles.journeyName}>{stage.name}</span>
                      <span className={styles.journeyRange}>{stage.range}</span>
                    </div>
                  )
                })}
              </div>
              <div className={styles.journeyNarrative}>
                💜 Tu aventura crece en las Tierras Intermedias. Cada paso te acerca a la leyenda.
              </div>
            </div>

            {/* Logros de progreso */}
            <div className={styles.achievementsWrap}>
              <h3 className={styles.sectionTitle}>Logros de Progreso</h3>
              <div className={styles.achievementsGrid}>
                {PROGRESS_ACHIEVEMENTS.map((a, i) => {
                  const unlocked = unlockedAchievements.find(u => u.achievement_id === a.id)

                  // Colores por índice — dorado, morado, cian, verde, gris
                  const ACHIEVEMENT_COLORS = ['#64748b', '#22c55e', '#06b6d4', '#7c3aed', '#f59e0b']
                  const color = ACHIEVEMENT_COLORS[i] ?? '#f59e0b'

                  return (
                    <div
                      key={a.id}
                      className={`${styles.achievementCard} ${unlocked ? styles.achievementUnlocked : styles.achievementLocked}`}
                      style={unlocked ? {
                        background: `linear-gradient(160deg, ${color}22 0%, rgba(10,8,20,0.95) 60%)`,
                        borderColor: `${color}40`,
                        '--particle-color': color,   // para el ::before de partículas
                      } : {}}
                    >
                      {/* Icono */}
                      <div
                        className={styles.achievementIcon}
                        style={unlocked ? {
                          background: `radial-gradient(circle, ${color}30 0%, ${color}10 70%)`,
                          border: `1.5px solid ${color}50`,
                          color: color,
                          filter: `drop-shadow(0 0 8px ${color}80)`,
                        } : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1.5px solid rgba(255,255,255,0.08)',
                          color: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {unlocked
                          ? <a.icon size={30} strokeWidth={1.5} />
                          : <Lock size={28} strokeWidth={1.5} />
                        }
                      </div>

                      <div className={styles.achievementName}>{a.name}</div>
                      <div className={styles.achievementCondition}>{a.pct}% completado</div>

                      {unlocked
                        ? <div className={styles.achievementMsg}>{a.msg}</div>
                        : <div className={styles.achievementMsgLocked}>Completa el {a.pct}%</div>
                      }

                      {/* Divisor brillante */}
                      {unlocked && (
                        <div
                          className={styles.achievementDivider}
                          style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }}
                        />
                      )}

                      {/* Fecha */}
                      {unlocked && (
                        <div className={styles.achievementDate} style={{ color }}>
                          <Calendar size={11} strokeWidth={2} />
                          {new Date(unlocked.unlocked_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 3. Bitácora + Logros globales */}
          <div className={styles.twoColGridBottom}>

            {/* Bitácora */}
            <div className={styles.bitacoraWrap}>
              <h3 className={styles.sectionTitle}>Bitácora del Guerrero</h3>
              <div className={styles.noteInputWrap}>
                <textarea
                  className={styles.noteInput}
                  placeholder='Ej: "Derroté a Radahn después de 12 intentos"...'
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                />
                <div className={styles.noteInputFooter}>
                  <span className={styles.xpHint}>📜 +5 XP por nota</span>
                  <button
                    className={styles.noteBtn}
                    onClick={handleSaveNote}
                    disabled={savingNote || !noteText.trim()}
                  >
                    {savingNote ? 'Guardando...' : '+ Nueva nota'}
                  </button>
                </div>
              </div>
              <div className={styles.notesList}>
                {notes.length === 0 && (
                  <div className={styles.notesEmpty}>Tu bitácora está en blanco. El primer paso en la leyenda eres tú.</div>
                )}
                {notes.map(n => (
                  <div key={n.id} className={styles.noteItem}>
                    <div className={styles.noteContent}>{n.content}</div>
                    <div className={styles.noteMeta}>
                      <span>{new Date(n.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</span>
                      <button className={styles.noteDelete} onClick={() => handleDeleteNote(n.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logros globales */}
            <div className={styles.globalAchievementsWrap}>
              <h3 className={styles.sectionTitle}>Logros Globales</h3>
              {userAchievements.length === 0 ? (
                <div className={styles.notesEmpty}>Aún no has desbloqueado logros globales.</div>
              ) : (
                <div className={styles.achievementsGrid}>
                  {GLOBAL_ACHIEVEMENTS
                    .filter(a => userAchievements.find(u => u.achievement_id === a.id))
                    .map(a => {
                      const unlocked = userAchievements.find(u => u.achievement_id === a.id)
                      return (
                        <div key={a.id} className={`${styles.achievementCard} ${styles.achievementUnlocked}`}>
                          <div className={styles.achievementIcon}>
                            {unlocked ? <a.icon size={22} strokeWidth={1.5} /> : <Lock size={22} strokeWidth={1.5} />}
                          </div>
                          <div className={styles.achievementName}>{a.name}</div>
                          <div className={styles.achievementMsg}>{a.msg}</div>
                          <div className={styles.achievementDate}>
                            {new Date(unlocked.unlocked_at).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              )}
            </div>
          </div>

          {/* 4. Historial de sesiones */}
          {sessionHistory.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Historial de Sesiones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sessionHistory.slice().reverse().map((s, i) => (
                  <div key={i} className={styles.sessionRow}>
                    <div className={styles.sessionDate}>
                      {new Date(s.start_date).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className={styles.sessionHours}>⏱ {s.duration_hours}h</div>
                    {s.feeling && (
                      <div className={styles.sessionFeeling}>
                        {FEELINGS.find(f => f.id === s.feeling)?.label ?? s.feeling}
                      </div>
                    )}
                    {s.session_rating && (
                      <div className={styles.sessionRating}>⭐ {s.session_rating}/10</div>
                    )}
                    {s.global_tags?.length > 0 && (
                      <div className={styles.sessionTags}>
                        {s.global_tags.map(t => (
                          <span key={t} className={styles.sessionTag}>
                            {SESSION_TAGS.find(st => st.id === t)?.label ?? t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Estado emocional en el tiempo — GRÁFICOS */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Tu Estado Emocional en el Tiempo</h3>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
              padding: '20px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 300px', gap: 20, alignItems: 'center', minWidth: 0, }}>

                {/* Gráfico de línea emocional */}
                <div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ height: 200, width: '100%' }}>
                      {emotionalChartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={emotionalChartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                            <XAxis
                              dataKey="index"
                              tickFormatter={(i) => emotionalChartData[i]?.time ?? ''}
                              tick={{ fill: 'rgba(232,230,240,0.3)', fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              domain={[-0.5, 5.5]}
                              ticks={[0, 1, 2, 3, 4, 5]}
                              tick={(props) => {
                                const { x, y, payload } = props
                                const feeling = FEELINGS.find(f => f.id === FEELINGS_BY_IDX[payload.value])
                                return (
                                  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={14}>
                                    {feeling?.label?.split(' ')[0] ?? ''}
                                  </text>
                                )
                              }}
                              axisLine={false}
                              tickLine={false}
                              width={36}
                            />
                            <Tooltip content={({ active, payload }) => {
                              if (!active || !payload?.length) return null
                              const p = payload[0]?.payload
                              const feeling = FEELINGS.find(f => f.id === p?.feeling)
                              return (
                                <div style={{
                                  background: 'rgba(15,12,25,0.97)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: 10, padding: '8px 12px',
                                  fontSize: 12, color: '#e8e6f0',
                                }}>
                                  <div style={{ color: FEELING_COLORS[p?.feeling] }}>{feeling?.label}</div>
                                  <div style={{ color: 'rgba(232,230,240,0.5)', marginTop: 2 }}>{p?.date} {p?.time}</div>  {/* ← aquí */}
                                </div>
                              )
                            }} />
                            <defs>
                              <linearGradient id="emotionLine" x1="0" y1="1" x2="0" y2="0">  {/* ← x1/x2/y1/y2 vertical ahora */}
                                <stop offset="0%" stopColor="#ef4444" />    {/* rojo — estado bajo */}
                                <stop offset="50%" stopColor="#f59e0b" />   {/* amarillo — medio */}
                                <stop offset="100%" stopColor="#22c55e" />  {/* verde — estado alto */}
                              </linearGradient>
                            </defs>
                            <Line
                              type="monotone"
                              dataKey="feelingIdx"
                              stroke="url(#emotionLine)"
                              strokeWidth={2.5}
                              dot={(props) => {
                                const feeling = FEELINGS.find(f => f.id === props.payload?.feeling)  // ← por id, no por índice
                                return (
                                  <circle
                                    key={props.key}
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={5}
                                    fill={FEELING_COLORS[feeling?.id] ?? '#a78bfa'}  // ← FEELING_COLORS
                                    stroke="rgba(10,10,15,0.8)"
                                    strokeWidth={2}
                                  />
                                )
                              }}
                              activeDot={{ r: 7, fill: '#a78bfa', stroke: 'rgba(167,139,250,0.3)', strokeWidth: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(232,230,240,0.3)', fontSize: 13 }}>
                          Registra más sesiones para ver tu evolución emocional
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Distribución + PieChart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Donut */}
                  {feelingCounts.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 120 }}>
                      <PieChart width={150} height={150}>
                        <Pie
                          data={feelingCounts}
                          cx={70}
                          cy={70}
                          innerRadius={45}
                          outerRadius={55}
                          dataKey="count"
                          strokeWidth={0}
                        >
                          {feelingCounts.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} opacity={0.9} />
                          ))}
                        </Pie>
                      </PieChart>
                      <div style={{
                        position: 'absolute',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        pointerEvents: 'none',
                      }}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-bright)' }}>{totalSessions}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>sesiones</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barras de distribución */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {feelingPct.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', minWidth: 80 }}>
                        {f.label.split(' ').slice(1).join(' ')}
                      </span>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: 99, transition: 'width 0.6s ease', opacity: 0.85 }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', minWidth: 28, textAlign: 'right' }}>{f.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sideCol}>

          {/* Nivel actual — tarjeta especial */}
          <div className={styles.levelCard}>
            <div className={styles.levelBadge}>{xpData.level}</div>
            <div className={styles.levelInfo}>
              <div className={styles.levelXp}>⭐ {xpData.total_xp} XP</div>
              <div className={styles.levelXpBar}>
                <div className={styles.levelXpFill} style={{ width: `${xpPct}%` }} />
              </div>
              <div className={styles.levelXpNext}>{500 - xpInLevel} XP para nivel {xpData.level + 1}</div>
            </div>
          </div>

          {/* Registro de sesión */}
          <div className={styles.sideCard}>
            <div className={styles.sidebarHeaderRow}>
              <h4><span className={styles.sideCardTitle}>NUEVA SESIÓN</span></h4>
              <button className={styles.sidebarResetBtn} title="Limpiar formulario" onClick={() => {
                setHoursToday(''); setSelectedTags([]); setCustomTags([]); setCurrentFeeling(null); setNoteText('')
              }}>↺</button>
            </div>
            <p className={styles.sideCardSub}>¿Cuántas horas jugaste hoy?</p>

            <div className={styles.hoursInput}>
              <input
                type="number" min="0" max="24" step="0.5"
                placeholder="2.5"
                value={hoursToday}
                onChange={e => setHoursToday(e.target.value)}
                className={styles.hoursField}
              />
              <span className={styles.hoursUnit}>h</span>
            </div>

            <div className={styles.storySliderWrap}>
              <div className={styles.storySliderLabel}>
                <span>Tu viaje</span>
                <span>{storyPct}%</span>
              </div>
              <input
                type="range" min="0" max="100"
                value={storyPct}
                onChange={e => setStoryPct(parseInt(e.target.value))}
                className={styles.storySlider}
              />
              <div className={styles.storySliderHint}>¿Qué % de la historia crees que llevas?</div>
            </div>

            {/* Tags */}
            <div className={styles.tagsSection}>
              <div className={styles.tagsSectionLabel}>¿Pasó algo especial?</div>
              <div className={styles.tagsGrid}>
                {SESSION_TAGS.map(t => (
                  <button
                    key={t.id}
                    className={`${styles.tagBtn} ${selectedTags.includes(t.id) ? styles.tagBtnActive : ''}`}
                    onClick={() => toggleTag(t.id)}
                  >
                    <t.icon size={13} strokeWidth={1.5} />
                    {t.label}
                  </button>
                ))}
              </div>
              <div className={styles.customTagRow}>
                <input
                  className={styles.customTagInput}
                  placeholder="Tag propio..."
                  value={customTag}
                  onChange={e => setCustomTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                />
                <button className={styles.customTagAdd} onClick={addCustomTag}>+</button>
              </div>
              {customTags.length > 0 && (
                <div className={styles.customTagsList}>
                  {customTags.map(t => (
                    <span key={t} className={styles.customTagChip}>
                      {t}
                      <button onClick={() => removeCustomTag(t)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Feelings */}
            <div className={styles.feelingWrap}>
              <div className={styles.feelingLabel}>¿Cómo te sientes hoy con este juego?</div>
              <div className={styles.feelingGrid}>
                {FEELINGS.map(f => (
                  <button
                    key={f.id}
                    className={`${styles.feelingBtn} ${currentFeeling === f.id ? styles.feelingBtnActive : ''}`}
                    onClick={() => setCurrentFeeling(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calificación */}
            <div className={styles.sideCard}>
              <h4 className={styles.sideCardTitle}>¿CÓMO LO ESTÁS VIVIENDO?</h4>
              <div className={styles.ratingWrap}>
                <div className={styles.ratingLabel}>Tu calificación</div>
                <div className={styles.ratingStars}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setUserRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(null)}
                      className={`${styles.ratingStar} ${(hoverRating ?? userRating) >= n ? styles.ratingStarActive : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {userRating && (
                  <div style={{ fontSize: 12, color: 'rgba(232,230,240,0.4)', marginTop: 4 }}>
                    {userRating} / 10
                  </div>
                )}
              </div>
            </div>

            {savedMsg && (
              <div className={`${styles.savedMsg} ${styles[savedMsg.type]}`}>
                {savedMsg.text}
              </div>
            )}

            <button
              className={styles.saveBtn}
              onClick={handleSaveSession}
              disabled={saving || !hoursToday}
            >
              {saving ? 'Guardando...' : 'Guardar sesión ↗'}
            </button>
            <div className={styles.xpHint}>⭐ +10 XP por registrar sesión</div>
          </div>

          {/* Próximo hito */}
          {currentStage < 5 && (
            <div className={styles.sideCard}>
              <h4 className={styles.sideCardTitle}>PRÓXIMO HITO</h4>
              <div className={styles.nextStage}>
                <span className={styles.nextStageIcon}>
                  {(() => { const Icon = JOURNEY_STAGES[currentStage + 1].icon; return <Icon size={18} strokeWidth={1.5} /> })()}
                </span>
                <div>
                  <div className={styles.nextStageName}>{JOURNEY_STAGES[currentStage + 1].name}</div>
                  <div className={styles.nextStageRange}>{JOURNEY_STAGES[currentStage + 1].range}</div>
                  {hltbValue && (
                    <div className={styles.nextStageHours}>
                      Juega ~{Math.max(0, Math.round(hltbValue * JOURNEY_STAGES[currentStage + 1].min / 100) - totalHours)}h más
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sellar el capítulo */}
          {storyPct >= 90 && (
            <div className={styles.sideCard} style={{ borderColor: 'rgba(251,191,36,0.3)' }}>
              <h4 className={styles.sideCardTitle}>👑 ¿LISTO PARA EL FINAL?</h4>
              <p className={styles.sideCardSub}>
                Estás en el último umbral. Cuando termines tu aventura, sella este capítulo.
              </p>
              <button
                className={styles.saveBtn}
                style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#0a0a0f' }}
                onClick={async () => {
                  await supabase.from('library_entries')
                    .update({ status: 'completed', story_pct: 100 })
                    .eq('id', game._entryUuid)
                  await addXP(50)
                  onComplete?.(game)
                  navigate('/salon')
                }}
              >
                👑 Sellar este capítulo
              </button>
            </div>
          )}

        </aside>
      </div>

      {/* Modal abandonar */}
      {
        showAbandonModal && (
          <div className={styles.abandonBackdrop} onClick={() => setShowAbandonModal(false)}>
            <div className={styles.abandonModal} onClick={e => e.stopPropagation()}>
              <h3 className={styles.abandonTitle}>¿Abandonas esta aventura?</h3>
              <p className={styles.abandonSub}>No hay juicio aquí. ¿Qué pasó, guerrero?</p>
              <div className={styles.abandonReasons}>
                {[
                  'Salió otro juego',
                  'Se puso muy difícil',
                  'Perdí el guardado',
                  'No era para mí',
                  'Por ahora no, pero volveré',
                ].map(r => (
                  <button
                    key={r}
                    className={`${styles.abandonReasonBtn} ${abandonReason === r ? styles.abandonReasonActive : ''}`}
                    onClick={() => setAbandonReason(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className={styles.abandonActions}>
                <button className={styles.abandonCancel} onClick={() => setShowAbandonModal(false)}>
                  Cancelar
                </button>
                <button
                  className={styles.abandonConfirm}
                  disabled={!abandonReason}
                  onClick={async () => {
                    if (abandonReason === 'Por ahora no, pero volveré') {
                      await supabase.from('library_entries')
                        .update({ status: 'paused', abandon_reason: abandonReason })
                        .eq('id', game._entryUuid)
                      navigate('/en-progreso')
                    } else {
                      await supabase.from('library_entries')
                        .update({ status: 'abandoned', abandon_reason: abandonReason })
                        .eq('id', game._entryUuid)
                      await addXP(5)
                      navigate('/en-progreso')
                    }
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  )
}