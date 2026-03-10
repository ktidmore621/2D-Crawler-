import { Container } from 'pixi.js';
import { Player } from '../entities/Player.js';
import { createMovementState, updatePlayerMovement } from '../systems/movement.js';

export class GameScene {
  constructor(app) {
    this.app = app;
    this.container = new Container();
    this.player = null;
    this.movementState = createMovementState();
    this._boundKeyDown = null;
    this._boundKeyUp = null;
  }

  init() {
    this.app.stage.addChild(this.container);

    this.player = new Player();
    this.player.setPosition(this.app.screen.width / 2, this.app.screen.height / 2);
    this.container.addChild(this.player.view);

    // Listen for keyboard input (store refs for cleanup)
    this._boundKeyDown = (event) => this.movementState.onKeyDown(event);
    this._boundKeyUp = (event) => this.movementState.onKeyUp(event);
    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);
  }

  update(deltaSeconds) {
    updatePlayerMovement({
      player: this.player,
      movementState: this.movementState,
      boundsWidth: this.app.screen.width,
      boundsHeight: this.app.screen.height,
      deltaSeconds,
    });
  }

  destroy() {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup', this._boundKeyUp);
    this.container.destroy({ children: true });
  }
}
