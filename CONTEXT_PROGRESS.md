# GAME_QUEST — Context para continuar desarrollo

## Stack
- React + Vite + JavaScript (sin TypeScript)
- CSS Modules con variables CSS
- React Router v6
- Supabase (PostgreSQL + Auth + Edge Functions)
- IGDB via Netlify Functions para metadatos y duración
- Recharts para gráficos

---

## Estructura de carpetas relevante
```
src/features/games/
├── views/
│   ├── GameProgressView.jsx        ← Router de modos (linear/infinite/competitive)
│   ├── LinearProgressView.jsx      ← Modo historia (completo)
│   ├── OpenWorldProgressView.jsx   ← Modo infinite + competitive (completo)
│   ├── InProgressView.jsx          ← Lista de juegos en progreso
│   ├── LibraryView.jsx
│   ├── HallOfFameView.jsx
│   └── ProfileView.jsx
├── components/
│   ├── EmotionalProgress.jsx       ← Componente compartido (gráfico emocional)
│   ├── AddGameModal.jsx
│   └── GameView.jsx
├── hooks/
│   └── useGameSupabase.js          ← Hook principal de datos
└── services/
    ├── igdbService.js
    └── hltbService.js              ← Solo exporta detectProgressMode()
```

---

## Tablas Supabase

### `games` — catálogo global
id, slug, title, developer, release_year, cover_url, description,
genres text[], platforms text[], tags text[], game_modes text[],
igdb_id, created_at,
hltb_main int, hltb_main_extra int, hltb_completionist int,
hltb_source text, progress_mode text, screenshots text[]

### `library_entries` — biblioteca del usuario
id, user_id, game_id, saga_id, status, created_at, updated_at,
total_hours numeric, story_pct numeric, hltb_pct numeric,
hltb_reference text, journey_stage int,
current_boss text, current_zone text, current_feeling text,
user_rating int, current_streak int, last_session_date date,
abandon_reason text, dlc_mode bool, dlc_hours_buffer numeric, dlc_name text

**Status válidos:** library | in_progress | paused | abandoned | completed | completed_dlc | backlog

### `play_sessions` — sesiones de juego
id, library_entry_id, user_id, start_date date, end_date date,
is_first_time bool, created_at,
duration_hours numeric, story_advance numeric,
global_tags text[], custom_tags text[],
feeling text, session_rating int

### `game_notes` — bitácora
id, user_id, library_entry_id, session_id,
content text, is_legendary bool, created_at

### `progress_achievements` — logros por juego
id, user_id, library_entry_id, achievement_id text,
unlocked_at, pct_at_unlock numeric

### `user_achievements` — logros globales
id, user_id, achievement_id text, unlocked_at

### `profiles` — usuarios
id, username, avatar_url, full_name, created_at,
total_xp int, level int

### `sagas`
id, slug, title, cover_url, user_id, created_at

---

## Duración de juegos
- Viene de IGDB endpoint `/game_time_to_beats` (segunda llamada en Netlify Function `igdb.js`)
- Mapeo: `hastily` → hltb_main, `normally` → hltb_main_extra, `completely` → hltb_completionist
- Si IGDB no trae datos → campos manuales en AddGameModal + enlace a HowLongToBeat

---

## progress_mode
Se asigna automáticamente en el cliente via `detectProgressMode()` en `hltbService.js`:
- `competitive` → si game_modes incluye battle royale/mmo
- `infinite` → si no tiene time_to_beat Y género es simulador/estrategia
- `linear` → por defecto

---

## Navegación de progreso
- `/en-progreso` → InProgressView (lista)
- `/en-progreso/:id` → GameProgressView (router) → LinearProgressView | OpenWorldProgressView

---

## Lo que está COMPLETO

