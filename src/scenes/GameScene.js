import { Container } from 'pixi.js';
import { BG_COLOR } from '../utils/constants.js';
import Player from '../entities/Player.js';
import { createInputState, updateStatusStrip } from '../systems/input.js';

export default class GameScene {
  /**
   * @param {import('pixi.js').Application} app
   * @param {string} characterType - 'male' | 'female' | 'androgynous'
   * @param {string} characterName - player-chosen name
   */
  constructor(app, characterType, characterName) {
    this.app = app;
    this.characterType = characterType;
    this.characterName = characterName;
    this.container = new Container();
    this.inputState = null;
    this.player = null;
  }

  async init() {
    const { width, height } = this.app.screen;
    this.app.renderer.background.color = BG_COLOR;
    this.app.stage.addChild(this.container);

    // Create and load player
    this.player = new Player(this.characterType, this.characterName);
    await this.player.load();
    this.player.x = width / 2;
    this.player.y = height / 2;
    this.container.addChild(this.player.view);

    // Set up unified input (keyboard + DOM D-pad + action buttons)
    this.inputState = createInputState();
    this._onKeyDown = this.inputState.onKeyDown;
    this._onKeyUp = this.inputState.onKeyUp;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    // Update the status strip with player name
    updateStatusStrip(this.characterName);
  }

  update(deltaSeconds) {
    if (!this.player || !this.inputState) return;

    // Merge keyboard + touch into dirs
    this.inputState.updateDirs();

    const { width, height } = this.app.screen;
    this.player.update(this.inputState.dirs, width, height, deltaSeconds);
  }

  destroy() {
    if (this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
    if (this.inputState && this.inputState.destroy) {
      this.inputState.destroy();
    }
    this.container.destroy({ children: true });
  }
}
