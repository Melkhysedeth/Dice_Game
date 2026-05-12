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
- mejoras GameView y flujo de datos IGDB
- fix: GameView ahora lee genres/genre y platforms/platform (ambos formatos)
- fix: addSingleGame guarda summary, genres y platforms correctamente
- fix: addEntryToSaga guarda developer, summary, genres, platforms y rating
- fix: getAllEntries normaliza genres/platforms para singles y saga entries
- fix: handleSubmit cierra modal correctamente al agregar juego
- fix: onAddToSaga pasa todos los campos (developer, summary, genres, platforms)
- feat: PlatIcon usa react-icons/fa (FaPlaystation, FaXbox, FaWindows, etc)
- feat: plataformas en grid 2 columnas con max 3 filas
- feat: backBtn rediseñado con blur y hover animado
- feat: hero height aumentado a 420px
- fix: heroContent padding-top ajustado para navbar fijo de 64px
- fix: SagaView abre GameView inline con datos enriquecidos de la saga
- fix: selectedEntry enriquecido con genres/platforms/summary antes de abrir GameView
- feat: StartView rediseño pantalla de bienvenida pre-login
- feat: modal de login actualizado"

### Layout y navegación
- AppHeader fijo — igual en TODAS las vistas (sin modo slim)
- Header muestra: logo + nav completa + GlobalSearch + campana + perfil
- Logo "Vault" cambia de color según la ruta activa (cian/naranja/verde/dorado)
- Nav items con icono de color activo y subrayado del color de la sección
- React Router con rutas: / | /biblioteca | /en-progreso | /salon
- Sidebar izquierdo: AppSidebar reutilizable, 260px, sticky top: 64px
- AppSidebar acepta props: activeRoute, libraryCount, inProgressCount, completedCount, onRandomGame, widget, genreProps
- widget='random' (dado violeta) para Biblioteca/En Progreso, widget='motivation' (trofeo dorado) para Salón
- genreProps pasa datos de géneros solo a Biblioteca (dropdown desplegable)
- Lucide React para todos los iconos en toda la app

### Vista Inicio (Dashboard /)
- Hero con vault-logo.png, bienvenida y 3 KPIs (con padding-top y gap ajustados)
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
- Stats banner: barras de géneros top 4, borde de color dinámico por género, box-shadow con profundidad
- Grid unificado ordenado por fecha de agregado (timestamp en el id) — sagas y singles mezclados, más reciente primero
- Sagas identificadas con halo morado permanente y punto morado en badge
- Menú ⋮ en cada card: dropdown con Comenzar a jugar | Editar | Eliminar
- Corazón ♡/♥ toggle favoritos (local, sin persistencia aún)
- GameModal al click en juego individual
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

### Modales
- GameModal unificado con 3 modos: library | in_progress | hall_of_fame
- Se abre desde las vistas Y desde GlobalSearch (usando createPortal)
- Paleta del proyecto (variables CSS, sin colores hardcodeados)
- AddGameModal:
  - Paso 1: búsqueda IGDB
  - Paso 2: formulario con tipo (individual / parte de saga)
  - Si es de saga: dropdown de sagas existentes + botón "+ Nueva" inline
  - CreateSagaInline: formulario dentro del modal sin salir
  - defaultSagaId para abrir preseleccionando una saga

### Búsqueda global (GlobalSearch)
- src/components/layout/GlobalSearch.jsx + GlobalSearch.module.css
- Panel desplegable debajo del input, ancho flexible (flex: 1)
- Resultados agrupados por estado con iconos Lucide (LayoutGrid, Gamepad2, Trophy)
- Badge = círculo de color (sin texto)
- Título de resultado en font-body sin negrita
- Al click abre GameModal con modo correcto via createPortal
- Ctrl+K para abrir, Escape para cerrar

### Footer
- Iconos Lucide React en todas las listas
- Columnas centradas con justify-items: center, max-width: 1440px
- Texto 14px items, 15px títulos
- Sección dado: caja violeta, glow pulsante, dado animado, botón con sombra intensa

### Datos y lógica
- useGames.js con todas las funciones de estado
- addEmptySaga(), addEntryToSaga() — guardan cover de la entry
- Persistencia con localStorage
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
│   │   └── views/       # GameView, StartView, HomeView, LibraryView, SagaView, InProgressView, HallOfFameView
│   └── filters/
│       ├── components/  # FilterBar
│       └── hooks/       # useFilters.js
├── context/          # SidebarContext.jsx
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
- Logo "Vault" cambia de color por ruta
- Todos los iconos con Lucide React

## Refactorizaciones pendientes
- Extraer SagaCover a componente reutilizable (actualmente en LibraryView.jsx)

## Imágenes de banner para SagaView — PENDIENTE
El hero de SagaView actualmente rota carátulas de IGDB (verticales, se pixelan en el hero).
La solución acordada es la siguiente:

### Flujo de imagen de banner para sagas:
1. **Primero:** Buscar automáticamente en IGDB los `artworks` del juego al crear/editar la saga
   - IGDB tiene endpoint `artworks` con imágenes horizontales de alta resolución
   - Si hay resultados, mostrar un selector para que el usuario elija cuál prefiere
2. **Si no hay artworks en IGDB:** El usuario puede agregar la imagen de dos maneras:
   - **Por URL:** Pegar directamente la URL de una imagen encontrada en internet
   - **Por archivo local:** Subir una imagen desde su dispositivo (guardada en Supabase Storage cuando se migre, o base64 temporal en localStorage)
3. La imagen elegida se guarda en el objeto de la saga como `bannerUrl`
4. SagaView usa `saga.bannerUrl` como fondo del hero — si no existe, cae al comportamiento actual (rotación de carátulas)

### Consideraciones:
- Las imágenes subidas son **por usuario** — cada quien sube la imagen que quiere para su saga
- Con Supabase Storage (plan gratuito 1GB) es más que suficiente para una app personal
- No se usa Cloudinary para evitar preocupaciones de créditos
- La URL externa (opción 2a) no consume storage ni créditos — es la opción más liviana
- Implementar cuando se conecte Supabase para usar Supabase Storage como destino del upload

## Próximos pasos
- Supabase como base de datos real
- Imágenes de banner para SagaView (ver sección arriba)
- Completar acciones del GameModal (delete, edit desde modal)
- Vista estadísticas completas
- Horas jugadas reales