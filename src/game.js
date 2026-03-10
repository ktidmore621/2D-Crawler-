import { Application } from 'pixi.js';
import { BG_COLOR } from './utils/constants.js';
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
