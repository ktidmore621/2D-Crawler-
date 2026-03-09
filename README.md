# Beginner PixiJS 2D Game Starter

This project is the **simplest complete starter** for a beginner-friendly 2D game using:

- **PixiJS** (draw graphics in code)
- **Vite** (easy local server + build tool)
- **Plain JavaScript** (no TypeScript)

---

## 1) Project folder structure

Your project should look exactly like this:

```text
2D-Crawler-/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
├─ .gitignore
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.js
   └─ style.css
```

---

## 2) Files and what each file does

### `index.html`
This is the main webpage. It creates a `<div>` where PixiJS will place the game canvas.

### `src/main.js`
This is the game code:
- starts PixiJS
- draws one circular player object
- moves it automatically
- bounces it off screen edges
- changes direction when you tap/click

### `src/style.css`
This makes the game fill the whole screen and behave better on phones.

### `package.json`
This stores project info and commands like:
- `npm run dev` (run locally)
- `npm run build` (create production files)
- `npm run preview` (preview built version)

### `vite.config.js`
This sets the GitHub Pages path (`base`).

### `.github/workflows/deploy.yml`
This is automatic deployment. When you push to `main`, GitHub builds and publishes your game.

### `.gitignore`
This tells Git to ignore generated folders like `node_modules` and `dist`.

---

## 3) Complete code files

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>PixiJS Beginner Starter</title>
  </head>
  <body>
    <div id="game-root"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### `src/main.js`

```js
import './style.css';
import { Application, Graphics, Text } from 'pixi.js';

const app = new Application();

await app.init({
  resizeTo: window,
  background: '#08111f',
  antialias: true
});

document.getElementById('game-root').appendChild(app.canvas);

const player = new Graphics();
player.circle(0, 0, 28).fill('#34d399');
player.stroke({ width: 4, color: '#ffffff' });
player.x = app.screen.width / 2;
player.y = app.screen.height / 2;
app.stage.addChild(player);

const label = new Text({
  text: 'Player',
  style: {
    fill: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold'
  }
});
label.anchor.set(0.5, 0);
label.x = player.x;
label.y = player.y + 36;
app.stage.addChild(label);

const speed = {
  x: 3,
  y: 2.4
};
const playerRadius = 28;

app.ticker.add(() => {
  player.x += speed.x;
  player.y += speed.y;

  const leftWall = playerRadius;
  const rightWall = app.screen.width - playerRadius;
  const topWall = playerRadius;
  const bottomWall = app.screen.height - playerRadius;

  if (player.x < leftWall || player.x > rightWall) {
    speed.x *= -1;
  }

  if (player.y < topWall || player.y > bottomWall) {
    speed.y *= -1;
  }

  label.x = player.x;
  label.y = player.y + 36;
});

app.canvas.addEventListener('pointerdown', (event) => {
  const canvasArea = app.canvas.getBoundingClientRect();
  const targetX = event.clientX - canvasArea.left;
  const targetY = event.clientY - canvasArea.top;

  speed.x = (targetX - player.x) * 0.05;
  speed.y = (targetY - player.y) * 0.05;
});
```

### `src/style.css`

```css
:root {
  font-family: Arial, Helvetica, sans-serif;
  color: #ffffff;
  background: #08111f;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #08111f;
}

#game-root {
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
```

### `package.json`

```json
{
  "name": "pixi-2d-crawler-starter",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "pixi.js": "^8.2.6"
  },
  "devDependencies": {
    "vite": "^5.4.2"
  }
}
```

### `vite.config.js`

```js
import { defineConfig } from 'vite';

// IMPORTANT: change this if your repo name is different.
// Example: if repo is "my-game", use '/my-game/'
const repoBasePath = '/2D-Crawler-/';

export default defineConfig({
  base: repoBasePath
});
```

### `.gitignore`

```gitignore
node_modules
dist
.vscode
.DS_Store
```

### `.github/workflows/deploy.yml`

```yaml
name: Deploy Vite game to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 4) Local testing (step-by-step, beginner format)

> Good news: the earlier failures (`403` and browser crash) were environment-specific in the container, not proof your code is bad.

### Step A — Check your tools

1. **Command**

```bash
node -v
npm -v
git --version
```

2. **What you should see**
- Version numbers (for example `v20.x.x`).

3. **Common error**
- `node: command not found`

4. **Fix**
- Install Node.js LTS from https://nodejs.org, then close and reopen terminal.

---

### Step B — Install dependencies

1. **Command**

```bash
npm install
```

2. **What you should see**
- A success message like `added ... packages`.
- A new `node_modules` folder appears.

3. **Common error**
- Network/proxy/403 errors.

4. **Fix**
- Try a normal internet connection.
- If you are on company/school network, configure npm proxy or try a different network.

---

### Step C — Run local game server

1. **Command**

```bash
npm run dev
```

2. **What you should see**
- A URL like `http://localhost:5173/`
- In browser: dark background and a green moving circle labeled “Player”.

3. **Common error**
- `vite: not found`

4. **Fix**
- Run `npm install` first (Vite is installed from dependencies).

---

### Step D — Test on your phone

1. **Command**

```bash
npm run dev -- --host
```

2. **What you should see**
- A local network URL (for example `http://192.168.1.10:5173/`).

3. **Common error**
- Phone cannot open the URL.

4. **Fix**
- Make sure phone and computer are on the same Wi-Fi.
- Allow Node/Vite through firewall when prompted.

---

### Step E — Build production files

1. **Command**

```bash
npm run build
```

2. **What you should see**
- Build success output.
- New `dist/` folder.

3. **Common error**
- Build fails with dependency error.

4. **Fix**
- Delete `node_modules` and `package-lock.json`, then run `npm install` and `npm run build` again.

---

### Step F — Preview production build

1. **Command**

```bash
npm run preview
```

2. **What you should see**
- Preview URL (often `http://localhost:4173/`).
- Game looks same as dev mode.

3. **Common error**
- `dist` missing.

4. **Fix**
- Run `npm run build` first.

---

## 5) Push to GitHub (exact steps)

### If your repo already exists on GitHub

```bash
git add .
git commit -m "Set up beginner PixiJS starter with Pages workflow"
git push
```

### If this is a new repo

```bash
git init
git add .
git commit -m "Set up beginner PixiJS starter with Pages workflow"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Common error: `remote origin already exists`  
Fix: run `git remote set-url origin https://github.com/<your-username>/<your-repo>.git`

---

## 6) Publish to GitHub Pages (easiest path)

1. Push your code to `main`.
2. On GitHub: **Settings → Pages**.
3. In **Build and deployment**, set **Source = GitHub Actions**.
4. Wait for workflow **“Deploy Vite game to GitHub Pages”** to finish.
5. Your site URL appears in Pages settings.

Common error: blank page after deploy.  
Fix: make sure `vite.config.js` `repoBasePath` exactly matches your repository name.

---

## 7) Next tiny feature (when you are ready)

Next easiest upgrade: add **on-screen arrow buttons** for touch movement.  
If you want, I will do that in the next step with complete file updates.
