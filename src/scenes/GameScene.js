import { Container } from 'pixi.js';
import { BG_COLOR } from '../utils/constants.js';
import Player from '../entities/Player.js';
import { createMovementState } from '../systems/movement.js';

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
    this.movementState = null;
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

    // Set up keyboard input
    this.movementState = createMovementState();
    this._onKeyDown = this.movementState.onKeyDown;
    this._onKeyUp = this.movementState.onKeyUp;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  update(deltaSeconds) {
    if (!this.player || !this.movementState) return;

    const keys = this.movementState.keys;
    const dirs = {
      up: keys.ArrowUp || keys.KeyW,
      down: keys.ArrowDown || keys.KeyS,
      left: keys.ArrowLeft || keys.KeyA,
      right: keys.ArrowRight || keys.KeyD,
    };

    const { width, height } = this.app.screen;
    this.player.update(dirs, width, height, deltaSeconds);
  }

  destroy() {
    if (this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
    this.container.destroy({ children: true });
  }
}
