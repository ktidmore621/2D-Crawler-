# CLAUDE.md — Project Guide

## Overview

2D Crawler is a browser-based 2D game using PixiJS 8 + Vite + plain JavaScript (ES modules, no TypeScript).

## Commands

- `npm run dev` — Start dev server (http://localhost:5173/)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

## Architecture

The game uses a **scene / entity / system** pattern:

- **`src/main.js`** — Entry point, calls `bootstrapGame()`
- **`src/game.js`** — Creates the PixiJS Application, sets up the game loop
- **`src/scenes/GameScene.js`** — Manages scene lifecycle (init, update, destroy). Owns the player and movement state. Call `destroy()` to clean up listeners when swapping scenes.
- **`src/entities/Player.js`** — Player class wrapping a PixiJS Graphics circle. Position managed via getters/setters delegating to `view`.
- **`src/systems/movement.js`** — Pure functions: `createMovementState()` for input tracking, `updatePlayerMovement()` for physics. No side effects beyond mutating passed player position.
- **`src/utils/constants.js`** — All magic numbers live here: `GAME_WIDTH`, `GAME_HEIGHT`, `PLAYER_RADIUS`, `PLAYER_SPEED`, etc.

## Conventions

- **Classes**: PascalCase (`Player`, `GameScene`)
- **Functions/variables**: camelCase (`createMovementState`, `deltaSeconds`)
- **Constants**: SCREAMING_SNAKE_CASE (`GAME_WIDTH`, `PLAYER_SPEED`)
- All new numeric values should go in `constants.js`, not inline
- Movement/physics logic goes in `src/systems/`, not in entities or scenes
- Each scene should implement `init()`, `update(deltaSeconds)`, and `destroy()`

## Key files to know

| File | Purpose |
|------|---------|
| `vite.config.js` | `base` path must match GitHub repo name for Pages |
| `.github/workflows/deploy.yml` | Auto-deploys to GitHub Pages on push to `main` |
| `index.html` | Must have `<div id="app">` for the canvas mount point |

## Adding new features

- **New entity**: Create class in `src/entities/`, use constants from `utils/constants.js`
- **New system**: Create in `src/systems/`, export pure functions that take entity + state args
- **New scene**: Create in `src/scenes/`, follow `GameScene` pattern (init/update/destroy)
- **Assets**: Place sprites in `assets/sprites/`, sounds in `assets/sounds/`
