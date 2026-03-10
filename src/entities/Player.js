import { Graphics } from 'pixi.js';
import { PLAYER_COLOR, PLAYER_RADIUS, PLAYER_SPEED } from '../utils/constants.js';

export class Player {
  constructor() {
    this.speed = PLAYER_SPEED;
    this.radius = PLAYER_RADIUS;

    // The visible shape (a simple circle)
    this.view = new Graphics();
    this.draw();
  }

  draw() {
    this.view.clear();
    this.view.circle(0, 0, this.radius);
    this.view.fill({ color: PLAYER_COLOR });
  }

  setPosition(x, y) {
    this.view.position.set(x, y);
  }

  get x() {
    return this.view.x;
  }

  get y() {
    return this.view.y;
  }

  set x(value) {
    this.view.x = value;
  }

  set y(value) {
    this.view.y = value;
  }
}
