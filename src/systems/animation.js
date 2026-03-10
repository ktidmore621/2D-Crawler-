import { Spritesheet, AnimatedSprite, Assets } from 'pixi.js';
import { PLAYER_ANIM_SPEED } from '../utils/constants.js';

/**
 * Build the asset path for a character sprite atlas.
 * @param {string} type  - 'male' | 'female' | 'androgynous'
 * @param {string} action - 'idle' | 'walk' | 'run' | 'attack' | etc.
 * @returns {string} path to the JSON atlas (Vite serves from project root)
 */
export function atlasPath(type, action) {
  return `assets/sprites/${type}/${type}_${action}.json`;
}

/**
 * Load a spritesheet atlas and return the parsed Spritesheet.
 * Caches via PixiJS Assets so repeated calls are instant.
 */
export async function loadAtlas(type, action) {
  const path = atlasPath(type, action);
  const sheet = await Assets.load(path);
  return sheet;
}

/**
 * Load all atlases needed for gameplay (idle + walk) for a character type.
 * Returns a map of animation name → texture array.
 * Keys: idle_down, idle_up, idle_left, idle_right,
 *       walk_down, walk_up, walk_left, walk_right
 */
export async function loadCharacterAnimations(type) {
  const [idleSheet, walkSheet] = await Promise.all([
    loadAtlas(type, 'idle'),
    loadAtlas(type, 'walk'),
  ]);

  const anims = {};

  // Merge animations from both sheets
  for (const [name, textures] of Object.entries(idleSheet.animations)) {
    anims[name] = textures;
  }
  for (const [name, textures] of Object.entries(walkSheet.animations)) {
    anims[name] = textures;
  }

  return anims;
}

/**
 * Create an AnimatedSprite from a texture array, configured with defaults.
 */
export function createAnimatedSprite(textures) {
  const sprite = new AnimatedSprite(textures);
  sprite.animationSpeed = PLAYER_ANIM_SPEED;
  sprite.anchor.set(0.5, 0.75);
  sprite.loop = true;
  sprite.play();
  return sprite;
}

/**
 * Determine which animation key to use based on movement state.
 * @param {{ up: boolean, down: boolean, left: boolean, right: boolean }} dirs
 * @param {string} currentFacing - last facing direction ('down','up','left','right')
 * @returns {{ animKey: string, facing: string, moving: boolean }}
 */
export function resolveAnimation(dirs, currentFacing) {
  const moving = dirs.up || dirs.down || dirs.left || dirs.right;

  let facing = currentFacing;
  if (dirs.down) facing = 'down';
  else if (dirs.up) facing = 'up';
  else if (dirs.left) facing = 'left';
  else if (dirs.right) facing = 'right';

  const prefix = moving ? 'walk' : 'idle';
  return { animKey: `${prefix}_${facing}`, facing, moving };
}
