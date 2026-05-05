# Game Vault — Contexto del Proyecto

## ¿Qué es Game Vault?
App web personal para gestionar la biblioteca de videojuegos de un gamer
apasionado. Resuelve dos problemas concretos:
1. No saber qué jugar después
2. No tener registro de qué juegos ya jugó y cuándo

## Los 3 estados de un juego

### 📚 Biblioteca (Por jugar)
- Juegos que el usuario quiere jugar y no ha jugado aún
- El usuario la arma manualmente
- De aquí sale el juego aleatorio

### 🎮 En Progreso
- Juego actualmente siendo jugado
- Sale de la biblioteca cuando el botón aleatorio lo selecciona
- Máximo 3 juegos en progreso simultáneamente

### 🏆 Salón de la Fama (Jugados)
- Juegos completados
- Guarda: fecha de inicio, fecha de fin, si fue primera vez o rejugado
- Desde aquí se puede devolver un juego a la biblioteca para rejugarlo

## Flujo principal
Biblioteca → [botón aleatorio] → En Progreso → [marcar completado]
→ Salón de la Fama → [opcional: devolver a biblioteca para rejugar]

## Stack
- React + Vite
- JavaScript (sin TypeScript)
- CSS con variables (sin librería de estilos)
- React Router v6 — rutas: /, /biblioteca, /en-progreso, /salon
- Git para control de versiones
- localStorage para persistencia
- IGDB API para carátulas
- Recharts para gráfica dona
- Base de datos: Supabase (próximo paso)

## Tipografía
- Lora (serif) — títulos grandes, hero, nombres de sagas, tarjetas
- Inter (sans-serif) — cuerpo, nav, UI general
- Space Mono (monospace) — datos, años, badges, códigos

## Estado actual del proyecto

### Layout y navegación
- AppHeader fijo con nav React Router — igual en TODAS las vistas (sin modo slim)
- El header siempre muestra: logo + nav completa + GlobalSearch + campana + perfil
- React Router con rutas: / | /biblioteca | /en-progreso | /salon
- Layout dashboard: header + main + sidebar derecho
- Vistas con sidebar izquierdo: Biblioteca, En Progreso, Salón de la Fama, SagaView
- Sidebar izquierdo: 260px de ancho, sticky con top: 64px, sin logo propio
- AppSidebar.jsx eliminado — cada vista tiene su propio sidebar integrado
- Lucide React para iconos

### Vista Inicio (Dashboard /)
- Hero con vault-logo.png, bienvenida y 3 KPIs
- Sección Tu Progreso — scroll horizontal con barras de progreso
- Sección Biblioteca — scroll horizontal (LibraryScroll)
  - Click en saga → navega a /biblioteca y abre SagaView
  - Click en juego → abre GameModal en modo library
  - SagaCover: rotación automática de carátulas de entries
- Sidebar derecho: donut Recharts, RandomCard, actividad reciente
- Footer completo

### Vista Biblioteca (/biblioteca)
- Sidebar izquierdo: nav + géneros dinámicos (reemplaza listas estáticas)
- Tabs principales: Todos | Sagas | Juego individual
- Stats banner con ícono redondo y barras de géneros (nombre arriba, barra abajo)
- Grid 6 columnas con SagaCover rotando en sagas
- GameModal al click en juego individual
- SagaView al click en saga
- FAB "+ Agregar juego"
- Filtro de géneros en sidebar izquierdo

### SagaView (dentro de /biblioteca)
- Layout 3 columnas: sidebar izq + contenido + sidebar der
- Hero con imagen rotando entre covers de entries (fade)
- Degradado izquierda→derecha sobre la imagen
- Progreso de saga con barra y stats
- Lista de entries con cover, estado, fechas
- Botón "+ Agregar título" → abre AddGameModal con saga preseleccionada
- Sidebar derecho: info saga, orden recomendado, logros, gestionar

