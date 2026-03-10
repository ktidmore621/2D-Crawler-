import { Container } from 'pixi.js';
import { BG_COLOR } from '../utils/constants.js';
import Player from '../entities/Player.js';
import { createInputState } from '../systems/input.js';
import { createDpad, positionDpad } from '../systems/dpad.js';

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
    this.dpad = null;
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

    // Set up unified input (keyboard + touch)
    this.inputState = createInputState();
    this._onKeyDown = this.inputState.onKeyDown;
    this._onKeyUp = this.inputState.onKeyUp;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    // If touch device, add D-pad
    if (this.inputState.isTouchDevice) {
      this.dpad = createDpad(this.inputState.setTouchDir);
      positionDpad(this.dpad, width, height);
      this.container.addChild(this.dpad);
    }
  }

  update(deltaSeconds) {
    if (!this.player || !this.inputState) return;

    // Merge keyboard + touch into dirs
    this.inputState.updateDirs();

    const { width, height } = this.app.screen;

    // Reposition D-pad on resize
    if (this.dpad) {
      positionDpad(this.dpad, width, height);
    }

    this.player.update(this.inputState.dirs, width, height, deltaSeconds);
  }

  destroy() {
    if (this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
    this.container.destroy({ children: true });
  }
}
