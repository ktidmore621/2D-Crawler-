import { Container } from 'pixi.js';
import {
  PLAYER_SPEED,
  PLAYER_SCALE,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  WORLD_TILE_SIZE,
} from '../utils/constants.js';
import {
  loadCharacterAnimations,
  createAnimatedSprite,
  resolveAnimation,
} from '../systems/animation.js';
import { isPositionPassable, getSpeedMultiplier } from '../systems/collision.js';
import { getElevationAtPixel, getElevationYOffset } from '../systems/elevation.js';

export default class Player {
  constructor(characterType, characterName) {
    this.characterType = characterType;
    this.characterName = characterName;
    this.speed = PLAYER_SPEED;
    this.facing = 'down';
    this.currentAnimKey = null;
    this.animations = null;
    this.sprite = null;
    this.view = new Container();
    this._elevationOffset = 0;
  }

  async load() {
    this.animations = await loadCharacterAnimations(this.characterType);
    this._setAnimation('idle_down');
  }

  _setAnimation(key) {
    if (this.currentAnimKey === key) return;
    const textures = this.animations[key];
    if (!textures) return;

    if (this.sprite) {
      this.view.removeChild(this.sprite);
      this.sprite.destroy();
    }

    this.sprite = createAnimatedSprite(textures);
    this.sprite.scale.set(PLAYER_SCALE);
    this.view.addChild(this.sprite);
    this.currentAnimKey = key;
  }

  update(dirs, worldMap, deltaSeconds) {
    const { animKey, facing, moving } = resolveAnimation(dirs, this.facing);
    this.facing = facing;
    this._setAnimation(animKey);

    if (moving) {
      let dx = 0;
      let dy = 0;
      if (dirs.left) dx -= 1;
      if (dirs.right) dx += 1;
      if (dirs.up) dy -= 1;
      if (dirs.down) dy += 1;

      if (dx !== 0 && dy !== 0) {
        const inv = 1 / Math.SQRT2;
        dx *= inv;
        dy *= inv;
      }

      // Get speed multiplier for current tile (shallow water, flooded floor etc.)
      const feetOffsetY = 8;
      const speedMult = getSpeedMultiplier(this.x, this.y + feetOffsetY, worldMap);

      const moveX = dx * this.speed * speedMult * deltaSeconds;
      const moveY = dy * this.speed * speedMult * deltaSeconds;

      const newX = this.x + moveX;
      const newY = this.y + moveY;

      if (isPositionPassable(newX, this.y + feetOffsetY, worldMap)) {
        this.x = newX;
      }
      if (isPositionPassable(this.x, newY + feetOffsetY, worldMap)) {
        this.y = newY;
      }
    }

    // Clamp to world bounds
    const margin = WORLD_TILE_SIZE;
    this.x = Math.max(margin, Math.min(WORLD_WIDTH - margin, this.x));
    this.y = Math.max(margin, Math.min(WORLD_HEIGHT - margin, this.y));

    // Apply elevation visual offset
    const elev = getElevationAtPixel(this.x, this.y + 8);
    const targetOffset = getElevationYOffset(elev);
    this._elevationOffset = targetOffset;
    if (this.sprite) {
      this.sprite.y = this._elevationOffset;
    }
  }

  get x() { return this.view.x; }
  set x(v) { this.view.x = v; }
  get y() { return this.view.y; }
  set y(v) { this.view.y = v; }
}
