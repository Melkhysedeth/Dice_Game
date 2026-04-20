# Game Vault — Contexto del Proyecto

## Stack
- React + Vite
- JavaScript (sin TypeScript)
- CSS con variables (sin librería de estilos)
- Git para control de versiones

## Perfil del desarrollador
- Principiante que aprende mientras construye
- Entiende: variables, if/else, funciones básicas en JS
- Objetivo: entender lo que construye, no solo copiar código

## Estado actual
- Proyecto creado con Vite
- Estructura de carpetas definida y creada
- Estilos movidos a src/styles/
- Primer commit realizado

## Estructura de carpetas
src/
├── components/
│   ├── ui/          # Button, Badge, Modal...
│   └── layout/      # Header...
├── features/
│   ├── games/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── filters/
│       ├── components/
│       └── hooks/
├── data/            # games.json (temporal hasta tener DB)
├── hooks/           # Hooks globales
├── styles/          # globals.css, tokens.css, App.css
└── utils/           # Funciones helpers

## Decisiones tomadas
- `features/` agrupa por dominio, no por tipo de archivo
- `services/` abstrae el acceso a datos para facilitar migración a DB
- `data/games.json` es temporal, se reemplaza por DB en el futuro

## Próximo paso
Crear src/styles/tokens.css con las variables de diseño del Game Vault