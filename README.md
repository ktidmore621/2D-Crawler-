# 2D Crawler

A 2D game built with **PixiJS 8**, **Vite**, and plain **JavaScript**.

## Features

- Scene / entity / system architecture
- Keyboard movement (Arrow keys + WASD)
- Player boundary clamping
- GitHub Pages deployment via GitHub Actions

## Project structure

```
2D-Crawler-/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js            # Entry point
│   ├── game.js            # PixiJS app bootstrap
│   ├── entities/
│   │   └── Player.js      # Player entity
│   ├── scenes/
│   │   └── GameScene.js   # Scene manager
│   ├── systems/
│   │   └── movement.js    # Input + physics
│   └── utils/
│       └── constants.js   # Shared constants
├── assets/
│   ├── sprites/
│   └── sounds/
└── .github/
    └── workflows/
        └── deploy.yml
```

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` and move the player with arrow keys or WASD.

## Build & deploy

```bash
npm run build      # Production build → dist/
npm run preview    # Preview the build locally
```

Pushing to `main` auto-deploys to GitHub Pages via the Actions workflow.

**Note:** The `base` path in `vite.config.js` must match your repo name for Pages to work.
