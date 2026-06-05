import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import styles from './LinearProgressView.module.css'
import GameView from './GameView'
import EmotionalProgress, { FEELINGS, FEELING_COLORS } from '../components/EmotionalProgress'
import { Tooltip, ResponsiveContainer } from 'recharts'
import {
  Star, Lock, Skull, TrendingUp, Map, Heart, BookOpen, Zap, Trophy,
  Angry, Users, RefreshCw, Target, Lightbulb,
  Timer, Calendar, ChevronDown
} from 'lucide-react'

import SunriseIcon from '../../../assets/icons/atardecer.svg?react'
import CompassIcon from '../../../assets/icons/brujula.svg?react'
import SwordsIcon from '../../../assets/icons/espadas.svg?react'
import CastleIcon from '../../../assets/icons/castillo.svg?react'
import MoonIcon from '../../../assets/icons/luna-llena.svg?react'
import CrownIcon from '../../../assets/icons/corona.svg?react'

import FootprintsIcon from '../../../assets/icons/zapatos.png'
import ShieldIcon from '../../../assets/icons/proteger.png'
import SwordIcon from '../../../assets/icons/casco.png'
import FlameIcon from '../../../assets/icons/muscle.png'
import CrownIcon2 from '../../../assets/icons/fenix.png'

const QUICK_HOURS = [1, 2, 3, '4+']

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
  { id: 0, icon: 'sunrise', name: 'Inicio del viaje', range: '0–10%', min: 0, max: 10 },
  { id: 1, icon: 'compass', name: 'Aventurero', range: '11–30%', min: 11, max: 30 },
  { id: 2, icon: 'swords', name: 'Guerrero', range: '31–50%', min: 31, max: 50 },
  { id: 3, icon: 'castle', name: 'Leyenda', range: '51–70%', min: 51, max: 70 },
  { id: 4, icon: 'moon', name: 'El último umbral', range: '71–90%', min: 71, max: 90 },
  { id: 5, icon: 'crown', name: 'Final épico', range: '91–100%', min: 91, max: 100 },
]

const PROGRESS_ACHIEVEMENTS = [
  { id: 'PA01', icon: FootprintsIcon, name: 'Primeros Pasos', pct: 10, msg: 'Ya no eres un extraño en estas tierras.', xp: 20 },
  { id: 'PA02', icon: ShieldIcon, name: 'Veterano Local', pct: 30, msg: 'Conoces los caminos mejor que los NPC.', xp: 20 },
  { id: 'PA03', icon: SwordIcon, name: 'Héroe del Reino', pct: 60, msg: 'La gente susurra tu nombre al pasar.', xp: 20 },
  { id: 'PA04', icon: FlameIcon, name: 'Leyenda Viviente', pct: 90, msg: 'El destino del mundo está en tus manos.', xp: 20 },
  { id: 'PA05', icon: CrownIcon2, name: 'Inmortal', pct: 100, msg: 'Tu historia será contada por generaciones.', xp: 50 },
]

const GLOBAL_ACHIEVEMENTS = [
  { id: 'UA01', icon: BookOpen, name: 'El Cronista', msg: '10 notas de bitácora' },
  { id: 'UA02', icon: Timer, name: 'Maratonista', msg: '5h en una sesión' },
  { id: 'UA03', icon: Zap, name: 'Constante', msg: 'Racha de 7 días' },
  { id: 'UA05', icon: Skull, name: 'El que Abandona', msg: 'Primer juego abandonado' },
  { id: 'UA06', icon: Star, name: 'Crítico', msg: 'Calificaste 10 juegos' },
]

