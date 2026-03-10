import { Container, Text } from 'pixi.js';
import {
  PLAYER_SPEED,
  PLAYER_SCALE,
  PLAYER_NAME_FONT_SIZE,
  PLAYER_NAME_OFFSET_Y,
  PLAYER_ANIM_SPEED,
} from '../utils/constants.js';
import {
  loadCharacterAnimations,
  createAnimatedSprite,
  resolveAnimation,
} from '../systems/animation.js';

export default class Player {
  /**
   * @param {string} characterType - 'male' | 'female' | 'androgynous'
   * @param {string} characterName - player-chosen display name
   */
  constructor(characterType, characterName) {
    this.characterType = characterType;
    this.characterName = characterName;
    this.speed = PLAYER_SPEED;
    this.facing = 'down';
    this.currentAnimKey = null;

    /** @type {Object<string, import('pixi.js').Texture[]>} */
    this.animations = null;

    /** @type {import('pixi.js').AnimatedSprite} */
    this.sprite = null;

    /** Root container — position this to move the player */
    this.view = new Container();

    // Name label
    this.nameLabel = new Text({
      text: characterName,
      style: {
        fontFamily: 'Pirata One, serif',
        fontSize: PLAYER_NAME_FONT_SIZE,
        fill: '#e8d5b0',
        align: 'center',
      },
    });
    this.nameLabel.anchor.set(0.5, 1);
    this.nameLabel.y = PLAYER_NAME_OFFSET_Y;
    this.view.addChild(this.nameLabel);
  }

  /**
   * Load sprite sheets and create the initial animated sprite.
   * Must be awaited before the player is usable.
   */
  async load() {
    this.animations = await loadCharacterAnimations(this.characterType);
    this._setAnimation('idle_down');
  }

  /** Switch to a named animation if not already playing it. */
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
    this.view.addChildAt(this.sprite, 0); // behind name label
    this.currentAnimKey = key;
  }

  /**
   * Called each frame with directional booleans and delta.
   * Handles movement + animation switching.
   */
  update(dirs, boundsWidth, boundsHeight, deltaSeconds) {
    // Resolve animation
    const { animKey, facing, moving } = resolveAnimation(dirs, this.facing);
    this.facing = facing;
    this._setAnimation(animKey);

    // Move
    if (moving) {
      let dx = 0;
      let dy = 0;
      if (dirs.left) dx -= 1;
      if (dirs.right) dx += 1;
      if (dirs.up) dy -= 1;
      if (dirs.down) dy += 1;

      // Normalize diagonal
      if (dx !== 0 && dy !== 0) {
        const inv = 1 / Math.SQRT2;
        dx *= inv;
        dy *= inv;
      }

      this.x += dx * this.speed * deltaSeconds;
      this.y += dy * this.speed * deltaSeconds;
    }

    // Clamp to bounds
    const halfW = (this.sprite.width) / 2;
    const halfH = (this.sprite.height) / 4; // anchor is at 0.75
    this.x = Math.max(halfW, Math.min(boundsWidth - halfW, this.x));
    this.y = Math.max(halfH, Math.min(boundsHeight - halfH, this.y));
  }

  get x() { return this.view.x; }
  set x(v) { this.view.x = v; }
  get y() { return this.view.y; }
  set y(v) { this.view.y = v; }
}
