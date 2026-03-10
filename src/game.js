import { Application } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, BG_COLOR } from './utils/constants.js';
import MenuScene from './scenes/MenuScene.js';
import CharSelectScene from './scenes/CharSelectScene.js';
import GameScene from './scenes/GameScene.js';

export async function bootstrapGame() {
  const app = new Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: BG_COLOR,
    antialias: true,
    resizeTo: window,
  });

  const appEl = document.getElementById('app');
  if (!appEl) throw new Error('Missing #app element in DOM');
  appEl.appendChild(app.canvas);

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