const SESSION_TAGS = [
  { id: 'boss', emoji: '⚔️', label: ' Jefe derrotado' },
  { id: 'levelup', emoji: '⬆️', label: ' Subí de nivel' },
  { id: 'newzone', emoji: '🗺️', label: ' Zona descubierta' },
  { id: 'died', emoji: '💔', label: ' Morí mucho' },
  { id: 'plot', emoji: '📖', label: ' Todo cambió' },
  { id: 'epic', emoji: '✨', label: ' Momento épico' },
  { id: 'trophy', emoji: '🏆', label: ' Logro desbloqueado' },
  { id: 'frustrat', emoji: '🤯', label: ' Sesión frustrante' },
  { id: 'coop', emoji: '🤝', label: ' Jugué en coop' },
  { id: 'restart', emoji: '🔁', label: ' Empecé de nuevo' },
  { id: 'goal', emoji: '🎯', label: ' Objetivo cumplido' },
  { id: 'discover', emoji: '🔍', label: ' Descubrí algo' },
  { id: 'cinema', emoji: '📽️', label: ' Cine absoluto' },
  { id: 'cantStop', emoji: '🚀', label: ' No podía parar' },
  { id: 'secret', emoji: '♨️', label: ' Encontré un secreto' },
  { id: 'victory', emoji: '👑', label: ' Victoria importante' },
];

const STAGE_COLORS = ['#e6ba97', '#c97ea3', '#22c55e', '#06b6d4', '#7c3aed', '#f59e0b']

const STAGE_ICONS = {
  sunrise: SunriseIcon,
  compass: CompassIcon,
  swords: SwordsIcon,
  castle: CastleIcon,
  moon: MoonIcon,
  crown: CrownIcon,
}

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

