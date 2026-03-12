/**
 * Isometric Player entity.
 * Movement is stored as (gridCol, gridRow) floats.
 * Screen position is derived using gridToScreen().
 *
 * Isometric movement mapping:
 *   Up arrow    → row-1 (move NW visually)
 *   Down arrow  → row+1 (move SE visually)
 *   Left arrow  → col-1 (move SW visually)
 *   Right arrow → col+1 (move NE visually)
 */

import { Container } from 'pixi.js';
import {
  PLAYER_SPEED,
  PLAYER_SCALE,
  MAP_COLS,
  MAP_ROWS,
} from '../utils/constants.js';
import {
  loadCharacterAnimations,
  createAnimatedSprite,
  resolveAnimation,
} from '../systems/animation.js';
import { isPassable, getSpeedMultiplier } from '../systems/collision.js';
import { gridToScreen } from '../systems/iso.js';

// Speed in grid-tiles per second (player moves ~5.4 tiles/sec at 260 px/s with 48px tiles)
const GRID_SPEED = PLAYER_SPEED / 48;

export default class Player {
  constructor(characterType, characterName) {
    this.characterType = characterType;
    this.characterName = characterName;
    this.speed = GRID_SPEED;
    this.facing = 'down';
    this.currentAnimKey = null;
    this.animations = null;
    this.sprite = null;
    this.view = new Container();

    // Grid position (floats)
    this.gridCol = 0;
    this.gridRow = 0;
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
    // Anchor at bottom-center so feet are at tile center
    this.sprite.anchor.set(0.5, 1.0);
    this.view.addChild(this.sprite);
    this.currentAnimKey = key;
  }

  update(dirs, worldMap, deltaSeconds) {
    const { animKey, facing, moving } = resolveAnimation(dirs, this.facing);
    this.facing = facing;
    this._setAnimation(animKey);

    if (moving) {
      let dc = 0;
      let dr = 0;
      if (dirs.up) dr -= 1;
      if (dirs.down) dr += 1;
      if (dirs.left) dc -= 1;
      if (dirs.right) dc += 1;

      if (dc !== 0 && dr !== 0) {
        const inv = 1 / Math.SQRT2;
        dc *= inv;
        dr *= inv;
      }

      // Speed multiplier from tile type
      const currentCol = Math.floor(this.gridCol);
      const currentRow = Math.floor(this.gridRow);
      const speedMult = getSpeedMultiplier(currentCol, currentRow, worldMap);

      const moveC = dc * this.speed * speedMult * deltaSeconds;
      const moveR = dr * this.speed * speedMult * deltaSeconds;

      const newCol = this.gridCol + moveC;
      const newRow = this.gridRow + moveR;

      // Try X (col) movement
      if (isPassable(Math.floor(newCol), Math.floor(this.gridRow), worldMap)) {
        this.gridCol = newCol;
      }
      // Try Y (row) movement
      if (isPassable(Math.floor(this.gridCol), Math.floor(newRow), worldMap)) {
        this.gridRow = newRow;
      }
    }

    // Clamp to world bounds
    this.gridCol = Math.max(1, Math.min(MAP_COLS - 2, this.gridCol));
    this.gridRow = Math.max(1, Math.min(MAP_ROWS - 2, this.gridRow));

    // Convert grid position to screen position
    const screen = gridToScreen(this.gridCol, this.gridRow);
    this.view.x = screen.x;
    this.view.y = screen.y;
  }

  // Screen position (for camera tracking)
  get x() { return this.view.x; }
  set x(v) { /* no-op — position is driven by gridCol/gridRow */ }
  get y() { return this.view.y; }
  set y(v) { /* no-op — position is driven by gridCol/gridRow */ }

  // Set initial position in grid coordinates
  setGridPosition(col, row) {
    this.gridCol = col;
    this.gridRow = row;
    const screen = gridToScreen(col, row);
    this.view.x = screen.x;
    this.view.y = screen.y;
  }
}
