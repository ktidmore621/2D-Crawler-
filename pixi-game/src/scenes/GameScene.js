import { Container } from 'pixi.js';
import { Player } from '../entities/Player.js';
import { createMovementState, updatePlayerMovement } from '../systems/movement.js';

export class GameScene {
  constructor(app) {
    this.app = app;
    this.container = new Container();
    this.player = null;
    this.movementState = createMovementState();
  }

  init() {
    this.app.stage.addChild(this.container);

    this.player = new Player();
    this.player.setPosition(this.app.screen.width / 2, this.app.screen.height / 2);
    this.container.addChild(this.player.view);

    // Listen for keyboard input
    window.addEventListener('keydown', (event) => this.movementState.onKeyDown(event));
    window.addEventListener('keyup', (event) => this.movementState.onKeyUp(event));
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
}
