# Game Quest — Contexto del Proyecto

## ¿Qué es Game Quest?
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
- Se almacenan estadisticas propias de cada jugador

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
- React Router v6 — rutas: /, Home, /biblioteca, /en-progreso, /salon
- Git para control de versiones
- Base de datos en Supabase
- IGDB API para carátulas
- Recharts para gráfica dona

## Tipografía
- Changa StyleSheet — títulos grandes, hero, nombres de sagas, tarjetas
- Play StyleSheet — cuerpo, nav, UI general
- Inter StyleSheet — datos, años, badges, códigos

## Estado actual del proyecto
- Base de datos con Supabase funcional
- API IGDB Funcional
- Todas las vistas Funcional
- Inicios de Sesion funcional 
- Modales e Inlines de games funcionales

### Layout y navegación
- AppHeader fijo — igual en TODAS las vistas (sin modo slim)
- Header muestra: logo + nav completa + GlobalSearch + campana + perfil
- Logo "Quest" cambia de color según la ruta activa (cian/naranja/verde/dorado)
- Nav items con icono de color activo y subrayado del color de la sección
- React Router con rutas: / | /Home | /biblioteca | /en-progreso | /salon
- Sidebar izquierdo: AppSidebar reutilizable, 260px, sticky top: 64px con 3 estados (Expanded(default) Collapsed y Hover)
- AppSidebar acepta props: activeRoute, libraryCount, inProgressCount, completedCount, onRandomGame, widget, genreProps
- widget='random' (dado violeta) para /En Progreso, widget='motivation' (trofeo dorado) para Salón
- genreProps pasa datos de géneros solo a Biblioteca (dropdown desplegable)
- Lucide React-Icons para todos los iconos en toda la app

### Vista Inicio (Dashboard /)
- Hero toda la pantalla con imagenes parallax y widget de generar aventura y Next_Pick
- Tarjetas de juegos de acuerdo a generos
- Sección Tu Progreso — scroll horizontal con barras de progreso
- Sección Biblioteca — scroll horizontal (LibraryScroll)
  - Click en saga → navega a /biblioteca y abre SagaView
  - Click en juego → abre GameModal en modo library
  - SagaCover: rotación automática de carátulas de entries
- Sidebar derecho: donut Recharts, RandomCard, actividad reciente
- Footer completo con iconos Lucide React

### Vista Biblioteca (/biblioteca)
- Sidebar izquierdo: AppSidebar con genreProps (dropdown de géneros desplegable)
- Tabs principales: Todos | Sagas | Juego individual
- Hero con imagen, boton de generar aventura al azar y leyeda con la cantidad de juegos que estan disponibles para jugar
- Stats banner: barras de géneros top 5, borde de color dinámico por género, box-shadow con profundidad
- Grid unificado ordenado por fecha de agregado (timestamp en el id) — sagas y singles mezclados, más reciente primero
- Sagas identificadas con halo morado permanente y punto morado en badge
- Menú ⋮ en cada card: dropdown con Comenzar a jugar | Editar | Eliminar
- Corazón ♡/♥ toggle favoritos (local, sin persistencia aún)
- GameView al click en juego individual
- SagaView al click en saga
- FAB "+ Agregar juego"

### SagaView (dentro de /biblioteca)
- Layout 3 columnas: sidebar izq + contenido + sidebar der
- Hero con imagen rotando entre covers (fade) — min-height aumentado
- Botón "Volver a Biblioteca" con padding-top en heroContent para no cortarse
- Descripción con white-space: nowrap para no saltar de línea
- Lista de entries: cada entry es card independiente con border y border-radius
- Halo de color al hover según estado: cian (library), naranja (in_progress), dorado (completed)
- Clases: entryRowLibrary, entryRowInProgress, entryRowCompleted

### Vista En Progreso (/en-progreso)
- Layout 3 columnas: 260px + 1fr + 320px
- Sidebar izq: AppSidebar widget='random'
- Lista de juegos con grid-template-columns ajustado
- rowActions: flex-direction column, align-items flex-end, justify-content space-between, padding 12px 16px
- Sidebar derecho 320px con padding var(--space-lg)

### Vista Salón de la Fama (/salon)
- Layout 3 columnas: sidebar izq + grid + sidebar der
- Cards con ribbon "COMPLETADO" diagonal dorado (top/right ajustados para centrar)
- Cards con halo dorado permanente y más intenso en hover
- Sidebar derecho:
  - Donut CSS conic-gradient color dorado (state-fame), anillo delgado
  - Número de juegos + label "juegos" dentro del donut
  - Stats con iconos Lucide: Clock, Trophy, Flame, Star
  - Último completado con cover + info
  - Logros recientes con iconos Lucide: Medal, Crown, Gem (colores dorado/violeta/cian)
- "Cargar más" paginado

### Búsqueda global (GlobalSearch)
- src/components/layout/GlobalSearch.jsx + GlobalSearch.module.css
- Panel desplegable debajo del input, ancho flexible (flex: 1)
- Resultados agrupados por estado con iconos Lucide (LayoutGrid, Gamepad2, Trophy)
- Badge = círculo de color (sin texto)
- Título de resultado en font-body sin negrita
- Al click abre GameView con via createPortal
- Ctrl+K para abrir, Escape para cerrar

### Footer
- Iconos Lucide React en todas las listas
- Texto 14px items, 15px títulos


### Datos y lógica
- useGamesSupabase.js con todas las funciones de estado y llamados a la BD
- addEmptySaga(), addEntryToSaga() — guardan cover de la entry
- Persistencia con Supabase
- IGDB API para búsqueda y carátulas
- getCover() — src/utils/gameUtils.js, normaliza URLs IGDB (//)

## Estructura de carpetas
src/
├── components/
│   ├── ui/           # RandomButton, SuggestedGameModal, LoginModal (con sus CSS)
│   └── layout/       # AppHeader, Header.module.css, GlobalSearch, GlobalSearch.module.css,
│                     # Footer, Footer.module.css, AppSidebar, AppSidebar.module.css
├── features/
│   ├── games/
│   │   ├── components/  # GameCard, AddGameModal, LibraryScroll, (pendiente extracción)
│   │   ├── hooks/       # useGames.js, useGameSupabase.js
│   │   ├── services/    # gameService.js, igdbService.js
│   │   └── views/       # GameView, StartView, HomeView, LibraryView, SagaView, InProgressView, HallOfFameView, ProfileView
│   ├── sagas/
│   └── filters/
│       ├── components/  # FilterBar
│       └── hooks/       # useFilters.js
├── context/          # SidebarContext.jsx AuthContext.jsx
├── utils/            # gameUtils.js (getCover), migrateToSupabase.js
├── data/             # games.json (temporal)
├── styles/           # globals.css, tokens.css, App.module.css
├── assets/           # vault-logo.png
└── lib/              # supabase.js, useAuth.js

## Decisiones de diseño
- Paleta oscura: cian (#00d4ff), naranja (#ff6b35), violeta (#a855f7), dorado (#fbbf24)
- Sin librerías de estilos — CSS Modules + variables en tokens.css
- Scroll horizontal estilo Netflix en dashboard
- Sidebar izquierdo sticky (top: 64px, sin logo)
- Géneros dinámicos desde los datos
- Header idéntico en todas las vistas
- Logo "Quest" cambia de color por ruta
- Todos los iconos con Lucide React

## Próximos pasos
- Vista estadísticas completas
- Horas jugadas reales