# CLAUDE.md — Project Guide

## Overview

2D Crawler is a browser-based 2D game using **PixiJS 8** + **Vite 5** + **plain JavaScript** (ES modules, no TypeScript, no framework).

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Renderer | PixiJS | ^8.2.6 |
| Bundler | Vite | ^5.4.2 |
| Language | JavaScript (ES modules) | — |
| Deploy | GitHub Actions → GitHub Pages | — |
| Runtime | Node.js 20 (for dev/build) | — |

## Commands

- `npm run dev` — Start dev server (http://localhost:5173/)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

## File Map

```
2D-Crawler-/
├── index.html              # Entry HTML — mounts canvas into <div id="app">
├── package.json            # Dependencies: pixi.js, vite
├── vite.config.js          # Sets base path to /2D-Crawler-/ for GitHub Pages
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI: npm ci → vite build → deploy dist/ to Pages
├── src/
│   ├── main.js             # Entry point — calls bootstrapGame()
│   ├── game.js             # Creates PixiJS Application, mounts canvas, starts game loop
│   ├── entities/
│   │   └── Player.js       # Player class — Graphics circle, x/y getters/setters
│   ├── scenes/
│   │   └── GameScene.js    # Scene lifecycle — init(), update(), destroy()
│   ├── systems/
│   │   └── movement.js     # Input state + physics (pure functions)
│   └── utils/
│       └── constants.js    # All shared numeric constants
└── assets/
    ├── sprites/            # (empty, placeholder for future sprites)
    └── sounds/             # (empty, placeholder for future audio)
```

## Architecture

The game uses a **scene / entity / system** pattern:

### Bootstrap flow
`index.html` → `src/main.js` → `bootstrapGame()` in `src/game.js`:
1. Creates a `new Application()` with dimensions from constants, antialiased, resized to window
2. Appends the canvas to `#app` (throws if missing)
3. Creates `GameScene`, calls `init()`
4. Starts the ticker loop: converts `deltaMS` to seconds, calls `scene.update(deltaSeconds)`

### Scenes (`src/scenes/`)
- **`GameScene`** — the only scene currently. Owns a `Container`, a `Player`, and a `movementState`.
  - `init()` — adds container to stage, creates player at screen center, attaches keydown/keyup listeners
  - `update(deltaSeconds)` — delegates to `updatePlayerMovement()`
  - `destroy()` — removes keyboard listeners, destroys container and children

### Entities (`src/entities/`)
- **`Player`** — wraps a PixiJS `Graphics` circle. Uses `PLAYER_SPEED`, `PLAYER_RADIUS`, `PLAYER_COLOR` from constants. Exposes `x`/`y` via getters/setters that delegate to `this.view`.

### Systems (`src/systems/`)
- **`movement.js`** — exports two pure functions:
  - `createMovementState()` — returns `{ keys, onKeyDown, onKeyUp }`. Tracks Arrow keys + WASD. Calls `preventDefault()` on game keys.
  - `updatePlayerMovement({ player, movementState, boundsWidth, boundsHeight, deltaSeconds })` — reads key state, normalizes diagonal movement (1/√2), applies velocity, clamps to screen bounds.

### Constants (`src/utils/constants.js`)
Current values:
- `GAME_WIDTH = 960`, `GAME_HEIGHT = 540`
- `BACKGROUND_COLOR = 0x101820` (dark blue-gray)
- `PLAYER_RADIUS = 24`
- `PLAYER_COLOR = 0x3ddc97` (green)
- `PLAYER_SPEED = 260` (pixels per second)

## Current Game State

Right now the game is minimal:
- A single green circle (the player) on a dark background
- Player moves with Arrow keys or WASD at 260 px/s
- Diagonal movement is speed-normalized
- Player is clamped to window bounds
- Canvas auto-resizes to fill the browser window
- No enemies, no items, no levels, no score, no sprites, no audio — just the movement foundation

## Conventions

- **Classes**: PascalCase (`Player`, `GameScene`)
- **Functions/variables**: camelCase (`createMovementState`, `deltaSeconds`)
- **Constants**: SCREAMING_SNAKE_CASE (`GAME_WIDTH`, `PLAYER_SPEED`)
- All new numeric values should go in `constants.js`, not inline
- Movement/physics logic goes in `src/systems/`, not in entities or scenes
- Each scene must implement `init()`, `update(deltaSeconds)`, and `destroy()`
- Keyboard input uses `event.code` (layout-independent), not `event.key`

## Key Config Notes

| File | What to know |
|------|-------------|
| `vite.config.js` | `base: '/2D-Crawler-/'` must match the GitHub repo name for Pages |
| `.github/workflows/deploy.yml` | Triggers on push to `main`, uses `npm ci`, deploys `dist/` |
| `index.html` | Must have `<div id="app">` — game.js throws if missing |

## Adding New Features

- **New entity**: Create class in `src/entities/`, pull constants from `utils/constants.js`
- **New system**: Create in `src/systems/`, export pure functions that take entity + state args
- **New scene**: Create in `src/scenes/`, follow `GameScene` pattern (init/update/destroy)
- **Assets**: Place sprites in `assets/sprites/`, sounds in `assets/sounds/`
- **New constant**: Add to `src/utils/constants.js` with SCREAMING_SNAKE_CASE naming
