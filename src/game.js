import { Application } from 'pixi.js';
import { GameScene } from './scenes/GameScene.js';
import { GAME_HEIGHT, GAME_WIDTH, BACKGROUND_COLOR } from './utils/constants.js';

export async function bootstrapGame() {
  const app = new Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    background: BACKGROUND_COLOR,
    antialias: true,
    resizeTo: window,
  });

  const appElement = document.getElementById('app');
  if (!appElement) {
    throw new Error('Missing #app element in index.html');
  }
  appElement.appendChild(app.canvas);

  // Scene setup
  const scene = new GameScene(app);
  scene.init();

  // Main game loop (runs every frame)
  app.ticker.add((ticker) => {
    const deltaSeconds = ticker.deltaMS / 1000;
    scene.update(deltaSeconds);
  });
}
