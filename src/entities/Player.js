/**
 * Isometric Player entity.
 * Movement is stored as (gridCol, gridRow) floats.
 * Screen position is derived using gridToScreen().
 *
 * D-pad directions map to screen-space movement:
 *   Up arrow    → straight up on screen
 *   Down arrow  → straight down on screen
 *   Left arrow  → straight left on screen
 *   Right arrow → straight right on screen
 *
 * Screen deltas are converted to isometric grid deltas via the
 * inverse of gridToScreen() so the player moves along screen axes.
 */

import { Container } from 'pixi.js';
import {
  PLAYER_SPEED,
  PLAYER_SCALE,
  ISO_TILE_W,
  ISO_TILE_H,
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

export default class Player {
  constructor(characterType, characterName) {
    this.characterType = characterType;
    this.characterName = characterName;
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
      // Screen-space input: d-pad maps directly to screen axes
      let inputX = 0;
      let inputY = 0;
      if (dirs.left)  inputX -= 1;
      if (dirs.right) inputX += 1;
      if (dirs.up)    inputY -= 1;
      if (dirs.down)  inputY += 1;

      // Normalize diagonal so speed is consistent in all directions
      const len = Math.sqrt(inputX * inputX + inputY * inputY);
      if (len > 0) { inputX /= len; inputY /= len; }

      // Speed multiplier from tile type
      const currentCol = Math.floor(this.gridCol);
      const currentRow = Math.floor(this.gridRow);
      const speedMult = getSpeedMultiplier(currentCol, currentRow, worldMap);

      // Screen-space movement
      const speed = PLAYER_SPEED * speedMult * deltaSeconds;
      const screenDX = inputX * speed;
      const screenDY = inputY * speed;

      // Convert screen delta to isometric grid delta
      // Derived from inverse of gridToScreen():
      //   screenX = (col - row) * (ISO_TILE_W / 2)
      //   screenY = (col + row) * (ISO_TILE_H / 2)
      const dCol = (screenDX / (ISO_TILE_W / 2) + screenDY / (ISO_TILE_H / 2)) / 2;
      const dRow = (screenDY / (ISO_TILE_H / 2) - screenDX / (ISO_TILE_W / 2)) / 2;

      // Apply with collision — try each axis independently for wall sliding
      const newCol = this.gridCol + dCol;
      const newRow = this.gridRow + dRow;

      if (isPassable(Math.floor(newCol), Math.floor(this.gridRow), worldMap)) {
        this.gridCol = newCol;
      }
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
