import { Application, Graphics, Text, TextStyle } from 'pixi.js';
import { BG_COLOR } from './utils/constants.js';
import { initTextureCache } from './systems/textureCache.js';
import MenuScene from './scenes/MenuScene.js';
import CharSelectScene from './scenes/CharSelectScene.js';
import GameScene from './scenes/GameScene.js';

export async function bootstrapGame() {
  const appEl = document.getElementById('app');
  if (!appEl) throw new Error('Missing #app element in DOM');

  // The canvas sizes to the game-screen viewport, not the full window
  const gameScreen = document.getElementById('game-screen');
  const rect = gameScreen.getBoundingClientRect();

  const app = new Application();

  await app.init({
    width: Math.floor(rect.width),
    height: Math.floor(rect.height),
    backgroundColor: BG_COLOR,
    antialias: true,
    resizeTo: gameScreen,
  });

  appEl.appendChild(app.canvas);

  // ── Loading screen ──
  await showLoadingScreen(app);

  let currentScene = null;

  async function switchScene(SceneClass, ...args) {
    if (currentScene) {
      currentScene.destroy();
      app.stage.removeChildren();
      currentScene = null;
    }
    const scene = new SceneClass(app, ...args);
    await scene.init();
    currentScene = scene;
  }

  function startMenu() {
    switchScene(MenuScene, () => {
      // PLAY clicked → go to character select
      switchScene(CharSelectScene, (characterType, characterName) => {
        // BEGIN clicked → go to game
        switchScene(GameScene, characterType, characterName);
      });
    });
  }

  startMenu();

  app.ticker.add((ticker) => {
    const deltaSeconds = ticker.deltaMS / 1000;
    if (currentScene && currentScene.update) {
      currentScene.update(deltaSeconds);
    }
  });
}

/**
 * Show a loading screen while preloading all sprite assets.
 * Dark background with "LOADING..." text and a progress bar.
 */
async function showLoadingScreen(app) {
  const { width, height } = app.screen;
  const gfx = new Graphics();

  // Dark background
  gfx.rect(0, 0, width, height);
  gfx.fill(0x0a0805);

  // "CRAWL CRAFT" title
  const titleStyle = new TextStyle({
    fontFamily: '"Pirata One", serif',
    fontSize: Math.min(48, width * 0.12),
    fill: '#c07a2a',
    letterSpacing: 3,
    dropShadow: { color: '#000000', blur: 4, distance: 2, alpha: 0.6 },
  });
  const titleText = new Text({ text: 'CRAWL CRAFT', style: titleStyle });
  titleText.anchor.set(0.5, 0.5);
  titleText.x = width / 2;
  titleText.y = height / 2 - 60;

  // "LOADING..." text
  const loadingStyle = new TextStyle({
    fontFamily: '"Rajdhani", sans-serif',
    fontSize: 18,
    fill: '#c07a2a',
    letterSpacing: 6,
  });
  const loadingText = new Text({ text: 'LOADING\u2026', style: loadingStyle });
  loadingText.anchor.set(0.5, 0.5);
  loadingText.x = width / 2;
  loadingText.y = height / 2 - 10;

  // Progress bar background
  const barW = Math.min(260, width * 0.6);
  const barH = 8;
  const barX = (width - barW) / 2;
  const barY = height / 2 + 10;

  const progressBar = new Graphics();
  progressBar.rect(barX - 1, barY - 1, barW + 2, barH + 2);
  progressBar.fill(0x3a3020);

  const progressFill = new Graphics();

  app.stage.addChild(gfx);
  app.stage.addChild(titleText);
  app.stage.addChild(loadingText);
  app.stage.addChild(progressBar);
  app.stage.addChild(progressFill);

  // Preload all sprite sheets with progress callback
  await initTextureCache((progress) => {
    progressFill.clear();
    const fillW = barW * progress;
    if (fillW > 0) {
      progressFill.rect(barX, barY, fillW, barH);
      progressFill.fill(0xc07a2a);
    }
  });

  // Remove loading screen elements
  app.stage.removeChild(gfx);
  app.stage.removeChild(titleText);
  app.stage.removeChild(loadingText);
  app.stage.removeChild(progressBar);
  app.stage.removeChild(progressFill);
  gfx.destroy();
  titleText.destroy();
  loadingText.destroy();
  progressBar.destroy();
  progressFill.destroy();
}
