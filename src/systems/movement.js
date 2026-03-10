const GAME_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
]);

/**
 * Creates keyboard input tracking state.
 * Returns an object with key state and event handlers.
 */
export function createMovementState() {
  const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    KeyW: false, KeyA: false, KeyS: false, KeyD: false,
  };

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

  return { keys, onKeyDown, onKeyUp };
}
