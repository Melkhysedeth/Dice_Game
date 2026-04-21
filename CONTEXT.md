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
- Header.jsx con stats reales incluyendo entradas de sagas
- games.json con estructura de datos definida
- gameService.js con funciones de acceso a datos
- useGames.js hook con estado global
- GameCard.jsx con hover overlay
- SagaCard.jsx con modal expandido, blur y lista de entregas
- GameGrid.jsx organizando sagas y singles
- RandomButton.jsx fijo abajo a la derecha con estilos
- SuggestedGameModal.jsx con juego sugerido, tirar de nuevo,
  comenzar a jugar y botón cerrar

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
- Lógica real de "Comenzar a jugar" — mover juego de library a in_progress
- Sección In Progress con sus tarjetas
- Lógica de "Marcar como completado" — mover a completed
- Salón de la Fama