// ─────────────────────────────────────────────────────────────────────────────
export default function LinearProgressView({ game, onComplete, onEdit, onDelete }) {
  const navigate = useNavigate()
  const currentUserRef = useRef(null)

  const [progress, setProgress] = useState(null)
  const [hoursToday, setHoursToday] = useState('')
  const [storyPct, setStoryPct] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(null)
  const [hltbRef, setHltbRef] = useState('main')

  const [showGameView, setShowGameView] = useState(false)

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

  const [touchedFields, setTouchedFields] = useState({
    story: false, tags: false, feeling: false, rating: false, note: false
  })

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

  const totalSessions = sessionHistory.length || 1
  // XP progress dentro del nivel
  const xpInLevel = xpData.total_xp % 500
  const xpPct = Math.round((xpInLevel / 500) * 100)

  function toggleTag(id) {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
    setTouchedFields(p => ({ ...p, tags: true }))
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

    let xpEarned = 10
    if (touchedFields.story) xpEarned += 10
    if (touchedFields.tags || allTags.length > 0) xpEarned += 10
    if (touchedFields.feeling) xpEarned += 10
    if (touchedFields.rating) xpEarned += 10
    if (touchedFields.note) xpEarned += 10

    await addXP(xpEarned)
    if (toUnlock.length) {
      for (const a of toUnlock) await addXP(a.xp)
    }

    if (noteText.trim()) {
      const { data } = await supabase.from('game_notes').insert({
        library_entry_id: game._entryUuid,
        user_id: currentUser?.id,
        content: noteText.trim(),
      }).select().single()
      if (data) {
        setNotes(prev => [data, ...prev])
        setNoteText('')
        await checkCronistaAchievement(notes.length + 1)
      }
    }

    setSaving(false)
    setSavedMsg({ type: 'success', text: `+${hours}h registradas. ¡Sigue adelante, guerrero!` })
    setTimeout(() => setSavedMsg(null), 3000)
    setCurrentFeeling(null)
    setStoryPct(0)
    setUserRating(null)
    setTouchedFields({ story: false, tags: false, feeling: false, rating: false, note: false })
  }

  // handleSaveNote sin cambios, siempre da +5
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
      await addXP(5)  // siempre +5
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

      {/* TOAST DE LOGROS */}
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

      {/* BODY */}
      <div className={styles.body}>

        {/* ── COLUMNA PRINCIPAL ── */}
        <div className={styles.mainCol}>

          {/* HEADER CINEMÁTICO */}
          <div className={styles.header}>
            {heroUrl && <div className={styles.heroBg} style={{ backgroundImage: `url(${heroUrl})` }} />}
            <div className={styles.heroOverlay} />

            <div className={styles.headerInner}>
              <button className={styles.backBtn} onClick={() => navigate('/en-progreso')}>
                ← Volver a En progreso
              </button>

              <div className={styles.headerMain}>
                {/* Cover grande izquierda */}
                <div className={styles.cover} onClick={() => setShowGameView(true)} style={{ cursor: 'pointer' }}>
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
                        onClick={() => setHltbDropdownOpen(o => !o)}>
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
                        <CurrentStageIcon size={30} strokeWidth={2} />
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
                        <div className={styles.journeyLineWrap}>
                          {/* Rombo izquierdo */}
                          <div
                            className={styles.journeyDiamond}
                            style={{
                              position: 'absolute', left: -4,
                              ...(done || active
                                ? { background: STAGE_COLORS[i - 1], boxShadow: `0 0 6px ${STAGE_COLORS[i - 1]}` }
                                : { background: 'rgba(255,255,255,0.1)' })
                            }}
                          />

                          <div
                            className={styles.journeyLine}
                            style={
                              done || active
                                ? { background: `linear-gradient(to right, ${STAGE_COLORS[i - 1]}, ${color})` }
                                : { background: 'rgba(255,255,255,0.06)' }
                            }
                          />

                          {/* Rombo centro ← nuevo */}
                          <div
                            className={styles.journeyDiamond}
                            style={{
                              position: 'absolute', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                              ...(done || active
                                ? { background: `color-mix(in srgb, ${STAGE_COLORS[i - 1]}, ${color})`, boxShadow: `0 0 6px ${color}` }
                                : { background: 'rgba(255,255,255,0.1)' })
                            }}
                          />

                          {/* Rombo derecho */}
                          <div
                            className={styles.journeyDiamond}
                            style={{
                              position: 'absolute', right: -4,
                              ...(done || active
                                ? { background: color, boxShadow: `0 0 6px ${color}` }
                                : { background: 'rgba(255,255,255,0.1)' })
                            }}
                          />
                        </div>
                      )}
                      <button
                        className={`${styles.journeyNode} ${active ? styles.journeyActive : ''} ${done ? styles.journeyDone : ''} ${locked ? styles.journeyLocked : ''}`}
                        style={!locked ? {
                          '--stage-color': color,
                          border: `2px solid ${color}`,
                          background: `radial-gradient(circle at 30% 25%, ${color}50 0%, rgba(10,8,25,0.98) 50%, rgba(0,0,0,0.95) 100%)`,
                          boxShadow: active
                            ? `4px 6px 16px rgba(0,0,0,0.8),
                              -2px -2px 8px rgba(255,255,255,0.04),
                              inset 3px 3px 8px rgba(255,255,255,0.18),
                              inset -3px -3px 8px rgba(0,0,0,0.8),
                              inset 0 1px 0 rgba(255,255,255,0.25),
                              0 0 20px ${color}60`
                            : `4px 6px 12px rgba(0,0,0,0.7),
                              -2px -2px 8px rgba(255,255,255,0.04),
                              inset 3px 3px 8px rgba(255,255,255,0.15),
                              inset -3px -3px 8px rgba(0,0,0,0.7),
                              inset 0 1px 0 rgba(255,255,255,0.2),
                              0 0 10px ${color}40`,
                        } : {
                          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.04) 0%, rgba(10,8,25,0.9) 60%, rgba(0,0,0,0.8) 100%)',
                          boxShadow: '3px 4px 10px rgba(0,0,0,0.5), inset 1px 1px 4px rgba(255,255,255,0.04), inset -1px -1px 4px rgba(0,0,0,0.4)',
                          border: '2px solid rgba(255,255,255,0.08)',
                        }}
                        onClick={() => !locked && setStoryPct(stage.min)}
                      >
                        {/* Anillo exterior en activo Y desbloqueados */}
                        {(active || done) && (
                          <div className={styles.journeyRingOuter} style={{ borderColor: `${color}60` }} />
                        )}

                        {(() => {
                          const IconComponent = STAGE_ICONS[stage.icon]
                          return (
                            <IconComponent
                              width={50}
                              height={50}
                              style={{
                                color: locked ? 'rgba(255,255,255,0.2)' : color,
                                filter: locked
                                  ? 'brightness(0.4)'
                                  : `brightness(1.4) drop-shadow(0 2px 6px ${color}90)`,
                                flexShrink: 0,
                              }}
                            />
                          )
                        })()}

                        {/* Badge palomita o candado */}
                        {done && (
                          <div className={styles.journeyBadge} style={{ background: color }}>✓</div>
                        )}
                        {locked && (
                          <div className={styles.journeyBadgeLocked}>🔒</div>
                        )}
                      </button>

                      <span className={styles.journeyName} style={!locked ? { color: active ? color : 'rgba(232,230,240,0.9)' } : {}}>
                        {stage.name}
                      </span>
                      <span className={styles.journeyRange}>{stage.range}</span>
                    </div>
                  )
                })}
              </div>
              <div className={styles.journeyNarrative}>
                🔥 Tu aventura crece en las Tierras Intermedias. Cada paso te acerca a la leyenda.
              </div>
            </div>

            {/* Logros de progreso */}
            <div className={styles.achievementsWrap}>
              <h3 className={styles.sectionTitle}>Logros de Progreso</h3>
              <div className={styles.achievementsGrid}>
                {PROGRESS_ACHIEVEMENTS.map((a, i) => {
                  const unlocked = unlockedAchievements.find(u => u.achievement_id === a.id)
                  const ACHIEVEMENT_COLORS = ['#64748b', '#22c55e', '#06b6d4', '#7c3aed', '#f59e0b']
                  const color = ACHIEVEMENT_COLORS[i] ?? '#f59e0b'

                  return (
                    <div
                      key={a.id}
                      className={`${styles.achievementCard} ${unlocked ? styles.achievementUnlocked : styles.achievementLocked}`}
                      style={unlocked ? {
                        background: `linear-gradient(160deg, ${color}28 0%, rgba(10,8,20,0.98) 55%, rgba(0,0,0,0.95) 100%)`,
                        borderColor: `${color}50`,
                        '--particle-color': color,
                        boxShadow: `
                            0 8px 32px rgba(0,0,0,0.6),
                            inset 0 1px 0 rgba(255,255,255,0.08),
                            0 0 24px ${color}20`,
                      } : {
                        '--particle-color': 'rgba(255,255,255,0.1)',
                      }}
                    >

                      {/* ── Icono ── */}
                      <div
                        className={styles.achievementIcon}
                        style={unlocked ? {
                          background: `radial-gradient(circle at 30% 25%, ${color}50 0%, rgba(10,8,25,0.98) 50%, rgba(0,0,0,0.95) 100%)`,
                          border: `1.5px solid ${color}60`,
                          overflow: 'visible',
                          boxShadow: `
                              4px 6px 16px rgba(0,0,0,0.8),
                              inset 3px 3px 8px rgba(255,255,255,0.18),
                              inset -3px -3px 8px rgba(0,0,0,0.8),
                              inset 0 1px 0 rgba(255,255,255,0.25),
                              0 0 20px ${color}50`,
                        } : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1.5px solid rgba(255,255,255,0.08)',
                          overflow: 'visible',
                          boxShadow: `
                              3px 4px 10px rgba(0,0,0,0.5),
                              inset 1px 1px 4px rgba(255,255,255,0.04),
                              inset -1px -1px 4px rgba(0,0,0,0.4)`,
                        }}
                      >
                        {/* Badge palomita */}
                        {unlocked && (
                          <div className={styles.achievementBadge} style={{ background: color }}>✓</div>
                        )}

                        {/* Lustre 3D */}
                        {unlocked && (
                          <div style={{
                            position: 'absolute',
                            top: '8%', left: '15%',
                            width: '55%', height: '35%',
                            background: 'radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%)',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            zIndex: 1,
                          }} />
                        )}

                        {/* Icono */}
                        {unlocked
                          ? <img
                            src={a.icon}
                            alt={a.name}
                            style={{
                              width: 36,
                              height: 36,
                              objectFit: 'contain',
                              position: 'relative',
                              zIndex: 2,
                              filter: `drop-shadow(0 2px 8px ${color})`,
                            }}
                          />
                          : <Lock width={28} height={28} style={{ color: 'rgba(255,255,255,0.25)', position: 'relative', zIndex: 2 }} />
                        }
                      </div>

                      {/* Badge candado */}
                      {!unlocked && (
                        <div className={styles.achievementBadgeLocked}>🔒</div>
                      )}

                      {/* ── Textos ── */}
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
                      {(() => {
                        const [y, m, d] = s.start_date.split('-')
                        return new Date(+y, +m - 1, +d).toLocaleDateString('es', { day: '2-digit', month: 'short' })
                      })()}
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

          {/* TENDENCIA EMOCIONAL */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>TENDENCIA EMOCIONAL</span>
            </div>
            <EmotionalProgress sessionHistory={sessionHistory} currentFeeling={currentFeeling} />
          </div>

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
              <h4><span className={styles.sideCardTitle}>REGISTRAR NUEVA SESIÓN</span></h4>
              <button className={styles.sidebarResetBtn} title="Limpiar formulario" onClick={() => {
                setHoursToday(''); setSelectedTags([]); setCustomTags([]); setCurrentFeeling(null); setNoteText('')
              }}>↺</button>
            </div>
            <p className={styles.sideCardSub}>¿Cuántas horas le dedicaste hoy? ⭐ +10 XP</p>

            <div className={styles.hoursInput}>
              <input
                type="number" min="0" max="24" step="0.5"
                placeholder="Ejemplo: 2.5"
                value={hoursToday}
                onChange={e => setHoursToday(e.target.value)}
                className={styles.hoursField}
              />
              <span className={styles.hoursUnit}>h</span>
            </div>
            <div className={styles.quickHours}>
              {QUICK_HOURS.map(h => (
                <button
                  key={h}
                  className={`${styles.quickHourBtn} ${hoursToday == h ? styles.quickHourActive : ''}`}
                  onClick={() => {
                    if (h === '4+') {
                      setHoursToday(prev => String(parseInt(prev) >= 4 ? parseInt(prev) + 1 : 4));
                    } else {
                      setHoursToday(String(h));
                    }
                  }}
                >
                  {h === '4+' && parseInt(hoursToday) >= 4 ? hoursToday : h}  {/* ← aquí, reemplaza el {h} anterior */}
                </button>
              ))}
            </div>

            <div className={styles.storySliderWrap}>
              <div className={styles.storySliderLabel}>
                <span>Tu propio progreso</span>
                <span>{storyPct}%</span>
              </div>
              <input
                type="range" min="0" max="100"
                value={storyPct}
                onChange={e => {
                  setStoryPct(parseInt(e.target.value))
                  setTouchedFields(p => ({ ...p, story: true }))
                }}
                className={styles.storySlider}
                style={{ '--val': `${storyPct}%` }}
              />
              <div className={styles.storySliderHint}>
                {(() => {
                  const hoursMap = {
                    main: game.hltb_main,
                    main_extra: game.hltb_main_extra,
                    completionist: game.hltb_completionist,
                  };
                  const total = hoursMap[hltbRef];
                  if (!total) return '¿Qué % de la historia crees que llevas?';
                  return `De las ~${total}h estimadas, ¿cuántas crees que avanzaste en esta sesión?`;
                })()}
              </div>
              <div className={styles.divider} />
            </div>

            {/* Tags */}
            <div className={styles.tagsSection}>
              <div className={styles.tagsSectionLabel}>¿Pasó algo especial? ⭐ +10 XP</div>
              <div className={styles.tagsGrid}>
                {SESSION_TAGS.map(t => (
                  <button
                    key={t.id}
                    className={`${styles.tagBtn} ${selectedTags.includes(t.id) ? styles.tagBtnActive : ''}`}
                    onClick={() => toggleTag(t.id)}
                  >
                    <span>{t.emoji}</span>
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
              <div className={styles.divider} />
            </div>

            {/* Feelings */}
            <div className={styles.feelingWrap}>
              <div className={styles.feelingLabel}>¿Cómo te sientes hoy con este juego? ⭐ +10 XP</div>
              <div className={styles.feelingGrid}>
                {FEELINGS.map(f => {
                  const emoji = [...f.label][0]
                  const text = f.label.slice(emoji.length).trim()
                  return (
                    <button
                      key={f.id}
                      className={`${styles.feelingBtn} ${currentFeeling === f.id ? styles.feelingBtnActive : ''}`}
                      onClick={() => {
                        setCurrentFeeling(f.id)
                        setTouchedFields(p => ({ ...p, feeling: true }))
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{emoji}</span>
                      <span>{text}</span>
                    </button>
                  )
                })}
              </div>
              <div className={styles.divider} />
            </div>

            {/* Calificación */}
            <div className={styles.sideCard}>
              <h4 className={styles.sideCardTitle}>¿CÓMO LO ESTÁS VIVIENDO?</h4>
              <div className={styles.ratingWrap}>
                <div className={styles.ratingLabel}>Tu calificación ⭐ +10 XP</div>
                <div className={styles.ratingStars}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => {
                        setUserRating(r)
                        setTouchedFields(p => ({ ...p, rating: true }))
                      }}
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

            < div className={styles.divider} />

            {/* Notas rápidas */}
            <div className={styles.sidePanelLabel}>Notas rápidas <span className={styles.optional}>(opcional) ⭐ +10 XP</span></div>
            <textarea
              className={styles.sideNoteInput}
              placeholder="¿Qué pasó hoy en la arena?"
              value={noteText}
              onChange={e => {
                setNoteText(e.target.value)
                setTouchedFields(p => ({ ...p, note: true }))
              }}
              rows={3}
            />


            {savedMsg && (
              <div className={`${styles.savedMsg} ${styles[savedMsg.type]}`}>
                {savedMsg.text}
              </div>
            )}

            <button
              className={styles.saveBtn}
              onClick={handleSaveSession}
              disabled={saving || !hoursToday}>
              {saving ? 'Guardando...' : 'Guardar sesión ↗'}
            </button>
            {/* <div className={styles.xpHint}>⭐ +10 XP por registrar sesión </div> */}
          </div>

          {/* Próximo hito */}
          {currentStage < 5 && (
            <div className={styles.sideCard}>
              <h4 className={styles.sideCardTitle}>PRÓXIMO HITO</h4>
              <div className={styles.nextStage}>
                <span className={styles.nextStageIcon}>
                  {(() => { const Icon = JOURNEY_STAGES[currentStage + 1].icon; return <Icon size={32} strokeWidth={1.5} /> })()}
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
      {showAbandonModal && (
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
                  onClick={() => setAbandonReason(r)}>
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
                }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )
      }

      {showGameView && (
        <GameView
          game={game}
          mode={game.status === 'completed' ? 'hall_of_fame'
            : game.status === 'in_progress' ? 'in_progress'
              : 'library'}
          onClose={() => setShowGameView(false)}
          onBack={() => setShowGameView(false)}
          onEdit={(g) => { onEdit(g); setShowGameView(false) }}
          onDelete={(g) => { onDelete(g); setShowGameView(false) }}
          onAction={() => setShowGameView(false)}/>
      )}
    </div>
  )
}