### Vista En Progreso (/en-progreso)
- Layout 3 columnas: sidebar izq + contenido + sidebar der
- Sidebar: nav + stats (slots usados 0/3) + dado random
- Stats banner con barras de progreso por juego
- Lista de juegos con cover, progreso y botón continuar
- Modal con sesión, progreso y botón completar

### Vista Salón de la Fama (/salon)
- Layout 3 columnas: sidebar izq + grid + sidebar der
- Cards con ribbon "COMPLETADO" diagonal
- Sidebar derecho: resumen logros, último completado, logros recientes
- "Cargar más" paginado

### Modales
- GameModal unificado con 3 modos: library | in_progress | hall_of_fame
- Se abre desde las vistas Y desde GlobalSearch (usando createPortal)
- Paleta del proyecto (variables CSS, sin colores hardcodeados)
- AddGameModal rediseñado:
  - Paso 1: búsqueda IGDB
  - Paso 2: formulario con tipo (individual / parte de saga)
  - Si es de saga: dropdown de sagas existentes + botón "+ Nueva" inline
  - CreateSagaInline: formulario dentro del modal sin salir
  - defaultSagaId para abrir preseleccionando una saga (usado en SagaView)

### Búsqueda global (GlobalSearch)
- Componente en src/components/layout/GlobalSearch.jsx + GlobalSearch.module.css
- Reemplaza el buscador simple del AppHeader
- Panel desplegable debajo del input con resultados agrupados por estado
- Muestra: cover + nombre + badge de color por estado
- Al hacer click abre GameModal con el modo correcto via createPortal
- Ctrl+K para abrir, Escape para cerrar
- Busca en: libraryGames, inProgressGames, completedGames, saga entries
- AppHeader recibe props: libraryGames, inProgressGames, completedGames, sagas

### Datos y lógica
- useGames.js con todas las funciones de estado
- addEmptySaga() — crea saga sin entries (para flujo inline)
- addEntryToSaga() — ahora guarda el cover de la entry
- Persistencia con localStorage
- IGDB API para búsqueda y carátulas
- getCover() — función utilitaria en src/utils/gameUtils.js
  - Normaliza URLs de IGDB que empiezan con //
  - Usada en todas las vistas y GlobalSearch (reemplaza funciones locales duplicadas)

## Estructura de carpetas
src/
├── components/
│   ├── ui/           # RandomButton, SuggestedGameModal...
│   └── layout/       # AppHeader, Header.module.css, GlobalSearch, GlobalSearch.module.css, Footer
├── features/
│   ├── games/
│   │   ├── components/  # GameCard, GameModal, AddGameModal, LibraryScroll...
│   │   ├── hooks/       # useGames.js
│   │   ├── services/    # igdbService.js
│   │   └── views/       # LibraryView, SagaView, InProgressView, HallOfFameView
│   └── filters/
│       ├── components/  # FilterBar
│       └── hooks/       # useFilters.js
├── utils/            # gameUtils.js (getCover)
├── data/             # games.json (temporal)
├── styles/           # globals.css, tokens.css, App.module.css
└── assets/           # vault-logo.png

## Decisiones de diseño
- Paleta oscura con acentos: cian (#00d4ff), naranja (#ff6b35), violeta (#a855f7), dorado (#fbbf24)
- Sin librerías de estilos — CSS Modules + variables en tokens.css
- Scroll horizontal estilo Netflix en dashboard
- Sidebar izquierdo sticky en vistas principales (top: 64px, sin logo)
- Géneros como filtros dinámicos (se generan desde los datos)
- Header idéntico en todas las vistas — sin modo slim

## Refactorizaciones pendientes
- Extraer SagaCover a componente reutilizable (actualmente en LibraryView.jsx)
- Crear AppSidebar reutilizable (sidebar izq se repite en las 3 vistas con variaciones)
- Centralizar CSS del sidebar (estilos duplicados en los 3 module.css de vistas)

## Próximos pasos
- Supabase como base de datos real
- Completar acciones del GameModal (delete, edit desde modal)
- Vista estadísticas completas
- Horas jugadas reales