### LinearProgressView (modo historia)
- Header con hero (screenshot IGDB como fondo blur)
- Selector de referencia HLTB (main/extra/completionist)
- Barra de progreso "Tu viaje" (subjetiva, slider) + barra HLTB (calculada)
- Overtime: >100% barra dorada con mensaje épico
- Estadísticas: tiempo total, racha, última sesión, alerta abandono, progreso emocional
- Etapas del viaje: 6 nodos clickeables (Inicio → Final épico)
- Logros PA01-PA05 (se desbloquean por %)
- Bitácora con notas + logro "El Cronista" (UA01, 10 notas)
- Tags de sesión (12 globales + custom text[])
- Calificación 1-10 + estado emocional por sesión
- Historial de sesiones con fecha, horas, feeling, tags, rating
- Progreso emocional: gráfico de línea + distribución %
- Sistema XP: +10 sesión, +5 nota, +15 rating/feeling, +20 logro, +50 completar
- Botón pausar → status: paused
- Modal abandonar con razón → status: abandoned | paused
- CTA completar al 90%+ → status: completed, navega a /salon

### OpenWorldProgressView (infinite + competitive)
- Mismo header con hero
- Métricas de identidad: tiempo total, sesiones, racha, meses activo
- Muro de actividad (últimas 12 semanas, estilo GitHub)
- Estadísticas narrativas: actividad semanal, reino viviente, racha, última sesión, obsesión
- Logros de identidad/competitivos (diferentes por modo via prop `achievements`)
- Progreso emocional (componente compartido EmotionalProgress)
- Historial de sesiones
- Bitácora
- Sidebar: XP, registro de sesión, tags, feelings
- Modal abandono
- Sin barras de progreso ni HLTB

### AddGameModal
- Búsqueda IGDB con autocompletado
- Duración prellenada desde IGDB o campos manuales
- progress_mode asignado automáticamente con override manual

### EmotionalProgress.jsx (componente compartido)
- Gráfico de línea recharts de sentimientos en el tiempo
- Distribución porcentual de emociones
- Estado emocional actual

---

## Lo que falta hacer (próximo chat)

### PRIORIDAD ALTA

**1. InProgressView — fixes**
- Filtrar solo `status === 'in_progress'` (pausados y abandonados no deben aparecer)
- Mostrar métricas reales: `total_hours` y `current_streak` desde `library_entries`
- Actualmente muestra `—` en tiempo jugado y racha

**2. ProfileView — conectar datos reales**
- Mostrar `total_xp` y `level` desde `profiles`
- Mostrar logros desbloqueados desde `user_achievements`
- Estadísticas globales: juegos completados, horas totales, racha máxima

**3. HallOfFameView — conectar datos reales**
- Mostrar juegos con `status === 'completed'`
- Mostrar fecha de completado, horas totales, calificación del usuario

### PRIORIDAD MEDIA

**4. Fix orden biblioteca**
- Los juegos recién agregados quedan al final hasta hacer refresh
- El optimistic update necesita `created_at` provisional
- Agregar `.order('created_at', { ascending: false })` en fetchAll

**5. Velocidad addSingleGame**
- Hace 3-4 llamadas secuenciales a Supabase
- Se puede optimizar con upsert y reducir roundtrips

**6. GameView — ajustar para library y hall of fame**
- Actualmente in_progress abre GameProgressView (correcto)
- Library y hall of fame siguen abriendo GameView (está bien, revisar que funcione)

### PRIORIDAD BAJA (post-MVP)

**7. Ajuste de estilos generales**
- LinearProgressView: header muy compacto, stats pequeñas
- OpenWorldProgressView: muro de actividad y stats narrativas
- InProgressView: cards de juego en progreso

**8. Momentos Legendarios** (FASE 6 — post MVP)
- `is_legendary bool` en game_notes
- Muro de gloria en ProfileView

---

## XP y niveles
- XP global en `profiles.total_xp`
- Nivel = Math.floor(total_xp / 500) + 1
- Acciones: +10 sesión, +5 nota, +15 rating/feeling, +20 logro PA/IA/CA, +50 completar juego

## Logros globales implementados
- UA01 "El Cronista" — 10 notas en cualquier juego

## Logros por juego
- PA01-PA05 — Linear (por % de historia)
- IA01-IA05 — Infinite (por horas/sesiones/meses)
- CA01-CA05 — Competitive (por horas/rachas/sesiones)

*Actualizado: Mayo 2026*