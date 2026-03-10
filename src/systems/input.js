/**
 * Unified input system — handles both keyboard and touch D-pad.
 * Replaces movement.js as the single source of directional input.
 */

const GAME_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
]);

/**
 * Creates a unified input state that merges keyboard + touch directions.
 * Returns { dirs, keys, onKeyDown, onKeyUp, setTouchDir, isTouchDevice }.
 *
 * `dirs` is the canonical read point: { up, down, left, right } booleans.
 * Both keyboard and touch write into this object each frame via `updateDirs()`.
 */
export function createInputState() {
  const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    KeyW: false, KeyA: false, KeyS: false, KeyD: false,
  };

  // Touch directions (set by D-pad)
  const touch = { up: false, down: false, left: false, right: false };

  // Merged directional state — read this in game loop
  const dirs = { up: false, down: false, left: false, right: false };

  function onKeyDown(e) {
    if (GAME_KEYS.has(e.code)) {
      e.preventDefault();
      keys[e.code] = true;
    }
  }

  function onKeyUp(e) {
    if (GAME_KEYS.has(e.code)) {
      e.preventDefault();
      keys[e.code] = false;
    }
  }

  /**
   * Set a touch direction on/off. Called by D-pad.
   * @param {'up'|'down'|'left'|'right'} dir
   * @param {boolean} active
   */
  function setTouchDir(dir, active) {
    touch[dir] = active;
  }

  /** Merge keyboard + touch into `dirs`. Call once per frame before reading dirs. */
  function updateDirs() {
    dirs.up = keys.ArrowUp || keys.KeyW || touch.up;
    dirs.down = keys.ArrowDown || keys.KeyS || touch.down;
    dirs.left = keys.ArrowLeft || keys.KeyA || touch.left;
    dirs.right = keys.ArrowRight || keys.KeyD || touch.right;
  }

  const isTouchDevice = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  return { dirs, keys, touch, onKeyDown, onKeyUp, setTouchDir, updateDirs, isTouchDevice };
}
