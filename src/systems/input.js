/**
 * Unified input system — handles keyboard, DOM D-pad, and action buttons.
 * Single source of truth for all directional + action input.
 *
 * ── Button Convention (Nintendo / Game Boy style) ──────────────
 *   A  (right)  = CONFIRM / ATTACK   — keyboard: Z
 *   B  (bottom) = CANCEL  / ROLL     — keyboard: X
 *   X  (left)   = HOTBAR             — keyboard: C
 *   Y  (top)    = MAP                — keyboard: M
 *
 * Every screen must follow this convention:
 *   • A = confirm / interact / select
 *   • B = cancel / back / close
 * ───────────────────────────────────────────────────────────────
 */

/**
 * Named button constants — import these instead of hardcoding positions.
 */
export const BUTTONS = {
  A: 'attack',   // right — confirm / attack
  B: 'roll',     // bottom — cancel / roll
  X: 'hotbar',   // left — hotbar
  Y: 'map',      // top — map
};

const GAME_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'KeyZ', 'KeyX', 'KeyC', 'KeyM',
  'Escape',
]);

/**
 * Creates a unified input state that merges keyboard + touch directions.
 * Also wires up DOM D-pad buttons and action buttons from #control-panel.
 */
export function createInputState() {
  const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    KeyW: false, KeyA: false, KeyS: false, KeyD: false,
    KeyZ: false, KeyX: false, KeyC: false, KeyM: false,
    Escape: false,
  };

  // Touch directions (set by D-pad)
  const touch = { up: false, down: false, left: false, right: false };

  // Merged directional state — read this in game loop
  const dirs = { up: false, down: false, left: false, right: false };

  // Action listeners: map of action name → Set of callbacks
  const _actionListeners = {};

  function onKeyDown(e) {
    if (GAME_KEYS.has(e.code)) {
      e.preventDefault();
      keys[e.code] = true;

      // Action keyboard shortcuts
      if (e.code === 'KeyZ') emitAction(BUTTONS.A);      // Z = attack (A / confirm)
      if (e.code === 'KeyX') emitAction(BUTTONS.B);      // X = roll (B / cancel)
      if (e.code === 'KeyC') emitAction(BUTTONS.X);      // C = hotbar
      if (e.code === 'KeyM') emitAction(BUTTONS.Y);      // M = map
      if (e.code === 'Escape') emitAction(BUTTONS.B);    // Escape = cancel (same as B)
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

  // ── Wire up DOM D-pad buttons ──
  const dpadCleanups = [];
  const dpadBtns = document.querySelectorAll('.dpad-btn[data-dir]');
  for (const btn of dpadBtns) {
    const dir = btn.dataset.dir;
    const activate = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('pressed');
      setTouchDir(dir, true);
    };
    const deactivate = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      btn.classList.remove('pressed');
      setTouchDir(dir, false);
    };
    btn.addEventListener('pointerdown', activate);
    btn.addEventListener('pointerup', deactivate);
    btn.addEventListener('pointerleave', deactivate);
    btn.addEventListener('pointercancel', deactivate);
    dpadCleanups.push(() => {
      btn.removeEventListener('pointerdown', activate);
      btn.removeEventListener('pointerup', deactivate);
      btn.removeEventListener('pointerleave', deactivate);
      btn.removeEventListener('pointercancel', deactivate);
    });
  }

  // ── Wire up DOM Action buttons ──
  const actionCleanups = [];
  const actionBtns = document.querySelectorAll('.action-btn[data-action]');
  for (const btn of actionBtns) {
    const action = btn.dataset.action;
    const onPress = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('pressed');
      emitAction(action);
    };
    const onRelease = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      btn.classList.remove('pressed');
    };
    btn.addEventListener('pointerdown', onPress);
    btn.addEventListener('pointerup', onRelease);
    btn.addEventListener('pointerleave', onRelease);
    btn.addEventListener('pointercancel', onRelease);
    actionCleanups.push(() => {
      btn.removeEventListener('pointerdown', onPress);
      btn.removeEventListener('pointerup', onRelease);
      btn.removeEventListener('pointerleave', onRelease);
      btn.removeEventListener('pointercancel', onRelease);
    });
  }

  /** Emit a named action event — notifies all registered listeners */
  function emitAction(name) {
    const listeners = _actionListeners[name];
    if (listeners) {
      for (const fn of listeners) fn(name);
    }
  }

  /**
   * Register a callback for a named action (e.g. BUTTONS.A).
   * Returns an unsubscribe function.
   */
  function onAction(name, callback) {
    if (!_actionListeners[name]) _actionListeners[name] = new Set();
    _actionListeners[name].add(callback);
    return () => _actionListeners[name].delete(callback);
  }

  /** Clean up all event listeners */
  function destroy() {
    for (const fn of dpadCleanups) fn();
    for (const fn of actionCleanups) fn();
    dpadCleanups.length = 0;
    actionCleanups.length = 0;
    // Clear all action listeners
    for (const key of Object.keys(_actionListeners)) {
      _actionListeners[key].clear();
    }
  }

  return {
    dirs, keys, touch,
    onKeyDown, onKeyUp, setTouchDir, updateDirs,
    isTouchDevice, emitAction, onAction, destroy,
  };
}

/**
 * Update the status strip in the control panel.
 * @param {string} name - Player name
 * @param {number} healthPct - 0–1
 * @param {number} staminaPct - 0–1
 */
export function updateStatusStrip(name, healthPct = 1, staminaPct = 1) {
  const nameEl = document.getElementById('status-player-name');
  const healthEl = document.getElementById('health-bar');
  const staminaEl = document.getElementById('stamina-bar');
  if (nameEl) nameEl.textContent = name || 'SURVIVOR';
  if (healthEl) healthEl.style.width = `${Math.round(healthPct * 100)}%`;
  if (staminaEl) staminaEl.style.width = `${Math.round(staminaPct * 100)}%`;
}
