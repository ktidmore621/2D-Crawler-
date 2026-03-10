# PixiJS Beginner Starter (Vite + JavaScript)

This is a beginner-friendly starter project for a simple 2D game using **PixiJS**.

It includes:
- A clean folder structure (scene / entity / system)
- One player shape drawn in code (no art files needed)
- Keyboard movement (Arrow keys + WASD)
- Player boundary limits (cannot leave screen)
- GitHub Pages deployment with GitHub Actions

---

## 1) Local setup (run on your computer)

### Prerequisites
- Install **Node.js LTS** (version 18 or newer, 20 recommended): https://nodejs.org/
- Install **Git**: https://git-scm.com/

### Commands
Open a terminal in the `pixi-game` folder, then run:

```bash
npm install
npm run dev
```

### What you should expect
- `npm install` downloads project dependencies.
- `npm run dev` starts a local server.
- Terminal should show a URL like:
  - `http://localhost:5173/`
- Open that URL in your browser.
- You should see a dark screen with a green circle in the center.
- Move it with **Arrow keys** or **W A S D**.

---

## 2) Common local errors and fixes

### Error: `npm: command not found`
**Cause:** Node.js is not installed.
**Fix:** Install Node.js from https://nodejs.org/ and restart terminal.

### Error: `EACCES` permission issues (Linux/macOS)
**Cause:** npm/global permissions.
**Fix:** Use Node Version Manager (nvm) and reinstall Node via nvm.

### Error: `Port 5173 is already in use`
**Cause:** Another app uses that port.
**Fix:**
- Stop the other app, or
- Run `npm run dev -- --port 4173` and open the new URL.

### Browser shows blank page
**Cause:** Usually a console/runtime error.
**Fix:**
1. Open browser DevTools Console.
2. Check for red errors.
3. Confirm you started from `pixi-game` folder.
4. Re-run:
   ```bash
   npm install
   npm run dev
   ```

---

## 3) Project structure

```text
pixi-game/
├─ index.html
├─ package.json
├─ vite.config.js
├─ README.md
├─ src/
│  ├─ main.js
│  ├─ game.js
│  ├─ scenes/
│  │  └─ GameScene.js
│  ├─ entities/
│  │  └─ Player.js
│  ├─ systems/
│  │  └─ movement.js
│  └─ utils/
│     └─ constants.js
├─ assets/
│  ├─ sprites/
│  └─ sounds/
└─ .github/
   └─ workflows/
      └─ deploy.yml
```

---

## 4) How to push to GitHub

From the repository root (one level above `pixi-game`), run:

```bash
git init
git add .
git commit -m "Create beginner PixiJS starter"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Replace `<your-username>` and `<your-repo>` with your real GitHub values.

---

## 5) How to publish with GitHub Pages

1. Push your code to the `main` branch.
2. In GitHub, open your repo.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Source: GitHub Actions**.
5. Wait for workflow **Deploy to GitHub Pages** to finish.
6. Your site URL appears on the Pages screen.

---

## 6) Why `vite.config.js` has a `base` setting

This project uses:

```js
base: '/2D-Crawler-/'
```

That must match your GitHub repo name for Pages to load correctly.

If your repo is named differently, update that string.
Example: repo `my-pixi-game` should use:

```js
base: '/my-pixi-game/'
```

---

## 7) Build for production

```bash
npm run build
npm run preview
```

- `build` creates optimized files in `dist/`
- `preview` lets you test the production build locally

---

## 8) Next small feature to add

Best next step: **Add simple touch buttons for phone controls** (left, right, up, down) so mobile players can move without a keyboard.
