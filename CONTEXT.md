# Game Vault — Contexto del Proyecto

## ¿Qué es Game Vault?
App web personal para gestionar la biblioteca de videojuegos de un gamer
apasionado. Resuelve dos problemas concretos:
1. No saber qué jugar después
2. No tener registro de qué juegos ya jugó y cuándo

La app recomienda un juego al azar de la biblioteca y lleva el historial
completo de partidas.

## Los 3 estados de un juego

### 📚 Biblioteca (Por jugar)
- Juegos que el usuario quiere jugar y no ha jugado aún
- El usuario la arma manualmente
- De aquí sale el juego aleatorio

### 🎮 En Progreso
- Juego actualmente siendo jugado
- Sale de la biblioteca cuando el botón aleatorio lo selecciona
- Solo puede haber un juego en progreso a la vez (a definir)

### 🏆 Salón de la Fama (Jugados)
- Juegos completados
- Guarda: fecha de inicio, fecha de fin, si fue primera vez o rejugado
- Desde aquí se puede devolver un juego a la biblioteca para rejugarlo
- Al devolverlo a la biblioteca puede volver a salir en el aleatorio

## Restrcciones
- Máximo 3 juegos en progreso simultáneamente 
- Inicialmente solo PC. Versión móvil (app) queda para el futuro 

## Flujo principal
Biblioteca → [botón aleatorio] → En Progreso → [marcar completado]
→ Salón de la Fama → [opcional: devolver a biblioteca para rejugar]

## Datos de cada juego
- Nombre
- Saga (si pertenece a una)
- Desarrolladora
- Año de lanzamiento
- Género / Categoría
- Es saga: sí/no
- Si es saga: lista de entregas con sus años
- Estado: biblioteca | en_progreso | completado
- Historial de partidas:
  - Fecha de inicio
  - Fecha de fin
  - Primera vez o rejugado

## Stack
- React + Vite
- JavaScript (sin TypeScript)
- CSS con variables (sin librería de estilos)
- Git para control de versiones
- Base de datos: por definir (Supabase o Firebase en el futuro)
- Por ahora: datos en JSON local

## Perfil del desarrollador
- Principiante que aprende mientras construye
- Entiende: variables, if/else, funciones básicas en JS
- Objetivo: entender lo que construye, no solo copiar código
- Sistema operativo: Windows

## Estado actual del proyecto
- Proyecto creado con Vite
- Estructura de carpetas definida y creada
- tokens.css con variables de diseño completas
- globals.css con reset CSS y estilos base
- Header.jsx con tipografía Bebas Neue, tagline y stats
- games.json con estructura de datos definida
- gameService.js con funciones de acceso a datos
- useGames.js con lógica completa de estados
- GameCard.jsx con hover overlay y muesca diagonal
- SagaCard.jsx con modal expandido y botón JUGAR funcional
- GameGrid.jsx organizando sagas y singles
- InProgressCard.jsx y InProgressSection.jsx
- HallOfFameCard.jsx y HallOfFameSection.jsx
- RandomButton.jsx estilo pill naranja centrado
- SuggestedGameModal.jsx completo
- FilterBar.jsx con filtros Todos/Sagas/Juego único y búsqueda en tiempo real
- useFilters.js hook con lógica de filtrado y búsqueda
- AddGameModal.jsx con formulario inteligente
  (individual / saga existente / saga nueva)
- useGames.js con addSingleGame, addEntryToSaga, addNewSaga
- Botón + AGREGAR JUEGO en sección Biblioteca
- Editar singles, sagas y entregas de saga
- Eliminar singles, sagas completas y entregas individuales
- AddGameModal reutilizado para modo agregar y modo editar
- Todas las tarjetas rediseñadas — solo carátula + título
- Click en tarjeta abre modal con info completa + botones
- GameCard, SagaCard, InProgressCard, HallOfFameCard rediseñadas
- Fuente Quantico en tarjetas
- Esquinas redondeadas en todas las tarjetas
- Editar y eliminar juegos, sagas y entregas
- Persistencia con localStorage
- FilterBar con filtros y búsqueda
- AddGameModal para agregar y editar
- Carátulas de juegos via IGDB API
- Nuevo layout dashboard completo con grid main + sidebar
- AppHeader fijo con nav (Inicio/Biblioteca/En progreso/Salón de la fama), buscador y perfil
- Hero con vault-logo.png, bienvenida y 3 KPIs rectangulares
- InProgressSection con scroll horizontal estilo Netflix, barras de progreso y flechas
- LibraryScroll — nuevo componente solo para dashboard (sin filtros ni botón agregar)
- Sidebar: donut Recharts real, RandomCard púrpura con dado animado y anillos, actividad reciente
- App.module.css limpio sin duplicados
- Salón de la Fama removido del dashboard (queda para vista propia)
- FilterBar y botón agregar juego reservados para vista completa de Biblioteca
- Se agrega el footer al diseño (hay que hacer algunas correcciones y conectar con datos reales)
- React Router configurado — SPA con rutas / y /biblioteca
- LibraryView completa: sidebar izquierdo, filtros por género (pills),
  stats banner con barras, grid de cards con menú y favorito, FAB flotante
- AddGameModal rediseñado: layout 2 columnas, drag & drop de imagen,
  búsqueda IGDB, géneros como pills, footer con cancelar/agregar
- SuggestedGameModal rediseñado: confetti, dado animado, carátula con
  glow púrpura, info en grid, quote aleatoria, footer con 2 botones
- Footer completo: 4 columnas + dado random + bottom bar con redes sociales

## Estructura de carpetas
src/
├── components/
│   ├── ui/           # Button, Badge, Modal...
│   └── layout/       # Header...
├── features/
│   ├── games/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── filters/
│       ├── components/
│       └── hooks/
├── data/             # games.json (temporal hasta tener DB)
├── hooks/            # Hooks globales
├── styles/           # globals.css, tokens.css, App.css
└── utils/            # Funciones helpers
## Decisiones tomadas
- `features/` agrupa por dominio, no por tipo de archivo
- `services/` abstrae acceso a datos para facilitar migración a DB
- `data/games.json` es temporal, se reemplaza por DB en el futuro
- Un solo juego en progreso a la vez (pendiente confirmar)

## Próximo paso
- Supabase como base de datos real
Referencia visual: imagen adjunta en conversación
Estructura nueva:
- Header fijo con nav, buscador y perfil
- Hero con bienvenida + KPIs
- Dashboard lateral con gráfico dona (recharts instalado)
- Sección Tu Progreso — scroll horizontal
- Sección Biblioteca — scroll horizontal estilo Netflix
- Botón Juego al Azar destacado
- Actividad reciente
- Micro-interacciones en todo

## Decisiones de diseño
- Vista En Progreso (/en-progreso)
- Vista Salón de la Fama (/salon-de-la-fama)
- Conectar nav del sidebar de LibraryView con las rutas
- Paginación en Biblioteca
- Supabase como base de datos real